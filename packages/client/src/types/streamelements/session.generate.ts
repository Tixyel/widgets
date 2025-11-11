export type Session$AnyConfig = Session$IntConfig | Session$StringConfig | Session$DateConfig | Session$ArrayConfig | Session$RecentConfig | undefined;

export type Session$AvailableCategory = Record<string, Session$AnyConfig | Record<string, Session$AnyConfig | undefined> | undefined>;

export type Session$AvailableData = Record<string, Session$AvailableCategory | undefined>;

export type Session$IntConfig = {
  type: 'int';
  min: number;
  max: number;
};

export type Session$StringConfig = {
  type: 'string';
  options: string[];
};

export type Session$ArrayConfig = {
  type: 'array';
  options: any[];
};

export type Session$DateConfig = {
  type: 'date';
  range: number;
};

export type Session$RecentConfig = {
  type: 'recent';
  amount: number;
  value: Record<string, Session$AnyConfig>;
};
