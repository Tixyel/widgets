export type Twitch$Subscriber = {
  listener: 'subscriber-latest';
  event: Subscriber;
};

type Subscriber = Subscriber$default & (Subscriber$normal | Subscriber$gift | Subscriber$community | Subscriber$spam);

type Subscriber$default = {
  amount: number;
  name: string;
  displayName: string;

  message?: string;
  providerId?: string;
  avatar?: string;
  sender?: string;

  gifted?: boolean;
  bulkGifted?: boolean;
  isCommunityGift?: boolean;

  _id?: string;
  sessionTop?: boolean;
  playedAsCommunityGift?: boolean;

  type: 'subscriber';
  originalEventName: 'subscriber-latest';
};

export type Subscriber$normal = {
  sender?: undefined;

  gifted?: false;
  bulkGifted?: false;
  isCommunityGift?: false;
};

export type Subscriber$gift = {
  sender: string;

  gifted: true;
  bulkGifted?: false;
  isCommunityGift?: false;
};

export type Subscriber$community = {
  message: string;
  sender: string;

  gifted?: false;
  bulkGifted: true;
  isCommunityGift?: false;
};

export type Subscriber$spam = {
  sender: string;

  gifted: true;
  bulkGifted?: false;
  isCommunityGift: true;
};
