export type Twitch$DeleteMessage = {
  listener: 'delete-message';
  event: { msgId: string };
};

export type Twitch$DeleteMessages = {
  listener: 'delete-messages';
  event: { userId: string };
};
