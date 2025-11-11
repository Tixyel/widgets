export type Twitch$Cheer = {
  listener: 'cheer-latest';
  event: Cheer;
};

type Cheer = {
  amount: number;
  avatar: string;
  name: string;
  displayName: string;
  providerId: string;
  message: string;
  _id: string;
  sessionTop: boolean;
  type: 'cheer';
  originalEventName: 'cheer-latest';
};
