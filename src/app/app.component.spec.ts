import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { DataItem, DataChild, IDataItem } from './data.model';
import { MockWorker } from "./testing/mock-worker";

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockWorker: MockWorker;

  // Mock data factory
  const createMockDataItem = (id: string): IDataItem => ({
    id,
    int: 100,
    float: 10.5,
    color: 'red',
    child: {
      id: `child-${id}`,
      color: 'blue'
    }
  });

  beforeEach(() => {
    mockWorker = new MockWorker();
    jest.spyOn(window as any, 'Worker')
      .mockImplementation(() => mockWorker);
  });

  beforeEach(async () => {
    // Mock the Worker
    (window as any).Worker = MockWorker;

    await TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      imports: [ ReactiveFormsModule ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      expect(component.isStreaming).toBeFalsy();
      expect(component.displayedItems).toEqual([]);
      expect(component.configForm.get('timer')?.value).toBe(300);
      expect(component.configForm.get('arraySize')?.value).toBe(1000);
      expect(component.configForm.get('additionalIds')?.value).toBe('956, 998, 970');
    });

    it('should have form inputs enabled when not streaming', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const inputs = compiled.querySelectorAll('input');

      inputs.forEach((input: HTMLInputElement) => {
        expect(input.disabled).toBeFalsy();
      });
    });
  });

  describe('Stream Controls', () => {
    it('should toggle streaming state when clicking start/stop button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const startStopBtn = compiled.querySelector('button:last-child') as HTMLButtonElement;

      // Start streaming
      startStopBtn.click();
      fixture.detectChanges();
      expect(component.isStreaming).toBeTruthy();

      // Stop streaming
      startStopBtn.click();
      fixture.detectChanges();
      expect(component.isStreaming).toBeFalsy();
    });

    it('should disable form inputs while streaming', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const inputs = compiled.querySelectorAll('input');

      // Start streaming
      component.toggleStream();
      fixture.detectChanges();

      inputs.forEach((input: HTMLInputElement) => {
        expect(input.disabled).toBeTruthy();
      });
    });

    it('should disable update configuration button while streaming', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const updateConfigBtn = compiled.querySelector('button') as HTMLButtonElement;

      // Start streaming
      component.toggleStream();
      fixture.detectChanges();

      expect(updateConfigBtn.disabled).toBeTruthy();
    });
  });

  describe('Worker Integration', () => {
    it('should create worker when starting stream', () => {
      const workerSpy = jest.spyOn(window as any, 'Worker');

      component.toggleStream();

      expect(workerSpy).toHaveBeenCalled();
    });

    it('should terminate worker when stopping stream', () => {
      // Start streaming
      component.toggleStream();
      const worker = (component as any).worker;
      const terminateSpy = jest.spyOn(worker, 'terminate');

      // Stop streaming
      component.toggleStream();

      expect(terminateSpy).toHaveBeenCalled();
    });

    it('should send correct configuration to worker', () => {
      // Set custom values
      component.configForm.patchValue({
        timer: 500,
        arraySize: 2000,
        additionalIds: '1, 2, 3'
      });

      const worker = new MockWorker();
      const postMessageSpy = jest.spyOn(worker, 'postMessage');
      (component as any).worker = worker;

      component.updateConfig();

      expect(postMessageSpy).toHaveBeenCalledWith({
        timer: 500,
        size: 2000,
        additionalIds: ['1', '2', '3']
      });
    });
  });

  describe('Data Handling', () => {
    it('should limit displayed items to 10', fakeAsync(() => {
      const mockData = Array(15).fill(null)
        .map((_, i) => createMockDataItem(i.toString()));

      component.toggleStream();
      const worker = (component as any).worker;

      // Simulate worker message
      worker.onmessage?.({ data: mockData } as MessageEvent);
      tick();
      fixture.detectChanges();

      expect(component.displayedItems.length).toBe(10);
    }));

    it('should correctly transform raw data to DataItem instances', fakeAsync(() => {
      const mockData = [createMockDataItem('1')];

      component.toggleStream();
      const worker = (component as any).worker;

      worker.onmessage?.({ data: mockData } as MessageEvent);
      tick();
      fixture.detectChanges();

      expect(component.displayedItems[0]).toBeInstanceOf(DataItem);
      expect(component.displayedItems[0].child).toBeInstanceOf(DataChild);
    }));
  });

  describe('Component Lifecycle', () => {
    it('should cleanup worker on destroy', () => {
      component.toggleStream();
      const worker = (component as any).worker;
      const terminateSpy = jest.spyOn(worker, 'terminate');

      component.ngOnDestroy();

      expect(terminateSpy).toHaveBeenCalled();
      expect((component as any).worker).toBeUndefined();
    });
  });

  describe('UI States', () => {
    it('should show correct streaming status text', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const statusElement = compiled.querySelector('.status-text');

      expect(statusElement?.textContent).toContain('Stream is stopped');

      component.toggleStream();
      fixture.detectChanges();

      expect(statusElement?.textContent).toContain('Stream is active');
    });

    it('should toggle button text based on streaming state', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const toggleButton = compiled.querySelector('button:last-child');

      expect(toggleButton?.textContent?.trim()).toBe('Start Stream');

      component.toggleStream();
      fixture.detectChanges();

      expect(toggleButton?.textContent?.trim()).toBe('Stop Stream');
    });

    it('should apply correct button classes based on streaming state', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const toggleButton = compiled.querySelector('button:last-child');

      expect(toggleButton?.classList.contains('btn-success')).toBeTruthy();

      component.toggleStream();
      fixture.detectChanges();

      expect(toggleButton?.classList.contains('btn-danger')).toBeTruthy();
    });
  });
});
