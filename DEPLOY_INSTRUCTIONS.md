# Deployment Instructions for Render (Free Tier)

This guide will help you deploy your **PitShop Mechanix** application to Render for free and keep it active using a Cron Job strategy.

## 1. Project Setup (Done)

We have already:

- Added a `backend/Dockerfile` to allow you to select "Docker" as the runtime (since the Java option is missing).
- Configured logging and security.
- Ensured a Health Check endpoint exists at `/health`.

## 2. Push Code to GitHub

First, you need to push the new Dockerfile configuration to GitHub.

1. Run the following commands:
   ```bash
   git add .
   git commit -m "Added Docker support for Render"
   git push origin main
   ```

## 3. Deploy Backend (Spring Boot with Docker)

1. **Log in to Render** and click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. **Configure the Service**:
   - **Name**: `pitshop-mechanix-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Docker` (Select "Docker" from the Language/Runtime dropdown).
   - **Region**: Closest to you (e.g., Singapore/Oregon).
   - **Branch**: `main`
   - **Instance Type**: Free

   _Note: Since you selected Docker, you do NOT need to enter Build or Start commands. Render will use the Dockerfile automatically._

4. **Environment Variables**:
   Add the following variables under the **Environment** tab:
   - `MONGODB_URI`: `<Your MongoDB Connection String>`
   - `JWT_SECRET`: `<Your Secret Key>`
   - `CORS_ALLOWED_ORIGINS`: `https://pitshop-mechanix-frontend.onrender.com` (Update this after deploying frontend)
   - `RENDER_EXTERNAL_URL`: Use the default (Render provides this automatically as `RENDER_EXTERNAL_URL` in the runtime).

5. Click **Create Web Service**. Ideally, the build will pass and the service will go live.

## 4. Deploy Frontend (React/Vite)

1. **New +** -> **Static Site**.
2. Connect the same repository.
3. **Configure**:
   - **Name**: `pitshop-mechanix-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL`: The URL of your backend (e.g., `https://pitshop-mechanix-backend.onrender.com`)
5. Click **Create Static Site**.

## 5. Setup Cron Job (Keep Alive Strategy)

Render Free Tier spins down services after 15 minutes of inactivity. To prevent this, you **MUST** use an external service to ping your backend.

### External Cron Job (Required)

1. Go to **[cron-job.org](https://cron-job.org/)** (it's free).
2. Sign up and create a new Cron Job.
3. **URL**: `https://pitshop-mechanix-backend.onrender.com/health`
   - _Note_: We specifically exposed this `/health` endpoint for this purpose.
4. **Schedule**: Select "Every 10 minutes".
5. **Execution**: HTTP GET request.
6. Save.

This external "poke" ensures your app wakes up even if it was put to sleep, keeping it active indefinitely within the 750 free hours limit.
