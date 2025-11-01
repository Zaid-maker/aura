# PostgreSQL Migration Guide for Aura

## ✅ Completed Changes

1. **Schema Updated**: Changed from SQLite to PostgreSQL
2. **Text Fields Optimized**: Added `@db.Text` for longer text fields
3. **Environment Variables**: Updated `.env` with PostgreSQL connection string

## 🚀 Migration Steps

### Option 1: Local PostgreSQL (Development)

#### Step 1: Install PostgreSQL

- **Windows**: Download from <https://www.postgresql.org/download/windows/>
- **macOS**: `brew install postgresql@15`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

#### Step 2: Start PostgreSQL Service

```bash
# Windows (using pg_ctl)
pg_ctl -D "C:\Program Files\PostgreSQL\15\data" start

# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

#### Step 3: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE aura;

# Exit psql
\q
```

#### Step 4: Update .env File

Update your `DATABASE_URL` in `.env`:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/aura"
```

#### Step 5: Run Migrations

```bash
# Delete old SQLite migrations (optional)
rm -rf prisma/migrations

# Create new migration
bunx prisma migrate dev --name init

# Generate Prisma Client
bunx prisma generate
```

---

### Option 2: Production Database (Recommended)

#### Popular PostgreSQL Providers

1. **Vercel Postgres** (Recommended for Vercel deployments)
   - Go to your Vercel project → Storage → Create Database → Postgres
   - Copy the connection string
   - Add to your production environment variables

2. **Supabase** (Free tier available)
   - Create project at <https://supabase.com>
   - Go to Project Settings → Database
   - Copy connection string (use "Transaction" pooler mode)
   - Format: `postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

3. **Neon** (Free tier available, serverless)
   - Create project at <https://neon.tech>
   - Copy connection string
   - Add `?sslmode=require` at the end

4. **Railway** (Easy setup)
   - Create new project at <https://railway.app>
   - Add PostgreSQL service
   - Copy connection string from variables

#### Setup for Production

1. **Get your production DATABASE_URL**
2. **Add to environment variables** (e.g., Vercel):

   ```
   DATABASE_URL="your-production-postgres-url"
   ```

3. **Run migration on deployment**:
   - Vercel will automatically run `prisma generate` during build
   - Run migration: `bunx prisma migrate deploy`

---

## 🔧 Deployment Commands

### For First-Time Production Deploy

```bash
# Push schema to production database
bunx prisma db push

# Or create and apply migrations
bunx prisma migrate deploy
```

### For Development

```bash
# Create new migration after schema changes
bunx prisma migrate dev

# Reset database (⚠️ deletes all data)
bunx prisma migrate reset

# Open Prisma Studio to view data
bunx prisma studio
```

---

## 📝 Important Notes

1. **SQLite → PostgreSQL Differences Handled**:
   - ✅ Changed `provider` to `postgresql`
   - ✅ Added `@db.Text` for long text fields (tokens, captions, bio, comments)
   - ✅ All other schema structure remains compatible

2. **Data Migration** (if you have existing data):
   - Export SQLite data: Use a tool like `prisma db pull` + export script
   - Import to PostgreSQL: Use `prisma db seed` or manual SQL import

3. **Connection Pooling** (for production):
   - Use connection poolers like PgBouncer (Supabase provides this)
   - Or use Prisma Data Proxy for serverless

4. **Environment Variables Needed**:

   ```
   DATABASE_URL="postgresql://..."
   NEXTAUTH_URL="https://your-domain.com"
   NEXTAUTH_SECRET="your-production-secret"
   UPLOADTHING_TOKEN="your-token"
   ```

---

## 🎯 Quick Start Commands

```bash
# 1. Update your DATABASE_URL in .env
# 2. Delete SQLite file and old migrations
rm prisma/dev.db
rm -rf prisma/migrations

# 3. Create new migrations
bunx prisma migrate dev --name init

# 4. Generate Prisma Client
bunx prisma generate

# 5. (Optional) Seed database
bunx prisma db seed

# 6. Start development server
bun run dev
```

---

## 🚨 Troubleshooting

### "Connection refused" error

- Ensure PostgreSQL is running
- Check username/password in DATABASE_URL
- Verify port (default: 5432)

### "Database does not exist" error

- Create database: `createdb aura` or use psql

### SSL/TLS errors in production

- Add `?sslmode=require` to DATABASE_URL
- Some providers require: `?sslmode=require&sslaccept=accept_invalid_certs`

### Migration errors

- Reset migrations: `bunx prisma migrate reset`
- Force push schema: `bunx prisma db push --force-reset`

---

## ✨ You're Ready

Your app is now configured for PostgreSQL. Choose your database provider and follow the steps above!
