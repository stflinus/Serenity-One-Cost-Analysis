# Timeshare & Subscription Audit Simulator

A highly polished, ultra-responsive, fully full-screen desktop dashboard designed for auditing timeshares, contract horizons, and exit costs.

This repository is optimized and preppped for deployment on **Vercel Web Hosting** with zero-configuration required.

## 🚀 Prepped for Vercel Deployment

This project includes standard SPA structures and settings tailored to compile and serve perfectly on Vercel:

1. **`vercel.json` Routing Config**: Standard rewrite rules are injected to support deep-linking, direct sub-path navigation, or page refreshes without 404 errors.
2. **Build Destination**: Vercel automatically detects the Vite framework and defaults the build target dynamically to `dist/`.
3. **Responsive Visual Grid**: Standardized styles fit full-screen displays across all monitors and screens elegantly.

### ⚡ Easy Step-by-Step Vercel Deployment

If you want to host this application live on Vercel:

1. **Push to GitHub / GitLab / Bitbucket**:
   - First, export your workspace as a `.zip` from the AI Studio Settings menu, or export to GitHub directly.
   - Initialize git, commit your files, and push them to your repository.

2. **Deploy on Vercel**:
   - Go to [Vercel](https://vercel.com/) and log into your account.
   - Click **Add New** > **Project**.
   - Import your GitHub repository.
   
3. **Configure Settings (Dynamic Detection)**:
   - Vercel automatically detects **Vite** as your preset framework.
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build` (runs `vite build`)
   - **Output Directory**: `dist`
   - Click **Deploy**!

Within minutes, your application will be live on a secure HTTPS domain provided by Vercel!

---

## 🛠️ Local Development

To run this project locally:

```bash
# 1. Install all dependencies
npm install

# 2. Spin up the Vite development server
npm run dev
```

Open your browser to the local server url: e.g., `http://localhost:3000`.
