# IdeaConnect Socket Server

Standalone Socket.IO chat server. Deploy this **separately** on Render (or any Node host) so the main Next.js app can run without a custom server.

## Run locally

```bash
cd socket-server
cp .env.example .env
# Edit .env: PORT, JWT_SECRET, MONGODB_URI, CORS_ORIGIN (e.g. http://localhost:3000)
npm install
npm start
```

## Deploy on Render

1. **New Web Service** from this repo.
2. **Root Directory**: set to `socket-server` (so build/start run in this folder).
3. **Build**: `npm install`
4. **Start**: `npm start`
5. **Environment** (required):
   - `MONGODB_URI` – same MongoDB as the main app
   - `JWT_SECRET` – same secret as the main app (so tokens are valid)
   - `CORS_ORIGIN` – your main app URL, e.g. `https://ideaconnect-xxxx.onrender.com`  
     (or comma-separated: `https://app.example.com,https://www.example.com`)
6. `PORT` is set by Render automatically.

After deploy, set in your **main app** (Vercel/Render):

- `NEXT_PUBLIC_SOCKET_URL` = your socket service URL, e.g. `https://ideaconnect-socket-xxxx.onrender.com`

No trailing slash. The client will use this URL for Socket.IO and send auth via the `/api/auth/socket-token` route.

## Main app (production)

- For production with a **separate** socket server, run the main app with `next build` and `next start` (no custom `server.mjs`).
- Ensure the main app has `NEXT_PUBLIC_SOCKET_URL` set to this service’s URL.
