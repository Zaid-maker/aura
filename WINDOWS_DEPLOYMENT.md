# Windows Deployment Guide for Cloudflare Pages

**Problem**: The `@cloudflare/next-on-pages` CLI hangs on Windows due to Vercel CLI compatibility issues.

**Solution**: Use Cloudflare's Git integration instead of the CLI.

---

## ✅ Recommended Approach: Git Integration (Best for Windows)

This method is **more reliable** and **automatic** - Cloudflare builds your app in their environment (Linux) where the build tools work perfectly.

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for Cloudflare deployment"
git push origin main
```

### Step 2: Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Workers & Pages** → **Create application** → **Pages**
3. Click **Connect to Git**
4. Select your repository: `Zaid-maker/aura`
5. Click **Begin setup**

### Step 3: Configure Build Settings

Set these exact values:

```
Production branch: main
Framework preset: Next.js
Build command: npx @cloudflare/next-on-pages
Build output directory: .vercel/output/static
Root directory: (leave empty)
Node version: 20
```

### Step 4: Add Environment Variables

Click **Environment variables** → **Add variable** and add these:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `NODE_VERSION` | `20` | Required |
| `DATABASE_URL` | `your-neon-postgres-url` | From Neon dashboard |
| `NEXTAUTH_URL` | `https://aura.pages.dev` | Update after first deploy |
| `NEXTAUTH_SECRET` | Generate new secret | Run: `openssl rand -base64 32` |
| `UPLOADTHING_TOKEN` | Your token | From your current `.env` |

### Step 5: Deploy

1. Click **Save and Deploy**
2. Wait 2-5 minutes for the build
3. Your app will be live at `https://aura-xxx.pages.dev`

### Step 6: Update NEXTAUTH_URL

After first deployment:
1. Copy your deployment URL (e.g., `https://aura-xxx.pages.dev`)
2. Go back to **Settings** → **Environment variables**
3. Update `NEXTAUTH_URL` with your actual URL
4. Click **Redeploy**

---

## 🔄 Future Deployments

After the initial setup, deployments are automatic:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Cloudflare automatically:
- Detects the push
- Builds your app (in Linux environment - no Windows issues!)
- Deploys to production
- Updates your live site

---

## 🏗️ How Cloudflare Builds Your App

On their Linux servers, Cloudflare runs:

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Build Next.js
npx @cloudflare/next-on-pages

# 4. Deploy
# (automatic)
```

All of this happens in a Linux container, so **no Windows compatibility issues**!

---

## 🐛 Alternative: Windows Subsystem for Linux (WSL)

If you really need CLI deployment, use WSL:

### Install WSL (one-time setup)

```powershell
# Run in PowerShell as Administrator
wsl --install
```

Restart your computer, then:

```bash
# Inside WSL
cd /mnt/c/Users/User/Desktop/apnagram

# Install dependencies
bun install

# Build
npm run build
npx @cloudflare/next-on-pages

# Deploy
npx wrangler pages deploy .vercel/output/static --project-name=aura
```

---

## 📊 Deployment Comparison

| Method | Pros | Cons | Recommended? |
|--------|------|------|--------------|
| **Git Integration** | ✅ No Windows issues<br>✅ Automatic deployments<br>✅ Preview deployments<br>✅ Build logs in dashboard | ❌ Requires GitHub | ✅ **YES** |
| **CLI (Native Windows)** | ✅ Direct control | ❌ Hangs on Windows<br>❌ Vercel CLI issues | ❌ No |
| **CLI (WSL)** | ✅ Works like Linux<br>✅ Direct control | ❌ Extra setup<br>❌ Manual process | ⚠️ If you need CLI |

---

## ✨ Benefits of Git Integration

1. **No Build Issues**: Builds happen in Cloudflare's Linux environment
2. **Automatic Previews**: Every PR gets a preview URL
3. **Rollback Support**: Easy to rollback to previous deployments
4. **Build Cache**: Faster subsequent builds
5. **No Local Build**: Save your battery and time

---

## 🎯 Quick Checklist

Before pushing to GitHub:

- [ ] All code is committed
- [ ] `.env` is in `.gitignore` (already done)
- [ ] Database migrations applied (`bun db:push`)
- [ ] Test locally with `bun run dev`
- [ ] Environment variables ready to copy

---

## 🚀 You're Ready!

1. Push to GitHub: `git push origin main`
2. Go to Cloudflare Dashboard
3. Connect your repository
4. Configure build settings (use the values above)
5. Add environment variables
6. Deploy!

**Your app will be live in 3-5 minutes!** 🎉

---

## 💡 Pro Tips

1. **Custom Domain**: Add your domain in Cloudflare Pages settings after deployment
2. **Branch Deployments**: Push to other branches for preview deployments
3. **Build Logs**: Check build logs in Cloudflare dashboard if anything fails
4. **Local Testing**: Use `bun run dev` - no need for Cloudflare build locally

---

## 📞 Need Help?

If build fails on Cloudflare:
1. Check build logs in Cloudflare dashboard
2. Verify all environment variables are set
3. Make sure `NODE_VERSION=20` is set
4. Check that your database is accessible from Cloudflare IPs

Most common issues:
- Missing environment variables
- Database connection string incorrect
- Node version not set
