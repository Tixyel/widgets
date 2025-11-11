export type Twitch$Raid = {
  listener: 'raid-latest';
  event: Raid;
};

type Raid = {
  amount: number;
  avatar: string;
  displayName: string;
  providerId: string;
  name: string;
  _id: string;
  sessionTop: boolean;
  type: 'raid';
  originalEventName: 'raid-latest';
};
