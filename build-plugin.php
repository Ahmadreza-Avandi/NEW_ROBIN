<?php
/**
 * اسکریپت بیلد پلاگین WordPress CRM Integration
 */

echo "🚀 Building WordPress CRM Integration Plugin\n";
echo str_repeat("=", 60) . "\n\n";

$source_dir = __DIR__ . '/wordpress-crm-simple';
$build_dir = __DIR__ . '/build';
$plugin_name = 'wordpress-crm-integration-professional';
$version = '2.0.0';

// 1. ایجاد پوشه بیلد
echo "📁 Creating build directory...\n";
if (!is_dir($build_dir)) {
    mkdir($build_dir, 0755, true);
    echo "✅ Build directory created\n";
} else {
    echo "✅ Build directory exists\n";
}

$plugin_build_dir = $build_dir . '/' . $plugin_name;
if (is_dir($plugin_build_dir)) {
    // پاک کردن پوشه قبلی
    exec("rm -rf \"$plugin_build_dir\"");
}
mkdir($plugin_build_dir, 0755, true);

echo "\n";

// 2. کپی فایل‌ها
echo "📋 Copying plugin files...\n";

$files_to_copy = [
    'wordpress-crm-integration.php' => 'Main plugin file',
    'readme.txt' => 'WordPress readme',
    'includes/' => 'PHP classes',
    'assets/' => 'CSS/JS assets',
    'languages/' => 'Translation files'
];

foreach ($files_to_copy as $file => $description) {
    $source_path = $source_dir . '/' . $file;
    $dest_path = $plugin_build_dir . '/' . $file;
    
    if (file_exists($source_path)) {
        if (is_dir($source_path)) {
            exec("cp -r \"$source_path\" \"$dest_path\"");
        } else {
            copy($source_path, $dest_path);
        }
        echo "✅ Copied $description\n";
    } else {
        echo "⚠️  Missing: $file\n";
    }
}

echo "\n";

// 3. ایجاد فایل‌های اضافی
echo "📝 Creating additional files...\n";

// فایل LICENSE
$license_content = "GPL v2 or later

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
";

file_put_contents($plugin_build_dir . '/LICENSE', $license_content);
echo "✅ Created LICENSE file\n";

// فایل CHANGELOG
$changelog_content = "# Changelog

## Version 2.0.0 (2024-12-21)

### Added
- Complete WordPress CRM Integration
- Multi-tenant support
- Persian language support (RTL)
- WooCommerce integration
- Advanced logging system
- Real-time synchronization
- Professional admin interface
- API key management
- Event handling system

### Features
- Customer synchronization
- Order tracking
- User management
- Activity logging
- Error handling
- Security measures
- Performance optimization

### Technical
- WordPress 5.0+ compatibility
- PHP 7.4+ support
- MySQL/MariaDB support
- REST API integration
- AJAX functionality
- Responsive design
";

file_put_contents($plugin_build_dir . '/CHANGELOG.md', $changelog_content);
echo "✅ Created CHANGELOG.md\n";

// فایل INSTALLATION
$installation_content = "# Installation Guide

## Requirements
- WordPress 5.0 or higher
- PHP 7.4 or higher
- MySQL 5.6 or MariaDB 10.0 or higher
- cURL extension
- JSON extension
- mbstring extension

## Installation Steps

### Method 1: WordPress Admin
1. Download the plugin zip file
2. Go to WordPress Admin > Plugins > Add New
3. Click 'Upload Plugin'
4. Choose the zip file and click 'Install Now'
5. Activate the plugin

### Method 2: Manual Installation
1. Extract the zip file
2. Upload the 'wordpress-crm-integration' folder to wp-content/plugins/
3. Go to WordPress Admin > Plugins
4. Find 'WordPress CRM Integration - Professional' and activate it

## Configuration
1. Go to WordPress Admin > CRM Integration
2. Enter your CRM URL (e.g., https://your-crm.com)
3. Enter your API key
4. Configure synchronization settings
5. Test the connection
6. Enable synchronization

## Troubleshooting
- Check WordPress error logs
- Verify API credentials
- Ensure proper file permissions
- Check server requirements
";

file_put_contents($plugin_build_dir . '/INSTALLATION.md', $installation_content);
echo "✅ Created INSTALLATION.md\n";

echo "\n";

// 4. بررسی نهایی
echo "🔍 Final verification...\n";

$required_files = [
    'wordpress-crm-integration.php',
    'includes/class-admin.php',
    'includes/class-api-client.php',
    'includes/class-logger.php',
    'includes/class-event-handler.php',
    'assets/css/admin.css',
    'assets/js/admin.js',
    'languages/wordpress-crm-integration-fa_IR.po'
];

$all_good = true;
foreach ($required_files as $file) {
    $file_path = $plugin_build_dir . '/' . $file;
    if (file_exists($file_path)) {
        $size = filesize($file_path);
        echo "✅ $file ($size bytes)\n";
    } else {
        echo "❌ Missing: $file\n";
        $all_good = false;
    }
}

echo "\n";

// 5. ایجاد ZIP
if ($all_good) {
    echo "📦 Creating TAR.GZ package...\n";
    
    $tar_name = $plugin_name . '-v' . $version . '.tar.gz';
    $tar_path = $build_dir . '/' . $tar_name;
    
    // حذف ZIP قبلی
    if (file_exists($zip_path)) {
        unlink($zip_path);
    }
    
    // ایجاد TAR.GZ جدید
    $tar_name = $plugin_name . '-v' . $version . '.tar.gz';
    $tar_path = $build_dir . '/' . $tar_name;
    
    // حذف TAR قبلی
    if (file_exists($tar_path)) {
        unlink($tar_path);
    }
    
    $command = "cd \"$build_dir\" && tar -czf \"$tar_name\" \"$plugin_name\"";
    exec($command, $output, $return_var);
    
    if ($return_var === 0 && file_exists($tar_path)) {
        $tar_size = filesize($tar_path);
        $tar_size_kb = round($tar_size / 1024, 2);
        
        echo "✅ TAR.GZ package created successfully!\n";
        echo "📦 File: $tar_name\n";
        echo "📏 Size: $tar_size_kb KB\n";
        echo "📍 Location: $tar_path\n";
        
        echo "\n🎉 BUILD COMPLETED SUCCESSFULLY!\n\n";
        
        echo "📋 Package Contents:\n";
        echo "   • Main plugin file with headers\n";
        echo "   • Complete PHP class structure\n";
        echo "   • Admin interface (CSS/JS)\n";
        echo "   • Persian language support\n";
        echo "   • Documentation files\n";
        echo "   • License and changelog\n\n";
        
        echo "🚀 Ready for distribution!\n";
        echo "📥 Extract and upload to WordPress: $tar_name\n";
        
    } else {
        echo "❌ Failed to create TAR.GZ package\n";
        echo "Command output: " . implode("\n", $output) . "\n";
    }
} else {
    echo "❌ Build verification failed. Fix missing files first.\n";
}

echo "\n" . str_repeat("=", 60) . "\n";