#!/bin/bash

# WordPress CRM Integration Plugin Build Script
# This script builds the plugin deployment package

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "WordPress CRM Integration Plugin Builder"
echo "========================================"
echo ""

# Check if PHP is available
if ! command -v php &> /dev/null; then
    echo "Error: PHP is not installed or not in PATH"
    exit 1
fi

# Check PHP version (require 7.4+)
PHP_VERSION=$(php -r "echo PHP_VERSION_ID;")
if [ "$PHP_VERSION" -lt 70400 ]; then
    echo "Error: PHP 7.4 or higher is required"
    exit 1
fi

echo "Using PHP version: $(php -r 'echo PHP_VERSION;')"
echo ""

# Run the PHP build script
echo "Starting build process..."
php build.php

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "Build completed successfully!"
    echo ""
    
    # List created files
    if [ -d "build" ]; then
        echo "Created files:"
        ls -la build/
        echo ""
        
        # Show ZIP file details
        ZIP_FILE=$(find build -name "*.zip" -type f | head -1)
        if [ -n "$ZIP_FILE" ]; then
            echo "Plugin package: $ZIP_FILE"
            echo "Package size: $(du -h "$ZIP_FILE" | cut -f1)"
            echo ""
            echo "Installation instructions:"
            echo "1. Upload $ZIP_FILE to WordPress admin > Plugins > Add New > Upload Plugin"
            echo "2. Activate the plugin"
            echo "3. Configure the plugin at Settings > CRM Integration"
        fi
    fi
else
    echo "Build failed!"
    exit 1
fi