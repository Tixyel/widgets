export type JSONValue = string | number | boolean | null | JSON | JSONArray;

export type JSONArray = JSONValue[];

export type JSON = {
  [key: string]: JSONValue;
};
