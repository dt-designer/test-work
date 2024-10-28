import { WorkerErrorListener, WorkerMessageListener, WorkerMockEvents } from './worker.types';

export class MockWorker implements Worker, WorkerMockEvents {
  onmessage: WorkerMessageListener | null = null;
  onmessageerror: WorkerMessageListener | null = null;
  onerror: WorkerErrorListener | null = null;

  private readonly _addEventListener = jest.fn();
  private readonly _removeEventListener = jest.fn();
  private readonly _postMessage = jest.fn();
  private readonly _terminate = jest.fn();
  private readonly _dispatchEvent = jest.fn().mockReturnValue(true);

  constructor() {
    // Empty constructor
  }

  addEventListener<K extends keyof WorkerEventMap>(
    type: K,
    listener: (this: Worker, ev: WorkerEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void {
    this._addEventListener(type, listener, options);
  }

  removeEventListener<K extends keyof WorkerEventMap>(
    type: K,
    listener: (this: Worker, ev: WorkerEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void {
    this._removeEventListener(type, listener, options);
  }

  postMessage(message: any, transfer: Transferable[]): void;
  postMessage(message: any, options?: StructuredSerializeOptions): void;
  postMessage(message: any, options?: any): void {
    this._postMessage(message, options);
  }

  terminate(): void {
    this._terminate();
  }

  dispatchEvent(event: Event): boolean {
    return this._dispatchEvent(event);
  }



  mockMessageFromWorker(data: any): void {
    if (this.onmessage) {
      const messageEvent = new MessageEvent('message', { data });
      this.onmessage.call(this, messageEvent);
    }
  }

  mockError(error: Error): void {
    if (this.onerror) {
      const errorEvent = new ErrorEvent('error', { error });
      this.onerror.call(this, errorEvent);
    }
  }



  get addEventListener_spy(): jest.Mock {
    return this._addEventListener;
  }

  get removeEventListener_spy(): jest.Mock {
    return this._removeEventListener;
  }

  get postMessage_spy(): jest.Mock {
    return this._postMessage;
  }

  get terminate_spy(): jest.Mock {
    return this._terminate;
  }

  get dispatchEvent_spy(): jest.Mock {
    return this._dispatchEvent;
  }
}
