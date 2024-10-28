import { DataItem, DataChild } from './data.model';

describe('Data Models', () => {
  describe('DataChild', () => {
    it('should create an instance with correct properties', () => {
      const child = new DataChild('1', 'red');

      expect(child.id).toBe('1');
      expect(child.color).toBe('red');
    });
  });

  describe('DataItem', () => {
    it('should create an instance with correct properties', () => {
      const child = new DataChild('2', 'blue');
      const item = new DataItem('1', 100, 10.5, 'red', child);

      expect(item.id).toBe('1');
      expect(item.int).toBe(100);
      expect(item.float).toBe(10.5);
      expect(item.color).toBe('red');
      expect(item.child).toBe(child);
    });

    describe('fromJSON', () => {
      it('should create instance from plain object', () => {
        const json = {
          id: '1',
          int: 100,
          float: 10.5,
          color: 'red',
          child: {
            id: '2',
            color: 'blue'
          }
        };

        const item = DataItem.fromJSON(json);

        expect(item).toBeInstanceOf(DataItem);
        expect(item.child).toBeInstanceOf(DataChild);
        expect(item.id).toBe('1');
        expect(item.int).toBe(100);
        expect(item.float).toBe(10.5);
        expect(item.color).toBe('red');
        expect(item.child.id).toBe('2');
        expect(item.child.color).toBe('blue');
      });
    });
  });
});
