# Instagram Meta Business API Handler

A comprehensive TypeScript wrapper for Instagram Graph API. Manage posts, stories, comments, DMs, analytics and more with full type safety.

## Features

- ✅ **Full TypeScript support** with complete type definitions
- ✅ **Authentication** - OAuth flow, token exchange, refresh tokens
- ✅ **Post Management** - Create, edit, delete posts (images, videos, carousels)
- ✅ **Stories** - Post and manage Instagram Stories
- ✅ **Comments** - Reply, hide, delete, and manage comments
- ✅ **Direct Messages** - Send and receive DMs
- ✅ **Analytics** - Account insights, post metrics, story analytics
- ✅ **Hashtags** - Search and get top/recent media
- ✅ **Mentions & Tags** - Track mentions and tagged posts
- ✅ **Media Management** - Get, update, and delete media

## Prerequisites

1. **Meta Business Account** - Sign up at [business.facebook.com](https://business.facebook.com)
2. **Facebook App** - Create at [developers.facebook.com](https://developers.facebook.com)
3. **Instagram Business Account** - Convert your Instagram account to Business
4. **Access Token** - Generate long-lived access token
5. **Required Permissions**:
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_comments`
   - `instagram_manage_insights`
   - `instagram_manage_messages`

## Installation

```bash
npm install instagram-meta-handler
```

## Quick Start

```typescript
import InstagramHandler from 'instagram-meta-handler';

const instagram = new InstagramHandler({
  accessToken: 'YOUR_ACCESS_TOKEN',
  instagramBusinessAccountId: 'YOUR_IG_BUSINESS_ACCOUNT_ID',
  version: 'v21.0' // optional, defaults to v21.0
});

// Post an image
const mediaId = await instagram.postImage(
  'https://example.com/image.jpg',
  'Amazing photo! #instagram'
);
```

## Authentication

### Exchange Code for Token

```typescript
// After user authorizes your app, exchange code for token
const authResponse = await InstagramHandler.exchangeCodeForToken(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'YOUR_REDIRECT_URI',
  'AUTHORIZATION_CODE'
);

console.log('Access Token:', authResponse.access_token);
```

### Get Long-Lived Token (60 days)

```typescript
const longToken = await InstagramHandler.getLongLivedToken(
  'YOUR_CLIENT_SECRET',
  'SHORT_LIVED_TOKEN'
);

console.log('Long-lived token:', longToken.access_token);
console.log('Expires in:', longToken.expires_in, 'seconds');
```

### Refresh Access Token

```typescript
const refreshed = await instagram.refreshAccessToken();
console.log('New token:', refreshed.access_token);
```

## Posting Content

### Post Single Image

```typescript
const mediaId = await instagram.postImage(
  'https://example.com/image.jpg',
  'Check out this amazing view! #travel #photography',
  'LOCATION_ID' // optional
);
```

### Post Video

```typescript
const videoId = await instagram.postVideo(
  'https://example.com/video.mp4',
  'My latest adventure! #video #adventure'
);
```

### Post Carousel (Multiple Images)

```typescript
const carouselId = await instagram.postCarousel(
  [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg'
  ],
  'Amazing collection! #carousel #photos'
);
```

### Post Instagram Story

```typescript
// Image story
const storyId = await instagram.postStory(
  'https://example.com/story.jpg',
  'IMAGE'
);

// Video story
const videoStoryId = await instagram.postStory(
  'https://example.com/story.mp4',
  'VIDEO'
);
```

### Post with User Tags

```typescript
const containerId = await instagram.createMediaContainer(
  'https://example.com/image.jpg',
  'Great times with friends!',
  'LOCATION_ID',
  [
    { username: 'friend1', x: 0.5, y: 0.5 },
    { username: 'friend2', x: 0.3, y: 0.7 }
  ]
);

const mediaId = await instagram.publishMedia(containerId);
```

## Managing Posts

### Edit Post Caption

```typescript
await instagram.updateMediaCaption(
  'MEDIA_ID',
  'Updated caption with new hashtags #updated'
);
```

### Delete Post

```typescript
await instagram.deleteMedia('MEDIA_ID');
```

### Get Post Details

```typescript
const media = await instagram.getMedia('MEDIA_ID');
console.log('Likes:', media.like_count);
console.log('Comments:', media.comments_count);
console.log('URL:', media.permalink);
```

### Get Account Media

```typescript
const posts = await instagram.getAccountMedia(25);
posts.forEach(post => {
  console.log(`${post.caption} - ${post.like_count} likes`);
});
```

### Enable/Disable Comments

```typescript
// Disable comments
await instagram.setCommentsEnabled('MEDIA_ID', false);

// Enable comments
await instagram.setCommentsEnabled('MEDIA_ID', true);
```

## Comments

### Comment on a Post

```typescript
const commentId = await instagram.commentOnMedia(
  'MEDIA_ID',
  'Great post! 👍'
);
```

### Reply to Comment

```typescript
const replyId = await instagram.replyToComment(
  'COMMENT_ID',
  'Thanks for your comment!'
);
```

### Get Comments on Post

```typescript
const comments = await instagram.getMediaComments('MEDIA_ID');
comments.forEach(comment => {
  console.log(`${comment.username}: ${comment.text}`);
});
```

### Get Replies to Comment

```typescript
const replies = await instagram.getCommentReplies('COMMENT_ID');
```

### Hide/Unhide Comment

```typescript
// Hide comment
await instagram.hideComment('COMMENT_ID');

// Unhide comment
await instagram.unhideComment('COMMENT_ID');
```

### Delete Comment

```typescript
await instagram.deleteComment('COMMENT_ID');
```

## Direct Messages (DMs)

### Get Conversations

```typescript
const conversations = await instagram.getConversations(25);
conversations.forEach(conv => {
  console.log('Conversation ID:', conv.id);
  console.log('Last updated:', conv.updated_time);
});
```

### Get Messages in Conversation

```typescript
const messages = await instagram.getConversationMessages('CONVERSATION_ID', 50);
messages.forEach(msg => {
  console.log(`${msg.from.username}: ${msg.message}`);
});
```

### Send Direct Message

```typescript
const messageId = await instagram.sendDirectMessage(
  'RECIPIENT_USER_ID',
  'Hello! Thanks for reaching out.'
);
```

### Reply to Message

```typescript
const replyId = await instagram.replyToMessage(
  'CONVERSATION_ID',
  'Thanks for your message!'
);
```

## Analytics & Insights

### Get Account Insights

```typescript
const insights = await instagram.getAccountInsights(
  ['impressions', 'reach', 'profile_views', 'follower_count'],
  'day'
);

insights.data.forEach(metric => {
  console.log(`${metric.name}: ${metric.values[0].value}`);
});
```

### Get Post Insights

```typescript
const postInsights = await instagram.getMediaInsights(
  'MEDIA_ID',
  ['impressions', 'reach', 'engagement', 'saved', 'shares']
);

postInsights.forEach(metric => {
  console.log(`${metric.name}: ${metric.values[0].value}`);
});
```

### Get Story Insights

```typescript
const storyInsights = await instagram.getStoryInsights('STORY_MEDIA_ID');
storyInsights.forEach(metric => {
  console.log(`${metric.name}: ${metric.values[0].value}`);
});
```

## Hashtags

### Search Hashtag

```typescript
const hashtagId = await instagram.searchHashtag('travel');
console.log('Hashtag ID:', hashtagId);
```

### Get Top Media for Hashtag

```typescript
const topPosts = await instagram.getHashtagTopMedia(hashtagId, 25);
topPosts.forEach(post => {
  console.log(post.caption);
});
```

### Get Recent Media for Hashtag

```typescript
const recentPosts = await instagram.getHashtagRecentMedia(hashtagId, 25);
```

## Mentions & Tags

### Get Mentioned Media

```typescript
const mentions = await instagram.getMentionedMedia();
mentions.forEach(post => {
  console.log(`Mentioned in: ${post.permalink}`);
});
```

### Get Tagged Media

```typescript
const tagged = await instagram.getTaggedMedia();
tagged.forEach(post => {
  console.log(`Tagged in: ${post.permalink}`);
});
```

## Account Management

### Get Account Information

```typescript
const account = await instagram.getAccountInfo();
console.log('Username:', account.username);
console.log('Followers:', account.followers_count);
console.log('Following:', account.follows_count);
console.log('Posts:', account.media_count);
console.log('Bio:', account.biography);
console.log('Website:', account.website);
```

## TypeScript Types

### Main Interfaces

```typescript
interface InstagramConfig {
  accessToken: string;
  instagramBusinessAccountId: string;
  version?: string;
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
```

## API Methods Reference

| Category | Method | Description |
|----------|--------|-------------|
| **Auth** | `exchangeCodeForToken()` | Exchange OAuth code for token |
| | `getLongLivedToken()` | Get 60-day token |
| | `refreshAccessToken()` | Refresh token |
| **Post** | `postImage()` | Post single image |
| | `postVideo()` | Post video |
| | `postCarousel()` | Post carousel (2-10 items) |
| | `postStory()` | Post Instagram story |
| **Edit** | `updateMediaCaption()` | Edit post caption |
| | `deleteMedia()` | Delete post |
| | `setCommentsEnabled()` | Enable/disable comments |
| **Get** | `getMedia()` | Get post details |
| | `getAccountMedia()` | Get account posts |
| **Comments** | `commentOnMedia()` | Comment on post |
| | `replyToComment()` | Reply to comment |
| | `getMediaComments()` | Get post comments |
| | `getCommentReplies()` | Get comment replies |
| | `hideComment()` | Hide comment |
| | `unhideComment()` | Unhide comment |
| | `deleteComment()` | Delete comment |
| **DMs** | `getConversations()` | Get DM threads |
| | `getConversationMessages()` | Get messages |
| | `sendDirectMessage()` | Send DM |
| | `replyToMessage()` | Reply in thread |
| **Insights** | `getAccountInsights()` | Account analytics |
| | `getMediaInsights()` | Post analytics |
| | `getStoryInsights()` | Story analytics |
| **Hashtags** | `searchHashtag()` | Search hashtag |
| | `getHashtagTopMedia()` | Top posts |
| | `getHashtagRecentMedia()` | Recent posts |
| **Tags** | `getMentionedMedia()` | Get mentions |
| | `getTaggedMedia()` | Get tagged posts |
| **Account** | `getAccountInfo()` | Get account details |

## Available Metrics

### Account Insights Metrics
- `impressions` - Total impressions
- `reach` - Total reach
- `profile_views` - Profile views
- `follower_count` - Follower count
- `email_contacts` - Email button taps
- `phone_call_clicks` - Call button taps
- `text_message_clicks` - Text button taps
- `get_directions_clicks` - Directions button taps
- `website_clicks` - Website link clicks

### Media Insights Metrics
- `impressions` - Post impressions
- `reach` - Post reach
- `engagement` - Total engagement
- `saved` - Saves count
- `shares` - Shares count
- `likes` - Likes count
- `comments` - Comments count
- `video_views` - Video views (for videos)

### Story Insights Metrics
- `impressions` - Story impressions
- `reach` - Story reach
- `replies` - Story replies
- `exits` - Exits
- `taps_forward` - Forward taps
- `taps_back` - Back taps

## Error Handling

```typescript
try {
  const mediaId = await instagram.postImage(url, caption);
  console.log('Posted successfully:', mediaId);
} catch (error) {
  console.error('Failed to post:', error.message);
  // Handle error appropriately
}
```

## Rate Limits

Instagram Graph API has rate limits:
- **200 API calls per hour** per user
- **4800 API calls per hour** per app
- Monitor your usage to avoid rate limiting

## Best Practices

1. **Use Long-Lived Tokens** - They last 60 days instead of 1 hour
2. **Refresh Tokens Regularly** - Refresh before expiration
3. **Handle Errors Gracefully** - Always wrap API calls in try-catch
4. **Respect Rate Limits** - Implement exponential backoff
5. **Use Webhooks** - Set up webhooks for real-time updates
6. **Cache Data** - Cache insights and media to reduce API calls
7. **Validate Media URLs** - Ensure URLs are publicly accessible
8. **Test Thoroughly** - Test in sandbox mode before production

## Media Requirements

### Images
- Format: JPEG, PNG
- Max size: 8MB
- Min resolution: 320px
- Aspect ratio: 1.91:1 to 4:5

### Videos
- Format: MP4, MOV
- Max size: 100MB
- Max length: 60 seconds (feed), 15 seconds (stories)
- Frame rate: 30fps max
- Audio: AAC, 128kbps

### Stories
- Format: JPEG, PNG (image), MP4 (video)
- Max size: 100MB
- Duration: 15 seconds max (video)
- Aspect ratio: 9:16

## Webhook Setup

To receive real-time updates, set up webhooks in your Facebook App:

```javascript
// Webhook verification (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === 'YOUR_VERIFY_TOKEN') {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook events (POST)
app.post('/webhook', async (req, res) => {
  const data = req.body;

  if (data.object === 'instagram') {
    data.entry.forEach(entry => {
      entry.changes.forEach(async change => {
        if (change.field === 'comments') {
          // New comment received
          const commentId = change.value.id;
          const text = change.value.text;
          
          // Auto-reply to comment
          await instagram.replyToComment(commentId, 'Thanks for your comment!');
        }
      });
    });
  }

  res.sendStatus(200);
});
```

## Troubleshooting

**Token expired?**
```typescript
// Refresh your token
const newToken = await instagram.refreshAccessToken();
```

**Video not publishing?**
- Videos take time to process (2-10 seconds)
- The handler automatically waits, but ensure video meets requirements

**Comments not appearing?**
- Check if comments are enabled on the post
- Verify you have `instagram_manage_comments` permission

**DMs not working?**
- Ensure you have `instagram_manage_messages` permission
- User must have interacted with your account first

**Insights not available?**
- Insights require Instagram Business or Creator account
- Wait 24 hours for insights on new posts

## Resources

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Meta Business Suite](https://business.facebook.com)
- [API Changelog](https://developers.facebook.com/docs/instagram-api/changelog)
- [Content Publishing Guidelines](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Webhooks Reference](https://developers.facebook.com/docs/instagram-api/guides/webhooks)

## License

MIT License - feel free to use this in your projects!

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## Support

For API-specific issues, refer to [Meta's Instagram Platform Support](https://developers.facebook.com/support).

---

**Note**: This handler requires an active Facebook Developer account and Instagram Business account. Ensure you comply with Instagram's Platform Policy and Terms of Service.

## Project links

[Source](https://github.com/Up-to-code/Instagram-Meta-Business-API-Handler) · [Issues](https://github.com/Up-to-code/Instagram-Meta-Business-API-Handler/issues) · [Public project directory](https://github.com/qentrah/.github/blob/main/profile/PROJECTS.md)
