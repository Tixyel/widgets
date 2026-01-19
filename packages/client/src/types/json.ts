export type JSONPrimitive = string | number | boolean | null;

export type JSONSerializable = JSONPrimitive | JSONSerializable[] | { [k: string]: JSONSerializable | undefined };

export type JSONObject = {
  [key: string]: JSONSerializable | undefined;
};
