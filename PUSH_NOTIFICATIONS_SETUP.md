# Push Notifications Setup Guide

## Overview

The Greeting app now includes a push notification system to send updates about offers, discounts, and announcements to customers. The system uses Web Push API with a service worker for reliable delivery.

## Features

- **Custom Permission Popup**: Hindi-language popup appears after 3 seconds on first visit
- **Permission Messages**: "Latest offers aur updates paane ke liye notifications allow karein"
- **Service Worker**: Background service worker handles push events
- **Subscription Management**: User subscriptions stored securely
- **Send Notifications**: API endpoint to send push notifications to subscribers
- **Browser Compatible**: Works on Chrome, Firefox, Edge, and other modern browsers

## Setup Instructions

### 1. Generate VAPID Keys

VAPID keys are required for Web Push API. Generate them using OpenSSL or an online tool:

```bash
# Using web-push npm package (recommended)
npm install -g web-push
web-push generate-vapid-keys

# You'll get output like:
# Public Key: BEkMKh...
# Private Key: abc123...
```

### 2. Configure Environment Variables

Add the generated keys to your Vercel environment:

```bash
# In Vercel Project Settings > Environment Variables:
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

Or in your `.env.local` for local development:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### 3. File Structure

The push notification system consists of:

- **`components/push-notification-popup.tsx`**: Custom popup component with Hindi message
- **`lib/push-notifications.ts`**: Utility functions for managing push subscriptions
- **`public/sw.js`**: Service worker that handles push events
- **`app/api/push-subscriptions/route.ts`**: API to store/retrieve subscriptions
- **`app/api/push-notifications/send/route.ts`**: API to send notifications to all subscribers

### 4. How It Works

#### User Flow:

1. User visits the website for the first time
2. After 3 seconds, the permission popup appears
3. Popup shows Hindi message: "Latest offers aur updates paane ke liye notifications allow karein"
4. Two buttons: "Allow" and "Not Now"
5. If user clicks "Allow":
   - Browser asks for notification permission
   - Service worker is registered
   - User subscription is sent to server
   - Subscription is stored in database

#### Notification Flow:

1. Admin sends notification via `/api/push-notifications/send` endpoint
2. Server retrieves all stored subscriptions
3. For each subscription, sends encrypted push message
4. Service worker receives the push event
5. Notification is displayed to the user's browser

### 5. Sending Push Notifications

#### Via API:

```bash
curl -X POST http://localhost:3000/api/push-notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Offer!",
    "body": "Get 20% off on all items",
    "tag": "offer",
    "badge": "/icon-192x192.png"
  }'
```

#### From Your Admin Dashboard:

You can add a notification sender in the admin panel that calls the same API endpoint with offer details.

### 6. Database Schema

Subscriptions are stored with:

```typescript
{
  endpoint: string,        // Push service endpoint
  auth: string,           // Authentication key (base64)
  p256dh: string,        // Diffie-Hellman public key (base64)
  userAgent: string,     // Browser info
  timestamp: string,     // When subscription was created
  updatedAt: string      // Last update time
}
```

### 7. Important Notes

- **HTTPS Required**: Push notifications only work over HTTPS (except localhost for development)
- **User Consent**: Always respect user preferences - show the popup only once
- **Graceful Fallback**: The system gracefully handles browsers that don't support push notifications
- **Privacy**: Never send notifications to users who haven't explicitly opted in
- **Content**: Keep notification titles and bodies concise (max 100 chars)

### 8. Testing

1. **Local Testing**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # The popup should appear after 3 seconds
   ```

2. **Check Service Worker**:
   - Open DevTools > Application > Service Workers
   - Should show "sw.js" as active and running

3. **Verify Subscription**:
   - Open DevTools > Application > Storage > IndexedDB
   - Check subscription data if stored locally

4. **Send Test Notification**:
   ```bash
   curl -X POST http://localhost:3000/api/push-notifications/send \
     -H "Content-Type: application/json" \
     -d '{"title": "Test", "body": "Hello from Greeting!"}'
   ```

### 9. Customization

#### Change Popup Message:

Edit `components/push-notification-popup.tsx`:

```typescript
<p className="text-foreground text-center mb-6">
  Custom message here
</p>
```

#### Change Popup Delay:

Edit `components/public-page.tsx`:

```typescript
const timer = setTimeout(() => {
  setShowPushNotificationPopup(true)
}, 3000) // Change this value in milliseconds
```

#### Customize Notification Style:

Edit `public/sw.js` in the `options` object:

```javascript
const options = {
  body: event.data.text(),
  icon: '/icon-192x192.png',
  badge: '/badge-72x72.png',
  tag: 'notification',
  // Add more options as needed
}
```

### 10. Troubleshooting

| Issue | Solution |
|-------|----------|
| Popup doesn't appear | Check localStorage - if "push_notification_popup_shown" exists, clear it or use a new browser |
| Service worker not registering | Check browser console for errors, ensure HTTPS (or localhost) |
| Notifications not sending | Verify VAPID keys are set correctly in environment variables |
| Permission denied | User can change in browser settings: Settings > Privacy > Notifications |
| Browser shows "[object Object]" | Ensure service worker properly parses push event data |

### 11. Analytics

Track push notification metrics:

- Count subscribed users
- Monitor successful deliveries
- Track notification click-through rates
- Analyze opt-out patterns

Consider adding this to your analytics dashboard to understand campaign effectiveness.

## Security Considerations

1. **VAPID Keys**: Keep private key secret, never expose in client-side code
2. **Subscription Storage**: Encrypt sensitive subscription data
3. **Authentication**: Add authentication to the send endpoint (currently open for demo)
4. **Rate Limiting**: Implement rate limiting to prevent spam
5. **Content Validation**: Validate notification content before sending

## References

- [Web Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/draft-thomson-webpush-vapid)
- [Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)

## Support

For issues or questions, check the browser console for error messages and refer to the troubleshooting section above.
