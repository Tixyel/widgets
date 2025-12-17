export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

export type NumberAsString<T extends number | bigint | string> = ReturnType<T['toString']>;

export type MapNumberValuesToString<T> = {
  [K in keyof T]: T[K] extends number ? NumberAsString<T[K]> : T[K];
};
