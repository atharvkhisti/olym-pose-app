#!/bin/bash
# EC2 Production Deployment Script
# Run this script ON YOUR EC2 INSTANCE

set -e  # Exit on any error

echo "🚀 Starting deployment..."

# Navigate to project directory
cd ~/olym-pose-app || { echo "❌ Project directory not found"; exit 1; }

# Pull latest code
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Create/Update .env file with production values
echo "📝 Updating production environment variables..."
cat > .env << 'EOF'
# Production Environment Variables
NEXTAUTH_URL=https://olympose.13-233-133-240.sslip.io
NEXTAUTH_SECRET=production-secret-change-this-to-random-string-min-32-chars

# Google OAuth - UPDATE THESE WITH YOUR ACTUAL VALUES
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# MongoDB Atlas
MONGODB_URI=mongodb+srv://olympose:A2eKitbvgUZ9MMmn@cluster0.eduprpm.mongodb.net/?appName=Cluster0

# AI Service
NEXT_PUBLIC_AI_SERVICE_URL=https://olympose.13-233-133-240.sslip.io/api

# Production settings
NODE_ENV=production
APP_ENV=production
NEXT_PUBLIC_APP_NAME=Olym Pose
EOF

echo "⚠️  IMPORTANT: Edit .env file and add your actual GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
echo "   Run: nano .env"
echo ""
read -p "Press Enter after you've updated the .env file with Google credentials..."

# Pull latest Docker images
echo "🐳 Pulling latest Docker images..."
docker compose -f docker-compose.prod.yml pull

# Restart services
echo "♻️  Restarting services..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
echo "📊 Service status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Update Google OAuth redirect URI in Google Cloud Console:"
echo "   Add: https://olympose.13-233-133-240.sslip.io/api/auth/callback/google"
echo ""
echo "2. Check logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f web"
echo ""
echo "3. Test the application:"
echo "   https://olympose.13-233-133-240.sslip.io"
