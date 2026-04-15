# Namecheap Deployment

This repo is prepared for a two-app cPanel deployment:

- `frontend` -> Next.js app on `yourdomain.com`
- `backend` -> Express/Prisma app on `api.yourdomain.com`

## Files already prepared

- `frontend-deploy.zip`
- `backend-deploy.zip`
- `frontend/.env.namecheap.example`
- `backend/.env.namecheap.example`

If you want fresh packages, run:

```powershell
.\deploy.ps1
```

The frontend package includes the built `.next` output and `server.js`, which Namecheap needs for a Node.js app startup.

## Recommended Namecheap setup

- Hosting: shared hosting with `Setup Node.js App`
- Frontend domain: `https://yourdomain.com`
- Backend subdomain: `https://api.yourdomain.com`
- Node.js version: `22`
- Application mode: `Production`

## 1. Create your domains/subdomains

In Namecheap cPanel:

1. Point your main domain to the hosting account.
2. Create the `api` subdomain.
3. Enable SSL for both.

## 2. Upload app files

Upload and extract:

- `frontend-deploy.zip` into a folder such as `frontend-app`
- `backend-deploy.zip` into a folder such as `backend-app`

Important:

- Do not use `public_html` as the Node.js application root for the Next.js app.
- Keep each app in its own folder.

## 3. Configure the frontend Node.js app

In `Setup Node.js App`:

- Node.js version: `22`
- Application mode: `Production`
- Application root: your frontend folder, for example `frontend-app`
- Application URL: `yourdomain.com`
- Application startup file: `server.js`

Then:

1. Create the app.
2. Open the app config screen.
3. Add the frontend environment variable from `frontend/.env.namecheap.example`.
4. Run `NPM Install`.
5. Start the app.

Frontend env value:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## 4. Configure the backend Node.js app

In `Setup Node.js App`:

- Node.js version: `22`
- Application mode: `Production`
- Application root: your backend folder, for example `backend-app`
- Application URL: `api.yourdomain.com`
- Application startup file: `server.js`

Then:

1. Create the app.
2. Add the backend environment variables from `backend/.env.namecheap.example`.
3. Run `NPM Install`.
4. Start the app.

Backend env values:

```env
DATABASE_URL=file:./dev.db
JWT_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-a-different-long-random-secret
PAYU_SETTINGS_ENCRYPTION_KEY=replace-with-a-third-long-random-secret
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
FRONTEND_URLS=https://yourdomain.com,https://www.yourdomain.com
BACKEND_PUBLIC_URL=https://api.yourdomain.com
UPLOAD_DIR=./uploads
DEFAULT_SONG_ART_URL=
```

Notes:

- `DATABASE_URL=file:./dev.db` is okay for a first launch, but a real production database is a better long-term move.
- `DEFAULT_SONG_ART_URL` is optional. Leave it empty to use the built-in fallback cover art.

## 5. Initialize the database

Open the Namecheap terminal for the backend app directory and run:

```bash
npm run db:push
```

Do not run these on production unless you explicitly want them:

- `npm run db:seed`
- `npm run db:seed:payments`

The first one loads demo content. The second one can write PayU settings, and its defaults are test values.

## 6. Verify the deployment

Check these URLs:

- `https://yourdomain.com`
- `https://api.yourdomain.com/health`

Expected backend health response:

```json
{ "status": "ok", "platform": "Bouut Music API" }
```

## 7. Upload behavior

The backend stores song uploads under `UPLOAD_DIR`, which defaults to `./uploads` inside the backend app folder. The repo is now set up to:

- create the uploads directory automatically if it does not exist
- return absolute media URLs in API responses
- use a built-in fallback song cover if no artwork file is uploaded

## 8. PayU reminder

Before going live with real payments:

1. Replace test credentials with production values.
2. Confirm `BACKEND_PUBLIC_URL` matches your real API domain.
3. Confirm `FRONTEND_URL` and `FRONTEND_URLS` match every public frontend origin you will use.
