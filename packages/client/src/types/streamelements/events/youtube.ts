export namespace YoutubeEvents {
  export namespace Message {
    export type Data = {
      listener: 'message';
      event: Event;
    };

    export type Event = {
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
  }

  export namespace Superchat {
    export type Data = {
      listener: 'superchat-latest';
      event: Event;
    };

    export type Event = {
      amount: number;
      avatar: string;
      displayName: string;
      providerId: string;
      name: string;
      _id: string;
      sessionTop: boolean;
      type: 'superchat';
      originalEventName: 'superchat-latest';
    };
  }

  export namespace Subscriber {
    export type Data = {
      listener: 'subscriber-latest';
      event: Event;
    };

    export type Event = {
      avatar: string;
      displayName: string;
      providerId: string;
      name: string;
      _id: string;
      sessionTop: boolean;
      type: 'subscriber';
      originalEventName: 'subscriber-latest';
    };
  }

  export namespace Sponsor {
    export type Data = {
      listener: 'sponsor-latest';
      event: Event;
    };

    export type Event = common & (normal | gift | community | spam);

    export type common = {
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

    export type normal = {
      sender?: undefined;

      gifted?: false;
      bulkGifted?: false;
      isCommunityGift?: false;
    };

    export type gift = {
      sender: string;

      gifted: true;
      bulkGifted?: false;
      isCommunityGift?: false;
    };

    export type community = {
      message: string;
      sender: string;

      gifted?: false;
      bulkGifted: true;
      isCommunityGift?: false;
    };

    export type spam = {
      sender: string;

      gifted: true;
      bulkGifted?: false;
      isCommunityGift: true;
    };
  }
}
