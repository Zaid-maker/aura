# Cloudflare Pages Deployment Guide for Aura

This guide will help you deploy your Aura app to Cloudflare Pages.

## 🚀 Quick Deployment Steps

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Prepare for Cloudflare deployment"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Click **Pages** → **Create a project**
   - Select **Connect to Git**
   - Choose your repository

3. **Configure Build Settings**

   ```
   Framework preset: Next.js
   Build command: npx @cloudflare/next-on-pages
   Build output directory: .vercel/output/static
   Root directory: (leave empty)
   ```

4. **Add Environment Variables**
   Go to **Settings** → **Environment variables** and add:

   ```
   DATABASE_URL=your-neon-postgres-url
   NEXTAUTH_URL=https://your-app.pages.dev
   NEXTAUTH_SECRET=your-production-secret
   UPLOADTHING_TOKEN=your-uploadthing-token
   NODE_VERSION=20
   ```

5. **Deploy**
   - Click **Save and Deploy**
   - Wait for build to complete
   - Your app will be live at `https://your-app.pages.dev`

---

### Option 2: Deploy via CLI (Advanced)

1. **Login to Cloudflare**

   ```bash
   npx wrangler login
   ```

2. **Build your app**

   ```bash
   bun run pages:build
   ```

3. **Deploy to Cloudflare Pages**

   ```bash
   npx wrangler pages deploy .vercel/output/static --project-name=aura
   ```

4. **Set environment variables via CLI**

   ```bash
   npx wrangler pages secret put DATABASE_URL --project-name=aura
   npx wrangler pages secret put NEXTAUTH_SECRET --project-name=aura
   npx wrangler pages secret put NEXTAUTH_URL --project-name=aura
   npx wrangler pages secret put UPLOADTHING_TOKEN --project-name=aura
   ```

---

## ⚙️ Configuration Details

### Build Command

The build process uses `@cloudflare/next-on-pages` which converts your Next.js app to run on Cloudflare's Workers runtime.

```bash
# Development build
bun run pages:build

# Preview locally
bun run preview

# Deploy
bun run cf:deploy
```

### Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `NEXTAUTH_URL` | Your app URL | `https://aura.pages.dev` |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Generate with `openssl rand -base64 32` |
| `UPLOADTHING_TOKEN` | UploadThing API token | From uploadthing.com |
| `NODE_VERSION` | Node.js version | `20` |

### Edge Runtime Compatibility

Your API routes are currently using the Node.js runtime. For optimal Cloudflare Pages performance, you may want to:

1. **Option A: Keep as-is** (Cloudflare supports Node.js compatibility)
   - Already configured in `wrangler.toml` with `nodejs_compat` flag
   - No changes needed to your code
   - Slightly higher cold start times

2. **Option B: Migrate to Edge Runtime** (Better performance)
   - Add `export const runtime = 'edge';` to each API route
   - May require changes to NextAuth configuration
   - Faster cold starts and better performance

---

## 🔧 Important Notes

### 1. Database Connection

- Your Neon PostgreSQL database will work perfectly with Cloudflare
- Make sure your `DATABASE_URL` includes `?sslmode=require`
- Connection pooling is handled by Neon automatically

### 2. Image Optimization

Next.js Image Optimization works on Cloudflare Pages with some limitations:

- External images are supported
- Automatic WebP conversion works
- Consider using Cloudflare Images for better performance

### 3. File Uploads (UploadThing)

UploadThing works seamlessly with Cloudflare Pages:

- No changes needed to your current setup
- Files are stored in UploadThing's S3
- CDN delivery is automatic

### 4. Session Management

NextAuth.js works on Cloudflare with the Prisma adapter:

- Sessions are stored in your PostgreSQL database
- Make sure `NEXTAUTH_URL` points to your production URL
- Regenerate `NEXTAUTH_SECRET` for production

---

## 📝 Custom Domain Setup

1. Go to your Cloudflare Pages project
2. Click **Custom domains** → **Set up a custom domain**
3. Enter your domain (must be on Cloudflare)
4. DNS records will be automatically configured
5. SSL certificate is provisioned automatically

---

## 🐛 Troubleshooting

### Build Fails with "Module not found"

```bash
# Clear cache and rebuild
rm -rf .next .vercel
bun run pages:build
```

### "Runtime is not compatible" errors

- Make sure `nodejs_compat` is in `wrangler.toml`
- Check that all dependencies support Edge runtime

### Database connection errors

- Verify `DATABASE_URL` is set correctly
- Ensure your database allows connections from Cloudflare IPs
- Check that SSL is enabled in connection string

### NextAuth session issues

- Verify `NEXTAUTH_URL` matches your deployment URL
- Check `NEXTAUTH_SECRET` is set
- Ensure database tables are migrated

---

## 🎯 Performance Tips

1. **Enable Cloudflare Caching**
   - Static assets are cached automatically
   - Configure cache rules in Cloudflare dashboard

2. **Use Cloudflare Analytics**
   - Built-in Web Analytics
   - Real User Monitoring (RUM)
   - Performance insights

3. **Optimize Images**
   - Consider migrating to Cloudflare Images
   - Use appropriate image formats (WebP, AVIF)
   - Lazy load images below the fold

4. **Monitor Performance**
   - Check Workers Analytics in dashboard
   - Monitor cold start times
   - Review error logs regularly

---

## 🚦 Deployment Checklist

Before deploying to production:

- [ ] All environment variables are set
- [ ] Database migrations are applied (`bun db:push`)
- [ ] `NEXTAUTH_URL` points to production URL
- [ ] `NEXTAUTH_SECRET` is regenerated for production
- [ ] Test build locally with `bun run preview`
- [ ] Remove any development-only code
- [ ] Update CORS settings if needed
- [ ] Configure custom domain
- [ ] Set up monitoring and alerts
- [ ] Test all critical user flows

---

## 📚 Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs)
- [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the [Next-on-Pages FAQ](https://github.com/cloudflare/next-on-pages/blob/main/packages/next-on-pages/docs/faq.md)
2. Review build logs in Cloudflare dashboard
3. Check Cloudflare Community forums
4. Open an issue on the next-on-pages GitHub repo

---

**You're ready to deploy! 🎉**

Run `bun run pages:build` to test the build process, then push to GitHub and connect to Cloudflare Pages!
