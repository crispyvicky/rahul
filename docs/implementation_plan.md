# PWA implementation plan — RahulFitzz

## Completed in codebase

1. **Web App Manifest** — `public/manifest.json` (standalone, theme `#eb0000`, start `/dashboard`)
2. **Icons** — `npm run generate:icons` copies `src/assets/LOGO.png` → `public/LOGO.png` (manifest + favicon)
3. **Next.js PWA** — `@ducanh2912/next-pwa` in `next.config.mjs` (service worker in `public/`, disabled in dev)
4. **Offline fallback** — `src/app/offline/page.tsx` (document fallback when offline)
5. **Layout metadata** — `manifest`, `appleWebApp`, apple-touch-icon in `src/app/layout.tsx`

## Verify offline

1. `npm run build && npm start`
2. Open DevTools → Application → Service Workers (should register)
3. Application → Manifest (icons + name)
4. Network → Offline → reload; should show `/offline` for uncached navigations
5. Gym Mode: localStorage cache still works offline for existing weekly plan

## Optional next steps

- Push notifications via `notification_queue` table + web push VAPID keys
- Add to Home Screen on iOS (Safari Share → Add to Home Screen)
