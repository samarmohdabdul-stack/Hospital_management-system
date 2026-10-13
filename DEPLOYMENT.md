# Separate Cloud Deployment Guide

This guide explains how to deploy the **Hospital Management System** frontend and backend independently to free cloud hosting providers:
- **Backend**: [Render.com](https://render.com) (or [Railway.app](https://railway.app))
- **Frontend**: [Vercel.com](https://vercel.com) (or [Netlify.com](https://netlify.com))

---

## Part 1: Deploy Backend to Render (Free)

### Step 1.1: Sign up & Create Web Service
1. Sign in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository:
   `https://github.com/samarmohdabdul-stack/Hospital_management-system`

### Step 1.2: Configure Web Service
Configure the settings in Render:

| Field | Value |
| :--- | :--- |
| **Name** | `hospital-backend` *(or any unique name)* |
| **Region** | Select closest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Docker` *(select Docker to use the included multi-stage Dockerfile)* |
| **Instance Type** | `Free` |

> **Note**: If choosing **Native Java** instead of Docker:
> - **Build Command**: `mvn clean package -DskipTests`
> - **Start Command**: `java -Dserver.port=$PORT -jar target/hospital-management-system-1.0.0.jar`

### Step 1.3: Set Environment Variables on Render
Scroll to **Environment Variables** and add:

| Key | Recommended Value | Description |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `h2` | Uses zero-config in-memory database with preloaded demo data |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,https://*.vercel.app,https://*.netlify.app,https://*.onrender.com` | Permits requests from your frontend domains |
| `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | 256-bit HMAC secret |

*(Optional: To use a live MySQL database instead of H2, change `SPRING_PROFILES_ACTIVE` to `mysql` and add `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and `SPRING_DATASOURCE_PASSWORD` from [Aiven.io](https://aiven.io) or Railway).*

### Step 1.4: Deploy & Copy URL
Click **Deploy Web Service**.
Once deployed, Render gives you a public URL such as:
`https://hospital-backend-xxxx.onrender.com`

Verify it by opening:
`https://hospital-backend-xxxx.onrender.com/swagger-ui.html`

---

## Part 2: Deploy Frontend to Vercel (Free)

### Step 2.1: Import Project in Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New…** → **Project**.
3. Select your GitHub repository:
   `Hospital_management-system`

### Step 2.2: Configure Project Settings
In the configuration screen:

1. **Framework Preset**: `Vite`
2. **Root Directory**: Click **Edit** and choose `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`

### Step 2.3: Set Environment Variable
Expand **Environment Variables** and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://hospital-backend-xxxx.onrender.com` | Your deployed backend URL from Part 1 (without trailing slash) |

### Step 2.4: Deploy
Click **Deploy**.
In about 45 seconds, Vercel will provide your live frontend URL:
`https://hospital-management-system-xxxx.vercel.app`

---

## Alternative: Deploy Frontend to Netlify

If you prefer Netlify:
1. Log in to [Netlify](https://app.netlify.com).
2. Click **Add new site** → **Import an existing project** → **GitHub**.
3. Choose `Hospital_management-system`.
4. Set:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. In **Environment variables**, add:
   - `VITE_API_BASE_URL` = `https://hospital-backend-xxxx.onrender.com`
6. Click **Deploy Site**.

---

## Testing the Production System

Open your deployed frontend URL (on Vercel or Netlify) and test with the demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@hospital.com` | `password123` |
| **Doctor** | `doctor1@hospital.com` | `password123` |
| **Patient** | `patient1@hospital.com` | `password123` |
