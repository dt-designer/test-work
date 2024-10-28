export interface IDataChild {
  id: string;
  color: string;
}

export interface IDataItem {
  id: string;
  int: number;
  float: number;
  color: string;
  child: IDataChild;
}

export class DataChild implements IDataChild {
  constructor(
    public id: string,
    public color: string
  ) {}
}

export class DataItem implements IDataItem {
  constructor(
    public id: string,
    public int: number,
    public float: number,
    public color: string,
    public child: DataChild
  ) {}

  static fromJSON(json: IDataItem): DataItem {
    return new DataItem(
      json.id,
      json.int,
      json.float,
      json.color,
      new DataChild(json.child.id, json.child.color)
    );
  }
}