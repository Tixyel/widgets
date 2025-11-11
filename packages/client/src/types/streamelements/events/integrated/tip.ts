export type StreamElements$Tip = {
  listener: 'tip-latest';
  event: Tip;
};

type Tip = {
  amount: number;
  avatar: string;
  name: string;
  displayName: string;
  providerId: string;
  _id: string;
  sessionTop: boolean;
  type: 'tip';
  originalEventName: 'tip-latest';
};
