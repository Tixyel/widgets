export type Youtube$Sponsor = {
  listener: 'sponsor-latest';
  event: Sponsor;
};

type Sponsor = Sponsor$default & (Sponsor$normal | Sponsor$gift | Sponsor$community | Sponsor$spam);

type Sponsor$default = {
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

  type: 'sponsor';
  originalEventName: 'sponsor-latest';
};

export type Sponsor$normal = {
  sender?: undefined;

  gifted?: false;
  bulkGifted?: false;
  isCommunityGift?: false;
};

export type Sponsor$gift = {
  sender: string;

  gifted: true;
  bulkGifted?: false;
  isCommunityGift?: false;
};

export type Sponsor$community = {
  message: string;
  sender: string;

  gifted?: false;
  bulkGifted: true;
  isCommunityGift?: false;
};

export type Sponsor$spam = {
  sender: string;

  gifted: true;
  bulkGifted?: false;
  isCommunityGift: true;
};
