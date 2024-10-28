/// <reference lib="webworker" />

import { IDataItem } from './data.model';

let intervalId: number;

const generateRandomData = (size: number, additionalIds: string[]): IDataItem[] => {
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const childColors = ['green', 'purple', 'orange', 'blue', 'red'];

  return Array.from({ length: size }, (_, index) => ({
    id: additionalIds && index < additionalIds.length ?
      additionalIds[index] :
      Math.random().toString(36).substr(2, 9),
    int: Math.floor(Math.random() * 10000000),
    float: Number((Math.random() * 100).toFixed(18)),
    color: colors[Math.floor(Math.random() * colors.length)],
    child: {
      id: (970 + index).toString(),
      color: childColors[Math.floor(Math.random() * childColors.length)]
    }
  }));
};

addEventListener('message', ({ data }) => {
  // Остановить предыдущий интервал, если он существует
  if (intervalId) {
    clearInterval(intervalId);
  }

  if (data === 'stop') {
    return;
  }

  const { timer, size, additionalIds } = data;

  // Создать новый интервал
  intervalId = setInterval(() => {
    const generatedData = generateRandomData(size, additionalIds);
    postMessage(generatedData);
  }, timer) as unknown as number;
});
