export type StreamElements$KVStore = {
  listener: 'kvstore:update';
  event: KVStore;
};

type KVStore = {
  data: {
    key: `customWidget.${string}`;
    value: string | number | boolean;
  };
};
