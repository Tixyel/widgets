export type Youtube$Message = {
  listener: 'message';
  event: YTMessage;
};

type YTMessage = {
  service: 'youtube';
  data: {
    kind: string;
    etag: string;
    id: string;
    snippet: {
      type: string;
      liveChatId: string;
      authorChannelId: string;
      publishedAt: string;
      hasDisplayContent: boolean;
      displayMessage: string;
      textMessageDetails: { messageText: string };
    };
    authorDetails: {
      channelId: string;
      channelUrl: string;
      displayName: string;
      profileImageUrl: string;
      isVerified: boolean;
      isChatOwner: boolean;
      isChatSponsor: boolean;
      isChatModerator: boolean;
    };
    msgId: string;
    userId: string;
    nick: string;
    badges: Array<Badges>;
    displayName: string;
    isAction: boolean;
    time: number;
    tags: Array<Tags>;
    displayColor: string | null;
    channel: string;
    text: string;
    avatar: string;
    emotes: Array<Emotes>;
  };
  renderedText: string;
};

type Badges = {};
type Tags = {};
type Emotes = {};
