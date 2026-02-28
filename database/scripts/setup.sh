#!/bin/bash

# =====================================================
# QR Service Platform - Database Setup Script
# Description: Automated setup for PostgreSQL & MongoDB
# Usage: ./database/scripts/setup.sh
# =====================================================

set -e  # Exit on error

echo "🚀 Starting QR Service Platform Database Setup..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="qr_service_platform"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"

# =====================================================
# 1️⃣ PostgreSQL Setup
# =====================================================

echo "📊 Setting up PostgreSQL..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo -e "${RED}❌ PostgreSQL is not running!${NC}"
    echo "Please start PostgreSQL and try again."
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Create database if not exists
if psql -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping database..."
        psql -U "$POSTGRES_USER" -c "DROP DATABASE IF EXISTS $DB_NAME;"
        psql -U "$POSTGRES_USER" -c "CREATE DATABASE $DB_NAME;"
        echo -e "${GREEN}✅ Database recreated${NC}"
    else
        echo "Skipping database creation..."
    fi
else
    echo "Creating database '$DB_NAME'..."
    psql -U "$POSTGRES_USER" -c "CREATE DATABASE $DB_NAME;"
    echo -e "${GREEN}✅ Database created${NC}"
fi

# Run migrations
echo ""
echo "Running PostgreSQL migrations..."

echo "  → 001_initial_schema.sql"
psql -U "$POSTGRES_USER" -d "$DB_NAME" -f database/migrations/postgresql/001_initial_schema.sql > /dev/null 2>&1
echo -e "${GREEN}  ✅ Schema created${NC}"

echo "  → 002_triggers_and_functions.sql"
psql -U "$POSTGRES_USER" -d "$DB_NAME" -f database/migrations/postgresql/002_triggers_and_functions.sql > /dev/null 2>&1
echo -e "${GREEN}  ✅ Triggers and functions created${NC}"

echo "  → 003_indexes_optimization.sql"
psql -U "$POSTGRES_USER" -d "$DB_NAME" -f database/migrations/postgresql/003_indexes_optimization.sql > /dev/null 2>&1
echo -e "${GREEN}  ✅ Indexes optimized${NC}"

# Verify PostgreSQL setup
TABLE_COUNT=$(psql -U "$POSTGRES_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo -e "${GREEN}✅ PostgreSQL setup complete! ($TABLE_COUNT tables created)${NC}"

# =====================================================
# 2️⃣ MongoDB Setup
# =====================================================

echo ""
echo "🍃 Setting up MongoDB..."

# Check if MongoDB is running
if ! mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${RED}❌ MongoDB is not running!${NC}"
    echo "Please start MongoDB and try again."
    exit 1
fi

echo -e "${GREEN}✅ MongoDB is running${NC}"

# Run MongoDB migrations
echo "Running MongoDB migrations..."
mongosh --quiet < database/migrations/mongodb/001_collections_setup.js

# Verify MongoDB setup
COLLECTION_COUNT=$(mongosh --quiet --eval "use $DB_NAME; db.getCollectionNames().length")
echo -e "${GREEN}✅ MongoDB setup complete! ($COLLECTION_COUNT collections created)${NC}"

# =====================================================
# 3️⃣ Summary
# =====================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Database Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 PostgreSQL:"
echo "   Database: $DB_NAME"
echo "   Tables: $TABLE_COUNT"
echo "   Connection: postgresql://$POSTGRES_USER@localhost:5432/$DB_NAME"
echo ""
echo "🍃 MongoDB:"
echo "   Database: $DB_NAME"
echo "   Collections: $COLLECTION_COUNT"
echo "   Connection: mongodb://$MONGO_HOST:$MONGO_PORT/$DB_NAME"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Update your .env file with database credentials"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo ""
