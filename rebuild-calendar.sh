#!/bin/bash

# 🔄 Rebuild NextJS with Calendar fixes
echo "🔄 Rebuilding NextJS with Calendar fixes..."

# Stop NextJS container
docker-compose -f docker-compose.deploy.yml stop nextjs

# Remove NextJS container and image
docker-compose -f docker-compose.deploy.yml rm -f nextjs
docker rmi rabin-last-nextjs 2>/dev/null || true

# Rebuild NextJS
echo "🔨 Building NextJS with Calendar fixes..."
docker-compose -f docker-compose.deploy.yml up --build -d nextjs

# Wait for container to be ready
echo "⏳ Waiting for NextJS to be ready..."
sleep 30

# Test the calendar page
echo "🧪 Testing Calendar APIs..."

# Test events API
echo "📅 Testing events API..."
curl -s -o /dev/null -w "Events API: %{http_code}\n" http://localhost:3000/api/events

echo ""
echo "✅ Calendar rebuild completed!"
echo "🌐 Check calendar page: https://crm.robintejarat.com/dashboard/calendar"

# Show recent logs
echo "📋 Recent NextJS logs:"
docker-compose -f docker-compose.deploy.yml logs --tail=10 nextjs