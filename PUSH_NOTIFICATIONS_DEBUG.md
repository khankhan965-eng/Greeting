# Push Notifications - Debugging & Testing Guide

## Quick Troubleshooting

### Issue 1: Popup Not Showing
**Check:**
- Open DevTools Console (F12)
- Look for: `[v0] User clicked Allow for notifications`
- If not present, popup JavaScript may not be loading

**Solution:**
```bash
# Check if files exist
ls -la public/sw.js
ls -la components/push-notification-popup.tsx
```

### Issue 2: Service Worker Not Registering
**Console check:**
```
[v0] Service Worker registering...
[v0] Service Worker registered: ServiceWorkerRegistration {...}
[v0] Service Worker ready
```

**If you see "ServiceWorkers not supported":**
- You're on HTTP (not HTTPS) - Service Workers only work on HTTPS
- Or using very old browser
- Test locally: `npm run dev` should work on localhost

**If registration fails:**
```
[v0] Service Worker registering...
[Error] Failed to register service worker
```

Check:
1. Is `/public/sw.js` file present?
2. Verify file syntax with: `node public/sw.js` (will error but shows syntax issues)
3. Check browser console for actual error

### Issue 3: Permission Always "denied" or Not Showing
**Check in Console:**
```
[v0] Requesting notification permission...
[v0] Notification permission: granted
```

**If permission: denied:**
- Browser blocks notifications for this domain
- Check browser notification settings for your site
- In Chrome: Lock icon → Notifications → Allow

**If no permission dialog shows:**
- Browser already remembered your choice
- Clear site data: DevTools → Application → Clear storage
- Or use private/incognito window

### Issue 4: Test Notification Not Showing
**Console should show:**
```
[v0] Showing test notification...
[Notification] Successfully displayed
```

**If it doesn't:**
1. Check if browser window has focus (notifications don't show in foreground on desktop, only in system tray)
2. Check system notification settings (OS level)
3. Some browsers show in notification center instead of toast

### Issue 5: Can't Send Test Notification from `/api/push-notifications/send`
**Check VAPID Keys:**
```bash
echo "NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY"
echo "VAPID_PRIVATE_KEY=${VAPID_PRIVATE_KEY:0:20}..."
```

Both must be set in Vercel project settings or `.env.local`

**To generate VAPID keys:**
```bash
npm install -g web-push
web-push generate-vapid-keys
```

Copy output to:
- `.env.local` for local testing
- Vercel Project Settings → Vars for production

## Step-by-Step Debug Process

### 1. Local Testing
```bash
npm run dev
# Open http://localhost:3000
# Open DevTools Console (F12)
# Look for [v0] logs
```

### 2. Check Service Worker
In DevTools:
- Application → Service Workers
- Should see `/sw.js` as "activated and running"

### 3. Check Notification Permission
```javascript
// Run in console
console.log(Notification.permission)
// Output: "granted" or "denied" or "default"
```

### 4. Check Subscriptions in IndexedDB
```javascript
// Service Worker stores subscription in IDB
// Check it manually:
const db = await new Promise((resolve) => {
  const req = indexedDB.open("your-app-db")
  req.onsuccess = () => resolve(req.result)
})
```

### 5. Test Notification Manually
```javascript
// In console (after permission is granted):
const reg = await navigator.serviceWorker.ready
await reg.showNotification("Test", {
  body: "Manual test notification",
  icon: "/icon.svg"
})
```

## Common VAPID Key Issues

### "Missing or invalid applicationServerKey"
```
Error: The subscription failed - no valid VAPID key
```

**Fix:**
```javascript
// In push-notification-popup.tsx, we handle this:
if (!vapidKey) {
  console.warn("[v0] VAPID key not configured")
  // Still allows subscription without VAPID for development
}
```

### "VAPID public key is not a valid public key"
The key format is wrong. Regenerate:
```bash
web-push generate-vapid-keys
```

Must be exactly as shown - no extra characters or line breaks.

## Production Deployment Issues

### Issue: Works Locally but Not on Vercel
1. **Set Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (public)
   - Add `VAPID_PRIVATE_KEY` (secret)

2. **Verify Service Worker Path:**
   - Must be at `/public/sw.js` → served as `/sw.js`
   - Check: `curl https://your-site.com/sw.js`

3. **Check HTTPS:**
   - Service Workers ONLY work on HTTPS
   - Vercel automatically provides HTTPS

4. **Check CORS:**
   - Push notifications should work same-origin
   - API endpoint `/api/push-subscriptions` must return `200 OK`

## Testing Checklist

- [ ] DevTools shows `[v0]` logs during permission flow
- [ ] Service Worker shows as "activated and running"
- [ ] `Notification.permission` returns "granted"
- [ ] Test notification appears after permission
- [ ] VAPID keys are set in environment
- [ ] `/api/push-subscriptions` accepts POST requests
- [ ] Can view console logs in DevTools → Application → Service Workers

## Getting Console Logs

### Local (npm run dev)
Press F12 → Console tab → All logs show with `[v0]` prefix

### Production (Vercel)
**Service Worker logs:**
- DevTools → Application → Service Workers → "Inspect"
- Shows service worker console logs

**Page logs:**
- F12 → Console
- Filter by `[v0]`

**User reports:**
- Ask users to open F12 → Console
- Take screenshot of all `[v0]` lines
- Share with you for debugging

## Still Not Working?

Try this sequence:

1. Clear browser cache/storage
   ```
   DevTools → Application → Clear all site data
   ```

2. Hard refresh page
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

3. Check in new private/incognito window
   ```
   This bypasses all browser state
   ```

4. Test on different browser (Chrome, Firefox, Safari)
   ```
   Service Workers work on all modern browsers
   ```

5. Check browser notification permissions
   ```
   Settings → Notifications → Your Site
   Should be "Allowed"
   ```

## Detailed Log Examples

### Success Flow (Copy this output if asking for help)
```
[v0] User clicked Allow for notifications
[v0] Registering service worker...
[v0] Service Worker registered: ServiceWorkerRegistration {...}
[v0] Service Worker ready
[v0] Requesting notification permission...
[v0] Notification permission: granted
[v0] Creating new subscription...
[v0] Subscription created: PushSubscription {...}
[v0] Showing test notification...
[v0] Sending subscription to backend...
[v0] Push notifications setup complete!
```

### Failure at Permission
```
[v0] User clicked Allow for notifications
[v0] Registering service worker...
[v0] Service Worker registered
[v0] Service Worker ready
[v0] Requesting notification permission...
[v0] Notification permission: denied
[v0] Permission denied
```

### Failure at Registration
```
[v0] User clicked Allow for notifications
[v0] Registering service worker...
Error: Registration failed: {error details}
[v0] Push notification setup error: Registration failed
```

Use these logs to identify exactly where the process breaks.
