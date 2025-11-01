#!/bin/bash

echo "🚀 Setting up PostgreSQL for Aura..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with DATABASE_URL"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env; then
    echo "❌ DATABASE_URL not found in .env"
    echo "Please add: DATABASE_URL=\"postgresql://username:password@host:5432/database\""
    exit 1
fi

echo "✅ .env file found"
echo ""

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Fresh migration (deletes old migrations, creates new ones)"
echo "2) Push schema to database (quick, no migration files)"
echo "3) Create migration from schema changes"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🗑️  Removing old SQLite files and migrations..."
        rm -f prisma/dev.db prisma/dev.db-journal
        rm -rf prisma/migrations
        
        echo "📝 Creating new PostgreSQL migration..."
        bunx prisma migrate dev --name init
        
        echo "🔧 Generating Prisma Client..."
        bunx prisma generate
        
        echo ""
        echo "✅ Fresh migration complete!"
        echo "Your database is ready to use."
        ;;
    2)
        echo ""
        echo "📤 Pushing schema to database..."
        bunx prisma db push
        
        echo "🔧 Generating Prisma Client..."
        bunx prisma generate
        
        echo ""
        echo "✅ Schema pushed successfully!"
        echo "Your database is ready to use."
        ;;
    3)
        echo ""
        echo "📝 Creating migration..."
        read -p "Enter migration name: " migration_name
        bunx prisma migrate dev --name "$migration_name"
        
        echo ""
        echo "✅ Migration created!"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Done! You can now run:"
echo "   bun run dev     - Start development server"
echo "   bun db:studio   - Open Prisma Studio"
echo ""
