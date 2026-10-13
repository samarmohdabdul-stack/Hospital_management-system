# Separate Cloud Deployment Guide

This guide explains how to deploy the **Hospital Management System**:
- **Backend**: [Railway.app](https://railway.app) (with optional 1-Click MySQL)
- **Frontend**: [Vercel.com](https://vercel.com) (or [Netlify.com](https://netlify.com))

---

## Part 1: Deploy Backend to Railway.app

### Method A: Zero-Config Deployment (H2 In-Memory Database)

1. Go to **[Railway.app](https://railway.app)** and sign in with GitHub.
2. Click **+ New Project** → **Deploy from GitHub repo**.
3. Select `samarmohdabdul-stack/Hospital_management-system`.
4. Click on the newly created service card:
   - Go to **Settings** → **Service Details**:
     - **Root Directory**: set to `/backend` *(or leave blank; `railway.json` is provided)*
   - Go to **Variables** and add:
     - `SPRING_PROFILES_ACTIVE` = `h2`
     - `CORS_ALLOWED_ORIGINS` = `http://localhost:5173,https://*.vercel.app,https://*.netlify.app,https://*.railway.app`
     - `JWT_SECRET` = `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970`
5. Go to **Settings** → **Networking** → Click **Generate Domain**.
   - You will receive a domain like: `https://hospital-management-system-production.up.railway.app`
6. Verify your API:
   - Open: `https://<YOUR-RAILWAY-DOMAIN>/swagger-ui.html`

---

### Method B: Production Deployment with Railway MySQL Database

1. In your Railway project, click **+ New** → **Database** → **Add MySQL**.
2. Railway will instantly spin up a managed MySQL database and automatically provision variables (`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`).
3. Click on your **backend service** → **Variables**:
   - Set `SPRING_PROFILES_ACTIVE` = `mysql`
   - Link the MySQL service or ensure the MySQL variables are shared.
   - Spring Boot is pre-configured to automatically bind to Railway's `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, and `MYSQLPASSWORD`!
4. The database will automatically run Flyway migrations and seed all sample doctors, patients, departments, and admin accounts upon startup!

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
