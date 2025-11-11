export type Twitch$Follower = {
  listener: 'follower-latest';
  event: Follower;
};

type Follower = {
  avatar: string;
  name: string;
  displayName: string;
  providerId: string;
  _id: string;
  sessionTop: boolean;
  type: 'follower';
  originalEventName: 'follower-latest';
};
