# Quick Deployment Guide

## ⚠️ Windows Users - Read This!

The CLI build command (`npm run pages:build`) **hangs on Windows** due to Vercel CLI issues.

**Solution**: Use Cloudflare's **Git Integration** instead (recommended).

---

## 🚀 Deploy to Cloudflare Pages (Windows-Friendly)

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy to Cloudflare"
git push origin main
```

### 2. Setup on Cloudflare Dashboard

Go to: https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**

**Build Configuration:**
- Framework: `Next.js`
- Build command: `npx @cloudflare/next-on-pages`
- Build directory: `.vercel/output/static`
- Node version: `20`

**Environment Variables:**
```
NODE_VERSION=20
DATABASE_URL=your-neon-postgres-url
NEXTAUTH_URL=https://aura.pages.dev
NEXTAUTH_SECRET=generate-new-secret
UPLOADTHING_TOKEN=your-token
```

### 3. Deploy!

Click **Save and Deploy** - Done! ✅

---

## 📖 Detailed Guides

- **Windows Deployment**: See `WINDOWS_DEPLOYMENT.md`
- **Full Guide**: See `CLOUDFLARE_DEPLOYMENT.md`

---

## 💡 Why Git Integration?

✅ No Windows issues - builds in Linux  
✅ Automatic deployments on push  
✅ Preview deployments for PRs  
✅ Easy rollbacks  
✅ Build logs in dashboard  

---

## 🔄 Future Updates

Just push to GitHub:
```bash
git add .
git commit -m "Update"
git push
```

Cloudflare automatically rebuilds and deploys! 🎉
