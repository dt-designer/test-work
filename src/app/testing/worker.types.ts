export type WorkerEventListener<K extends keyof WorkerEventMap> = (
  this: Worker,
  ev: WorkerEventMap[K]
) => any;

export type WorkerErrorListener = (
  this: AbstractWorker,
  ev: ErrorEvent
) => any;

export type WorkerMessageListener = (
  this: Worker,
  ev: MessageEvent
) => any;

export interface WorkerMockEvents {
  onmessage: WorkerMessageListener | null;
  onmessageerror: WorkerMessageListener | null;
  onerror: WorkerErrorListener | null;
}
