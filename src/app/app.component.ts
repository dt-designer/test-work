import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataItem, IDataItem } from './data.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  private worker?: Worker;
  displayedItems: DataItem[] = [];
  configForm: FormGroup;
  isStreaming: boolean = false;

  constructor(private fb: FormBuilder) {
    this.configForm = this.fb.group({
      timer: [300],
      arraySize: [1000],
      additionalIds: ['956, 998, 970']
    });
  }

  private initializeWorker() {
    if (typeof Worker !== 'undefined' && !this.worker) {
      this.worker = new Worker(new URL('./data.worker', import.meta.url));

      this.worker.onmessage = ({ data }) => {
        this.displayedItems = data
          .slice(-10)
          .map((item: IDataItem) => DataItem.fromJSON(item));
      };
    }
  }

  toggleStream() {
    if (this.isStreaming) {
      this.stopStream();
    } else {
      this.startStream();
    }
  }

  startStream() {
    this.initializeWorker();
    if (this.worker) {
      const config = {
        timer: this.configForm.get('timer')?.value,
        size: this.configForm.get('arraySize')?.value,
        additionalIds: this.configForm.get('additionalIds')?.value
          .split(',')
          .map((id: string) => id.trim())
      };

      this.worker.postMessage(config);
      this.isStreaming = true;
    }
  }

  stopStream() {
    if (this.worker) {
      this.worker.postMessage('stop');
      this.worker.terminate();
      this.worker = undefined;
      this.isStreaming = false;
    }
  }

  updateConfig() {
    if (this.worker) {
      const config = {
        timer: this.configForm.get('timer')?.value,
        size: this.configForm.get('arraySize')?.value,
        additionalIds: this.configForm.get('additionalIds')?.value
          .split(',')
          .map((id: string) => id.trim())
      };

      this.worker.postMessage(config);
    }
  }

  ngOnDestroy() {
    this.stopStream();
  }
}
