/**
 * Instagram Meta Business API Handler
 * A comprehensive TypeScript class to interact with Instagram Graph API
 */

interface InstagramConfig {
  accessToken: string;
  instagramBusinessAccountId: string;
  version?: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface MediaResponse {
  id: string;
}

interface PublishResponse {
  id: string;
}

interface CommentResponse {
  id: string;
}

interface ReplyResponse {
  id: string;
}

interface ConversationResponse {
  id: string;
}

interface MessageResponse {
  id: string;
  message: string;
}

interface InsightsResponse {
  data: Array<{
    name: string;
    period: string;
    values: Array<{
      value: number;
      end_time: string;
    }>;
    title: string;
    description: string;
    id: string;
  }>;
}

interface MediaObject {
  id: string;
  media_type: string;
  media_url: string;
  permalink: string;
  timestamp: string;
  caption?: string;
  username: string;
  like_count?: number;
  comments_count?: number;
}

interface Comment {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  like_count?: number;
  replies?: any;
}

interface Conversation {
  id: string;
  updated_time: string;
  messages?: any[];
}

interface MediaInsight {
  name: string;
  period: string;
  values: Array<{ value: number }>;
  title: string;
  description: string;
}

class InstagramHandler {
  private accessToken: string;
  private accountId: string;
  private version: string;
  private baseUrl: string;

  /**
   * Initialize Instagram Handler
   * @param config - Configuration object
   */
  constructor(config: InstagramConfig) {
    this.accessToken = config.accessToken;
    this.accountId = config.instagramBusinessAccountId;
    this.version = config.version || 'v21.0';
    this.baseUrl = `https://graph.facebook.com/${this.version}`;
  }

  /**
   * Make API request to Instagram
   * @private
   */
  private async _makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    params: Record<string, any> = {}
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    url.searchParams.append('access_token', this.accessToken);

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (method === 'POST' && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    } else if (method === 'GET' && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    try {
      const response = await fetch(url.toString(), options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'API request failed');
      }

      return result as T;
    } catch (error) {
      console.error('Instagram API Error:', error);
      throw error;
    }
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Exchange authorization code for access token
   * @param clientId - Your app client ID
   * @param clientSecret - Your app client secret
   * @param redirectUri - Your redirect URI
   * @param code - Authorization code from OAuth flow
   * @returns Access token response
   */
  static async exchangeCodeForToken(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    code: string
  ): Promise<AuthResponse> {
    const url = 'https://api.instagram.com/oauth/access_token';
    const formData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code: code
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    return await response.json();
  }

  /**
   * Get long-lived access token (60 days)
   * @param clientSecret - Your app client secret
   * @param shortLivedToken - Short-lived token to exchange
   * @returns Long-lived token response
   */
  static async getLongLivedToken(
    clientSecret: string,
    shortLivedToken: string
  ): Promise<AuthResponse> {
    const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`;
    
    const response = await fetch(url, { method: 'GET' });
    return await response.json();
  }

  /**
   * Refresh long-lived access token
   * @returns Refreshed token response
   */
  async refreshAccessToken(): Promise<AuthResponse> {
    const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${this.accessToken}`;
    
    const response = await fetch(url, { method: 'GET' });
    return await response.json();
  }

  // ==================== POSTING CONTENT ====================

  /**
   * Create a single image/video media container
   * @param imageUrl - URL of the image or video
   * @param caption - Caption for the post
   * @param location_id - Location ID (optional)
   * @param user_tags - Array of user tags (optional)
   * @param isCarousel - Whether this is part of a carousel
   * @returns Media container ID
   */
  async createMediaContainer(
    imageUrl: string,
    caption?: string,
    location_id?: string,
    user_tags?: Array<{ username: string; x: number; y: number }>,
    isCarousel: boolean = false
  ): Promise<string> {
    const params: Record<string, any> = {
      image_url: imageUrl,
      caption: caption
    };

    if (isCarousel) {
      params.is_carousel_item = true;
    }

    if (location_id) {
      params.location_id = location_id;
    }

    if (user_tags && user_tags.length > 0) {
      params.user_tags = JSON.stringify(user_tags);
    }

    const response = await this._makeRequest<MediaResponse>(
      `${this.accountId}/media`,
      'POST',
      params
    );

    return response.id;
  }

  /**
   * Create a video media container
   * @param videoUrl - URL of the video
   * @param caption - Caption for the post
   * @param coverUrl - Thumbnail cover URL (optional)
   * @param location_id - Location ID (optional)
   * @returns Media container ID
   */
  async createVideoContainer(
    videoUrl: string,
    caption?: string,
    coverUrl?: string,
    location_id?: string
  ): Promise<string> {
    const params: Record<string, any> = {
      media_type: 'VIDEO',
      video_url: videoUrl,
      caption: caption
    };

    if (coverUrl) {
      params.thumb_offset = 0;
    }

    if (location_id) {
      params.location_id = location_id;
    }

    const response = await this._makeRequest<MediaResponse>(
      `${this.accountId}/media`,
      'POST',
      params
    );

    return response.id;
  }

  /**
   * Create a carousel post (multiple images/videos)
   * @param mediaUrls - Array of image/video URLs
   * @param caption - Caption for the carousel post
   * @param location_id - Location ID (optional)
   * @returns Media container ID
   */
  async createCarouselPost(
    mediaUrls: string[],
    caption?: string,
    location_id?: string
  ): Promise<string> {
    const containerIds: string[] = [];

    for (const url of mediaUrls) {
      const containerId = await this.createMediaContainer(url, undefined, undefined, undefined, true);
      containerIds.push(containerId);
    }

    const params: Record<string, any> = {
      media_type: 'CAROUSEL',
      children: containerIds.join(','),
      caption: caption
    };

    if (location_id) {
      params.location_id = location_id;
    }

    const response = await this._makeRequest<MediaResponse>(
      `${this.accountId}/media`,
      'POST',
      params
    );

    return response.id;
  }

  /**
   * Publish a media container
   * @param creationId - Media container ID from create methods
   * @returns Published media ID
   */
  async publishMedia(creationId: string): Promise<string> {
    const response = await this._makeRequest<PublishResponse>(
      `${this.accountId}/media_publish`,
      'POST',
      { creation_id: creationId }
    );

    return response.id;
  }

  /**
   * Post a single image
   * @param imageUrl - URL of the image
   * @param caption - Caption for the post
   * @param location_id - Location ID (optional)
   * @returns Published media ID
   */
  async postImage(imageUrl: string, caption?: string, location_id?: string): Promise<string> {
    const containerId = await this.createMediaContainer(imageUrl, caption, location_id);
    return await this.publishMedia(containerId);
  }

  /**
   * Post a video
   * @param videoUrl - URL of the video
   * @param caption - Caption for the post
   * @param location_id - Location ID (optional)
   * @returns Published media ID
   */
  async postVideo(videoUrl: string, caption?: string, location_id?: string): Promise<string> {
    const containerId = await this.createVideoContainer(videoUrl, caption, undefined, location_id);
    await this._waitForVideoProcessing(containerId);
    return await this.publishMedia(containerId);
  }

  /**
   * Wait for video processing to complete
   * @private
   */
  private async _waitForVideoProcessing(
    containerId: string,
    maxAttempts: number = 10
  ): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const status = await this._makeRequest<{ status_code: string }>(
        containerId,
        'GET',
        { fields: 'status_code' }
      );

      if (status.status_code === 'FINISHED') {
        return;
      } else if (status.status_code === 'ERROR') {
        throw new Error('Video processing failed');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error('Video processing timeout');
  }

  /**
   * Post a carousel (multiple images)
   * @param imageUrls - Array of image URLs (2-10 items)
   * @param caption - Caption for the carousel
   * @param location_id - Location ID (optional)
   * @returns Published media ID
   */
  async postCarousel(imageUrls: string[], caption?: string, location_id?: string): Promise<string> {
    if (imageUrls.length < 2 || imageUrls.length > 10) {
      throw new Error('Carousel must have 2-10 items');
    }

    const containerId = await this.createCarouselPost(imageUrls, caption, location_id);
    return await this.publishMedia(containerId);
  }

  /**
   * Create an Instagram Story
   * @param mediaUrl - URL of image or video
   * @param mediaType - 'IMAGE' or 'VIDEO'
   * @returns Published story ID
   */
  async postStory(
    mediaUrl: string,
    mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE'
  ): Promise<string> {
    const params: Record<string, any> = {
      media_type: 'STORIES'
    };

    if (mediaType === 'IMAGE') {
      params.image_url = mediaUrl;
    } else {
      params.video_url = mediaUrl;
    }

    const response = await this._makeRequest<MediaResponse>(
      `${this.accountId}/media`,
      'POST',
      params
    );

    return await this.publishMedia(response.id);
  }

  /**
   * Update (edit) media caption
   * @param mediaId - Media ID to update
   * @param caption - New caption text
   * @returns Success status
   */
  async updateMediaCaption(mediaId: string, caption: string): Promise<boolean> {
    const response = await this._makeRequest<{ success: boolean }>(
      mediaId,
      'POST',
      { caption: caption }
    );

    return response.success;
  }

  /**
   * Delete a media post
   * @param mediaId - Media ID to delete
   * @returns Success status
   */
  async deleteMedia(mediaId: string): Promise<boolean> {
    const response = await this._makeRequest<{ success: boolean }>(
      mediaId,
      'DELETE'
    );

    return response.success;
  }

  // ==================== MEDIA MANAGEMENT ====================

  /**
   * Get media details
   * @param mediaId - Media ID
   * @param fields - Fields to retrieve
   * @returns Media object
   */
  async getMedia(
    mediaId: string,
    fields: string[] = ['id', 'media_type', 'media_url', 'permalink', 'caption', 'like_count', 'comments_count']
  ): Promise<MediaObject> {
    return await this._makeRequest<MediaObject>(
      mediaId,
      'GET',
      { fields: fields.join(',') }
    );
  }

  /**
   * Get account media (feed posts)
   * @param limit - Number of posts to retrieve (max 100)
   * @returns Array of media objects
   */
  async getAccountMedia(limit: number = 25): Promise<MediaObject[]> {
    const response = await this._makeRequest<{ data: MediaObject[] }>(
      `${this.accountId}/media`,
      'GET',
      {
        fields: 'id,media_type,media_url,permalink,timestamp,caption,username,like_count,comments_count',
        limit: limit
      }
    );

    return response.data;
  }

  // ==================== COMMENTS ====================

  /**
   * Comment on a media post
   * @param mediaId - Media ID to comment on
   * @param message - Comment text
   * @returns Comment ID
   */
  async commentOnMedia(mediaId: string, message: string): Promise<string> {
    const response = await this._makeRequest<CommentResponse>(
      `${mediaId}/comments`,
      'POST',
      { message: message }
    );

    return response.id;
  }

  /**
   * Reply to a comment
   * @param commentId - Comment ID to reply to
   * @param message - Reply text
   * @returns Reply ID
   */
  async replyToComment(commentId: string, message: string): Promise<string> {
    const response = await this._makeRequest<ReplyResponse>(
      `${commentId}/replies`,
      'POST',
      { message: message }
    );

    return response.id;
  }

  /**
   * Delete a comment
   * @param commentId - Comment ID to delete
   * @returns Success status
   */
  async deleteComment(commentId: string): Promise<boolean> {
    const response = await this._makeRequest<{ success: boolean }>(
      commentId,
      'DELETE'
    );

    return response.success;
  }

  /**
   * Hide a comment
   * @param commentId - Comment ID to hide
   * @returns Success status
   */
  async hideComment(commentId: string): Promise<boolean> {
    const response = await this._makeRequest<{ success: boolean }>(
      commentId,
      'POST',
      { hide: true }
    );

    return response.success;
  }

  /**
   * Unhide a comment
   * @param commentId - Comment ID to unhide
   * @returns Success status
   */
  async unhideComment(commentId: string): Promise<boolean> {
    const response = await this._makeRequest<{ success: boolean }>(
      commentId,
      'POST',
      { hide: false }
    );

    return response.success;
  }

  /**
   * Get comments on a media post
   * @param mediaId - Media ID
   * @returns Array of comments
   */
  async getMediaComments(mediaId: string): Promise<Comment[]> {
    const response = await this._makeRequest<{ data: Comment[] }>(
      `${mediaId}/comments`,
      'GET',
      { fields: 'id,text,username,timestamp,like_count,replies' }
    );

    return response.data;
  }

  /**
   * Get replies to a comment
   * @param commentId - Comment ID
   * @returns Array of replies
   */
  async getCommentReplies(commentId: string): Promise<Comment[]> {
    const response = await this._makeRequest<{ data: Comment[] }>(
      `${commentId}/replies`,
      'GET',
      { fields: 'id,text,username,timestamp' }
    );

    return response.data;
  }

  // ==================== DIRECT MESSAGES (DMs) ====================

  /**
   * Get conversations (DM threads)
   * @param limit - Number of conversations to retrieve
   * @returns Array of conversations
   */
  async getConversations(limit: number = 25): Promise<Conversation[]> {
    const response = await this._makeRequest<{ data: Conversation[] }>(
      `${this.accountId}/conversations`,
      'GET',
      {
        fields: 'id,updated_time,messages{message,from,created_time}',
        limit: limit
      }
    );

    return response.data;
  }

  /**
   * Get messages in a conversation
   * @param conversationId - Conversation ID
   * @param limit - Number of messages to retrieve
   * @returns Array of messages
   */
  async getConversationMessages(conversationId: string, limit: number = 50): Promise<any[]> {
    const response = await this._makeRequest<{ data: any[] }>(
      `${conversationId}/messages`,
      'GET',
      {
        fields: 'id,message,from,created_time',
        limit: limit
      }
    );

    return response.data;
  }

  /**
   * Send a direct message
   * @param recipientId - Instagram user ID of recipient
   * @param message - Message text
   * @returns Message ID
   */
  async sendDirectMessage(recipientId: string, message: string): Promise<string> {
    const response = await this._makeRequest<MessageResponse>(
      `${this.accountId}/messages`,
      'POST',
      {
        recipient: { id: recipientId },
        message: { text: message }
      }
    );

    return response.id;
  }

  /**
   * Reply to a message in a conversation
   * @param conversationId - Conversation ID
   * @param message - Reply text
   * @returns Message ID
   */
  async replyToMessage(conversationId: string, message: string): Promise<string> {
    const response = await this._makeRequest<MessageResponse>(
      `${conversationId}/messages`,
      'POST',
      { message: message }
    );

    return response.id;
  }

  // ==================== INSIGHTS & ANALYTICS ====================

  /**
   * Get account insights (analytics)
   * @param metrics - Array of metric names
   * @param period - Time period (day, week, days_28)
   * @returns Insights data
   */
  async getAccountInsights(
    metrics: string[] = ['impressions', 'reach', 'profile_views'],
    period: 'day' | 'week' | 'days_28' = 'day'
  ): Promise<InsightsResponse> {
    return await this._makeRequest<InsightsResponse>(
      `${this.accountId}/insights`,
      'GET',
      {
        metric: metrics.join(','),
        period: period
      }
    );
  }

  /**
   * Get media insights (post analytics)
   * @param mediaId - Media ID
   * @param metrics - Array of metric names
   * @returns Insights data
   */
  async getMediaInsights(
    mediaId: string,
    metrics: string[] = ['impressions', 'reach', 'engagement', 'saved']
  ): Promise<MediaInsight[]> {
    const response = await this._makeRequest<{ data: MediaInsight[] }>(
      `${mediaId}/insights`,
      'GET',
      { metric: metrics.join(',') }
    );

    return response.data;
  }

  /**
   * Get story insights
   * @param storyId - Story media ID
   * @returns Story insights
   */
  async getStoryInsights(storyId: string): Promise<MediaInsight[]> {
    return await this.getMediaInsights(storyId, [
      'impressions',
      'reach',
      'replies',
      'exits',
      'taps_forward',
      'taps_back'
    ]);
  }

  // ==================== MENTIONS & TAGS ====================

  /**
   * Get mentioned media (posts where account is mentioned)
   * @returns Array of media objects
   */
  async getMentionedMedia(): Promise<MediaObject[]> {
    const response = await this._makeRequest<{ data: MediaObject[] }>(
      `${this.accountId}`,
      'GET',
      {
        fields: 'mentioned_media.limit(50){id,media_type,media_url,permalink,caption,timestamp}'
      }
    );

    return response.data;
  }

  /**
   * Get tagged media (posts where account is tagged)
   * @returns Array of media objects
   */
  async getTaggedMedia(): Promise<MediaObject[]> {
    const response = await this._makeRequest<{ data: MediaObject[] }>(
      `${this.accountId}/tags`,
      'GET',
      { fields: 'id,media_type,media_url,permalink,caption,timestamp' }
    );

    return response.data;
  }

  // ==================== HASHTAGS ====================

  /**
   * Search hashtags
   * @param query - Hashtag to search (without #)
   * @returns Hashtag ID
   */
  async searchHashtag(query: string): Promise<string> {
    const response = await this._makeRequest<{ data: Array<{ id: string }> }>(
      'ig_hashtag_search',
      'GET',
      {
        user_id: this.accountId,
        q: query
      }
    );

    return response.data[0]?.id || '';
  }

  /**
   * Get top media for a hashtag
   * @param hashtagId - Hashtag ID from searchHashtag
   * @param limit - Number of posts to retrieve
   * @returns Array of media objects
   */
  async getHashtagTopMedia(hashtagId: string, limit: number = 25): Promise<any[]> {
    const response = await this._makeRequest<{ data: any[] }>(
      `${hashtagId}/top_media`,
      'GET',
      {
        user_id: this.accountId,
        fields: 'id,media_type,media_url,permalink,caption',
        limit: limit
      }
    );

    return response.data;
  }

  /**
   * Get recent media for a hashtag
   * @param hashtagId - Hashtag ID from searchHashtag
   * @param limit - Number of posts to retrieve
   * @returns Array of media objects
   */
  async getHashtagRecentMedia(hashtagId: string, limit: number = 25): Promise<any[]> {
    const response = await this._makeRequest<{ data: any[] }>(
      `${hashtagId}/recent_media`,
      'GET',
      {
        user_id: this.accountId,
        fields: 'id,media_type,media_url,permalink,caption,timestamp',
        limit: limit
      }
    );

    return response.data;
  }

  // ==================== ACCOUNT MANAGEMENT ====================

  /**
   * Get account information
   * @returns Account details
   */
  async getAccountInfo(): Promise<any> {
    return await this._makeRequest<any>(
      this.accountId,
      'GET',
      {
        fields: 'id,username,account_type,media_count,followers_count,follows_count,profile_picture_url,biography,website'
      }
    );
  }

  /**
   * Enable/Disable comments on a media post
   * @param mediaId - Media ID
   * @param enabled - true to enable, false to disable
   * @returns Success status
   */
  async setCommentsEnabled(mediaId: string, enabled: boolean): Promise<boolean> {
    const response = await this._makeRequest<{ success: boolean }>(
      mediaId,
      'POST',
      { comment_enabled: enabled }
    );

    return response.success;
  }
}

export default InstagramHandler;