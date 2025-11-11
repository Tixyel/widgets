export type Session = Session$Follower &
  Session$Subscriber &
  Session$Host &
  Session$Raid &
  Session$CharityCampaignDonation &
  Session$Cheer &
  Session$CheerPurchase &
  Session$Superchat &
  Session$Hypetrain &
  Session$ChannelPoints &
  Session$Tip &
  Session$Merch &
  Session$Purchase;

export type Session$Follower$Recent = {
  name: string;
  createdAt: string;
};

export type Session$Follower = {
  'follower-latest': {
    name: string;
  };
  'follower-session': {
    count: number;
  };
  'follower-week': {
    count: number;
  };
  'follower-month': {
    count: number;
  };
  'follower-goal': {
    amount: number;
  };
  'follower-total': {
    count: number;
  };
  'follower-recent': Session$Follower$Recent[];
};

export type SubscriptionTier = 'prime' | '1000' | '2000' | '3000';

export interface Session$Subscriber$Recent {
  name: string;
  amount: number;
  tier: SubscriptionTier;
  createdAt: string;
}

export interface Session$Subscriber {
  'subscriber-latest': {
    name: string;
    amount: number;
    tier: SubscriptionTier;
    message: string;
  };
  'subscriber-new-latest': {
    name: string;
    amount: number;
    message: string;
  };
  'subscriber-resub-latest': {
    name: string;
    amount: number;
    message: string;
  };
  'subscriber-gifted-latest': {
    name: string;
    amount: number;
    message: string;
    tier: SubscriptionTier;
    sender: string;
  };
  'subscriber-session': {
    count: number;
  };
  'subscriber-new-session': {
    count: number;
  };
  'subscriber-resub-session': {
    count: number;
  };
  'subscriber-gifted-session': {
    count: number;
  };
  'subscriber-week': {
    count: number;
  };
  'subscriber-month': {
    count: number;
  };
  'subscriber-goal': {
    amount: number;
  };
  'subscriber-total': {
    count: number;
  };
  'subscriber-points': {
    amount: number;
  };
  'subscriber-alltime-gifter': {
    name: string;
    amount: number;
  };
  'subscriber-recent': Session$Subscriber$Recent[];
}

export interface Session$Host$Recent {
  name: string;
  amount: number;
  createdAt: string;
}

export interface Session$Host {
  'host-latest': {
    name: string;
    amount: number;
  };
  'host-recent': Session$Host$Recent[];
}

export interface Session$Raid$Recent {
  name: string;
  amount: number;
  createdAt: string;
}

export interface Session$Raid {
  'raid-latest': {
    name: string;
    amount: number;
  };
  'raid-recent': Session$Raid$Recent[];
}

export interface Session$CharityCampaignDonation$Recent {
  name: string;
  amount: number;
  createdAt: string;
}

export interface Session$CharityCampaignDonation {
  'charityCampaignDonation-latest': {
    name: string;
    amount: number;
  };
  'charityCampaignDonation-session-top-donation': {
    name: string;
    amount: number;
  };
  'charityCampaignDonation-weekly-top-donation': {
    name: string;
    amount: number;
  };
  'charityCampaignDonation-monthly-top-donation': {
    name: string;
    amount: number;
  };
  'charityCampaignDonation-alltime-top-donation': {
    name: string;
    amount: number;
  };
  'charityCampaignDonation-session-top-donator': {
    name: string;
    amount: number;
  };
  'charityCampaignDonation-weekly-top-donator': {
    name: string;
    amount: number;
  };
  'charityCampaignDonation-monthly-top-donator': {
    name: string;
    amount: number;
  };
  'charityCampaignDonation-alltime-top-donator': {
    name: string;
    amount: number;
  };
  'charityCampaignDonation-recent': Session$CharityCampaignDonation$Recent[];
}

export interface Session$Cheer$Recent {
  name: string;
  amount: number;
  createdAt: string;
}

export interface Session$Cheer {
  'cheer-latest': {
    name: string;
    amount: number;
    message: string;
  };
  'cheer-session-top-donation': {
    name: string;
    amount: number;
  };
  'cheer-weekly-top-donation': {
    name: string;
    amount: number;
  };
  'cheer-monthly-top-donation': {
    name: string;
    amount: number;
  };
  'cheer-alltime-top-donation': {
    name: string;
    amount: number;
  };
  'cheer-session-top-donator': {
    name: string;
    amount: number;
  };
  'cheer-weekly-top-donator': {
    name: string;
    amount: number;
  };
  'cheer-monthly-top-donator': {
    name: string;
    amount: number;
  };
  'cheer-alltime-top-donator': {
    name: string;
    amount: number;
  };
  'cheer-session': {
    amount: number;
  };
  'cheer-week': {
    amount: number;
  };
  'cheer-month': {
    amount: number;
  };
  'cheer-total': {
    amount: number;
  };
  'cheer-count': {
    count: number;
  };
  'cheer-goal': {
    amount: number;
  };
  'cheer-recent': Session$Cheer$Recent[];
}

export interface Session$CheerPurchase$Recent {
  name: string;
  amount: number;
  createdAt: string;
}

export interface Session$CheerPurchase {
  'cheerPurchase-latest': {
    name: string;
    amount: number;
  };
  'cheerPurchase-session-top-donation': {
    name: string;
    amount: number;
  };
  'cheerPurchase-weekly-top-donation': {
    name: string;
    amount: number;
  };
  'cheerPurchase-monthly-top-donation': {
    name: string;
    amount: number;
  };
  'cheerPurchase-alltime-top-donation': {
    name: string;
    amount: number;
  };
  'cheerPurchase-session-top-donator': {
    name: string;
    amount: number;
  };
  'cheerPurchase-weekly-top-donator': {
    name: string;
    amount: number;
  };
  'cheerPurchase-monthly-top-donator': {
    name: string;
    amount: number;
  };
  'cheerPurchase-alltime-top-donator': {
    name: string;
    amount: number;
  };
  'cheerPurchase-recent': Session$CheerPurchase$Recent[];
}

export interface Session$Superchat$Recent {
  name: string;
  amount: number;
  createdAt: string;
}

export interface Session$Superchat {
  'superchat-latest': {
    name: string;
    amount: number;
  };
  'superchat-session-top-donation': {
    name: string;
    amount: number;
  };
  'superchat-weekly-top-donation': {
    name: string;
    amount: number;
  };
  'superchat-monthly-top-donation': {
    name: string;
    amount: number;
  };
  'superchat-alltime-top-donation': {
    name: string;
    amount: number;
  };
  'superchat-session-top-donator': {
    name: string;
    amount: number;
  };
  'superchat-weekly-top-donator': {
    name: string;
    amount: number;
  };
  'superchat-monthly-top-donator': {
    name: string;
    amount: number;
  };
  'superchat-alltime-top-donator': {
    name: string;
    amount: number;
  };
  'superchat-session': {
    amount: number;
  };
  'superchat-week': {
    amount: number;
  };
  'superchat-month': {
    amount: number;
  };
  'superchat-total': {
    amount: number;
  };
  'superchat-count': {
    count: number;
  };
  'superchat-goal': {
    amount: number;
  };
  'superchat-recent': Session$Superchat$Recent[];
}

export interface Session$Hypetrain$TopContributor {
  name: string;
}

export interface Session$Hypetrain {
  'hypetrain-latest': {
    name: string;
    amount: number;
    active: number;
    level: any;
    levelChanged: any;
    type: any;
  };
  'hypetrain-level-goal': {
    amount: number;
  };
  'hypetrain-level-progress': {
    amount: number;
    percent: number;
  };
  'hypetrain-total': {
    amount: number;
  };
  'hypetrain-latest-top-contributors': Session$Hypetrain$TopContributor[];
}

export interface Session$ChannelPoints {
  'channel-points-latest': {
    name: string;
    amount: number;
    message: string;
    redemption: string;
  };
}

export interface Session$Tip$Recent {
  name: string;
  amount: number;
  createdAt: string;
}

export interface Session$Tip {
  'tip-latest': {
    name: string;
    amount: number;
  };
  'tip-session-top-donation': {
    name: string;
    amount: number;
  };
  'tip-weekly-top-donation': {
    name: string;
    amount: number;
  };
  'tip-monthly-top-donation': {
    name: string;
    amount: number;
  };
  'tip-alltime-top-donation': {
    name: string;
    amount: number;
  };
  'tip-session-top-donator': {
    name: string;
    amount: number;
  };
  'tip-weekly-top-donator': {
    name: string;
    amount: number;
  };
  'tip-monthly-top-donator': {
    name: string;
    amount: number;
  };
  'tip-alltime-top-donator': {
    name: string;
    amount: number;
  };
  'tip-session': {
    amount: number;
  };
  'tip-week': {
    amount: number;
  };
  'tip-month': {
    amount: number;
  };
  'tip-total': {
    amount: number;
  };
  'tip-count': {
    count: number;
  };
  'tip-goal': {
    amount: number;
  };
  'tip-recent': Session$Tip$Recent[];
}

export interface Session$Merch$Recent {
  name: string;
}

export interface Session$Merch {
  'merch-latest': {
    name: string;
    amount: number;
    items: any[];
  };
  'merch-goal-orders': {
    amount: number;
  };
  'merch-goal-items': {
    amount: number;
  };
  'merch-goal-total': {
    amount: number;
  };
  'merch-recent': Session$Merch$Recent[];
}

export interface Session$Purchase {
  'purchase-latest': {
    name: string;
    amount: number;
    items: any[];
    avatar: string;
    message: string;
  };
}
