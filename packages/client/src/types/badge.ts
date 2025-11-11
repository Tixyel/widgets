export type TwitchBadge = {
  type: string;
  version: string;
  url: string;
  description: string;
};

export type TwitchBadgesKeys =
  | '100 bits'
  | 'no audio'
  | 'no video'
  | 'bot'
  | 'twitch staff'
  | 'admins'
  | 'artist'
  | 'game developer'
  | 'prime'
  | 'turbo'
  | 'subscriber'
  | 'broadcaster'
  | 'verified'
  | 'moderator'
  | 'vip';
