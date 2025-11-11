export type StreamElements$BotCounter = {
  listener: 'bot:counter';
  event: BotCounter;
};

type BotCounter = {
  counter: string;
  value: number;
};
