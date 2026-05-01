# Push Notifications - Quick Start

## 5-Minute Setup

### Step 1: Generate VAPID Keys (1 min)

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Copy the output.

### Step 2: Add Environment Variables (2 min)

**For Local Development** (`.env.local`):
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
```

**For Production** (Vercel Settings):
1. Go to Project Settings > Environment Variables
2. Add both keys
3. Redeploy

### Step 3: Test It (2 min)

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Wait 3 seconds for the notification popup
4. Click "Allow"
5. Browser asks for permission - click "Allow" again

### Step 4: Send Test Notification

```bash
curl -X POST http://localhost:3000/api/push-notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🎉 New Offer!",
    "body": "Get 20% off on all items this weekend"
  }'
```

## What Users See

**On First Visit:**
```
┌─────────────────────────────────┐
│  Latest offers aur updates     │
│  paane ke liye notifications   │
│  allow karein                  │
│                                │
│      [Allow]  [Not Now]        │
└─────────────────────────────────┘
```

**When Notification Arrives:**
```
┌─────────────────────────────────┐
│  🍕 Greeting Shop                │
│  New Offer!                     │
│  Get 20% off on all items...   │
└─────────────────────────────────┘
```

## API Endpoints

### Send Notification
```bash
POST /api/push-notifications/send
Content-Type: application/json

{
  "title": "Notification Title",
  "body": "Notification body text",
  "tag": "offer",              # Optional: groups similar notifications
  "badge": "/icon-badge.png",  # Optional: small icon
  "icon": "/icon-192x192.png"  # Optional: notification icon
}
```

### Subscribe to Push
```bash
POST /api/push-subscriptions
Content-Type: application/json

{
  "endpoint": "https://...",
  "auth": "base64_string",
  "p256dh": "base64_string"
}
```

## Notification Best Practices

✅ **Do:**
- Keep titles under 50 characters
- Keep bodies under 100 characters
- Use time-sensitive information (limited offers, flash sales)
- Send 1-3 notifications per day max
- Include emoji for visual interest 🎉

❌ **Don't:**
- Send notifications for non-urgent updates
- Use clickbait or misleading titles
- Send spam notifications (bad for user experience)
- Send at inappropriate times (respect time zones)

## Customization

### Change Popup Message

Edit `components/push-notification-popup.tsx`, find:
```typescript
<p className="text-foreground text-center mb-6">
  Latest offers aur updates paane ke liye notifications allow karein
</p>
```

### Change Popup Delay

Edit `components/public-page.tsx`, find:
```typescript
const timer = setTimeout(() => {
  setShowPushNotificationPopup(true)
}, 3000) // milliseconds - change this
```

### Add to Admin Panel

Create a form in your admin dashboard that posts to `/api/push-notifications/send`:

```typescript
async function sendOffer(title: string, body: string) {
  const response = await fetch('/api/push-notifications/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body })
  })
  
  if (response.ok) {
    console.log('Notification sent!')
  }
}
```

## Troubleshooting

**"Notification popup doesn't appear"**
- Clear localStorage: DevTools > Application > Storage > Local Storage > Delete `push_notification_popup_shown`
- Or test in incognito/private mode

**"Service worker not registering"**
- Check DevTools > Application > Service Workers
- Look at Console for errors
- Ensure HTTPS (localhost works for dev)

**"Permission denied"**
- User can enable: Browser Settings > Privacy > Site Settings > Notifications
- Or allow when prompted

**"Notifications not sent"**
- Check VAPID keys in environment variables
- Verify API endpoint receives POST requests
- Check browser console for errors

## Files Modified

```
components/
  ├── push-notification-popup.tsx       (NEW)
  └── public-page.tsx                   (UPDATED)

lib/
  └── push-notifications.ts             (NEW)

public/
  └── sw.js                            (NEW)

app/api/
  ├── push-subscriptions/
  │   └── route.ts                     (NEW)
  └── push-notifications/
      └── send/
          └── route.ts                 (NEW)

.env.example                            (UPDATED)
```

## Next Steps

1. **Add Security**: Require authentication for `/api/push-notifications/send`
2. **Database Integration**: Store subscriptions in your database instead of memory
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Analytics**: Track opens, clicks, and engagement
5. **Scheduling**: Schedule notifications to send at optimal times
6. **Segmentation**: Send different notifications to different user segments

## Support

See `PUSH_NOTIFICATIONS_SETUP.md` for detailed documentation.
