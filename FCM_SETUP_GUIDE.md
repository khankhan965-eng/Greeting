# Firebase Cloud Messaging (FCM) Setup Guide

## Overview
This guide explains how to set up Firebase Cloud Messaging for push notifications in the RTC Tea Cafe website.

## Prerequisites
- Firebase project (create at https://console.firebase.google.com)
- Admin access to Firebase Console
- Vercel project with environment variable access

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Name it "RTC Tea Cafe" (or your preferred name)
4. Accept the terms and create the project
5. Wait for the project to be created

## Step 2: Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Click "Your apps" section
3. Click "Add app" → "Web"
4. Register the app with a nickname (e.g., "Web App")
5. Copy the Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

## Step 3: Set Up Cloud Messaging

1. In Firebase Console, go to **Cloud Messaging** tab
2. Look for "Web push certificates" section
3. Click "Generate Key Pair" to get your VAPID public key
4. Copy the VAPID public key (you'll need this for `NEXT_PUBLIC_FIREBASE_VAPID_KEY`)

## Step 4: Environment Variables

Add these to your Vercel project settings (Settings → Environment Variables):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_FIREBASE_VAPID_KEY=YOUR_VAPID_PUBLIC_KEY
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Important:** All `NEXT_PUBLIC_*` variables are exposed to the browser and are safe to be public.

## Step 5: Install Dependencies

```bash
npm install firebase
```

## Step 6: Deploy

1. Push your changes to GitHub
2. Vercel will automatically deploy
3. Set environment variables in Vercel project settings
4. Redeploy to apply new environment variables

## Step 7: Test

1. Visit your website
2. You'll see a "Notifications" popup after 3 seconds
3. Click "Allow" to enable notifications
4. You should see a test notification immediately
5. In the admin dashboard, you can send notifications to all subscribers

## How It Works

### User Side
1. User visits website
2. Notification popup appears
3. User clicks "Allow" → browser asks for permission
4. FCM token is generated and saved to backend
5. User can receive notifications anytime

### Admin Side
1. Go to admin panel (requires authentication)
2. Create an offer or announcement
3. System automatically sends notification to all subscribed users
4. Notification appears in browser even if app is closed

## FCM Token Storage

Currently, FCM tokens are stored in memory. For production, implement database storage:

```typescript
// In /app/api/fcm-tokens/route.ts
// Replace in-memory storage with:

await db.fcmTokens.create({
  token: token,
  userEmail: userEmail,
  userAgent: navigator.userAgent,
  createdAt: new Date(),
});
```

## Sending Notifications (Admin)

### Via API

```bash
curl -X POST http://localhost:3000/api/fcm-notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Offer!",
    "body": "Check out our latest tea deal",
    "icon": "/icon.png",
    "clickAction": "https://yoursite.com/offers"
  }'
```

### Via Firebase Admin SDK (Production)

For production, implement Firebase Admin SDK:

```typescript
import admin from "firebase-admin";

const messaging = admin.messaging();

await messaging.sendMulticast({
  notification: {
    title: "New Offer!",
    body: "Check out our latest tea deal",
    imageUrl: "/icon.png",
  },
  webpush: {
    notification: {
      icon: "/icon.png",
      badge: "/badge.png",
      click_action: "/offers",
    },
  },
  tokens: userTokens,
});
```

## Troubleshooting

### "Firebase config not set - push notifications disabled"
- Check that all environment variables are set in Vercel
- Make sure they start with `NEXT_PUBLIC_`
- Redeploy after changing env vars

### "Service Worker registration failed"
- Ensure `/public/sw.js` exists
- Check browser console for specific error
- Service workers require HTTPS (works on localhost)

### Notifications not appearing
- Check browser notification settings (not blocked)
- Verify permission was granted in browser
- Check that user device is online
- Look at browser console for errors

### FCM token not saving
- Check `/api/fcm-tokens` endpoint is working
- Verify Firebase is initialized (check console)
- Look at network tab in DevTools

## Admin Dashboard Integration

To send notifications from admin panel:

```typescript
// In admin-offers.tsx or similar
const sendNotification = async (offerId: string, offerTitle: string) => {
  await fetch("/api/fcm-notifications/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "New Offer!",
      body: offerTitle,
      icon: "/icon.png",
      clickAction: `/offers/${offerId}`,
    }),
  });
};
```

## Production Checklist

- [ ] Firebase project created and configured
- [ ] Environment variables set in Vercel
- [ ] FCM tokens stored in database (not memory)
- [ ] Firebase Admin SDK configured for sending
- [ ] Service worker properly caching assets
- [ ] Test notification working
- [ ] Admin can send notifications
- [ ] Users receive notifications on subscribed devices
- [ ] Notification click actions work correctly
- [ ] Error handling for failed requests

## Next Steps

1. **Analytics**: Track notification opens and clicks
2. **Segmentation**: Send notifications to specific user groups
3. **Scheduling**: Schedule notifications for later
4. **Templates**: Create notification templates for offers
5. **A/B Testing**: Test different notification messages

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Messaging Guide](https://firebase.google.com/docs/cloud-messaging)
- [Web Push Implementation](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
