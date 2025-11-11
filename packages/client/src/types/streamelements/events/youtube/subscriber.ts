export type YouTube$Subscriber = {
  listener: 'subscriber-latest';
  event: Subscriber;
};

export type Subscriber = {
  avatar: string;
  displayName: string;
  providerId: string;
  name: string;
  _id: string;
  sessionTop: boolean;
  type: 'subscriber';
  originalEventName: 'subscriber-latest';
};
