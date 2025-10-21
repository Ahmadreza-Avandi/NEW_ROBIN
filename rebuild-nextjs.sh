#!/bin/bash

# 🔄 Rebuild NextJS container with API fixes
echo "🔄 Rebuild NextJS container..."

# Stop and remove NextJS container
docker-compose -f docker-compose.deploy.yml stop nextjs
docker-compose -f docker-compose.deploy.yml rm -f nextjs

# Remove NextJS image to force rebuild
docker rmi rabin-last-nextjs 2>/dev/null || true

# Rebuild and start NextJS
echo "🔨 Building NextJS with API fixes..."
docker-compose -f docker-compose.deploy.yml up --build -d nextjs

# Wait for container to be ready
echo "⏳ Waiting for NextJS to be ready..."
sleep 30

# Test the APIs
echo "🧪 Testing APIs..."

# Test documents API
echo "📄 Testing documents API..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/documents || echo " - Documents API test"

# Test system stats API
echo "📊 Testing system stats API..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/system/stats || echo " - System stats API test"

echo ""
echo "✅ NextJS rebuild completed!"
echo "🌐 Check your site: https://crm.robintejarat.com"

# Show logs
echo "📋 Recent logs:"
docker-compose -f docker-compose.deploy.yml logs --tail=10 nextjs