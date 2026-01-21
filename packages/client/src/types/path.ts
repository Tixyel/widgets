export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

export type NumberAsString = string;

export type MapNumberValuesToString<T> = {
  [K in keyof T]: T[K] extends number ? `${T[K]}` | ReturnType<T[K]['toString']> : T[K];
};
