#!/bin/bash

# 🔧 Make all scripts executable

echo "🔧 Making all scripts executable..."

chmod +x deploy-server.sh
chmod +x view-rabin-logs.sh
chmod +x test-rabin-deployment.sh
chmod +x make-scripts-executable.sh

echo "✅ All scripts are now executable!"
echo ""
echo "Available scripts:"
echo "  ./deploy-server.sh              - Deploy CRM + Rabin Voice"
echo "  ./deploy-server.sh --clean      - Deploy with full cleanup"
echo "  ./view-rabin-logs.sh            - View Rabin Voice logs"
echo "  ./test-rabin-deployment.sh      - Test Rabin Voice deployment"