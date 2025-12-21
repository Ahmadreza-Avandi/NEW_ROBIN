<?php
/**
 * ایجاد ZIP با PHP
 */

echo "📦 Creating ZIP package with PHP...\n";

$build_dir = __DIR__ . '/build';
$plugin_name = 'wordpress-crm-integration-professional';
$version = '2.0.0';
$plugin_build_dir = $build_dir . '/' . $plugin_name;

if (!class_exists('ZipArchive')) {
    echo "❌ ZipArchive class not available\n";
    exit(1);
}

$zip = new ZipArchive();
$zip_name = $plugin_name . '-v' . $version . '.zip';
$zip_path = $build_dir . '/' . $zip_name;

if ($zip->open($zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
    echo "❌ Cannot create ZIP file: $zip_path\n";
    exit(1);
}

// تابع بازگشتی برای اضافه کردن فایل‌ها
function addFolderToZip($folder, $zip, $base_path = '') {
    $files = scandir($folder);
    
    foreach ($files as $file) {
        if ($file == '.' || $file == '..') continue;
        
        $file_path = $folder . '/' . $file;
        $zip_path = $base_path . $file;
        
        if (is_dir($file_path)) {
            $zip->addEmptyDir($zip_path);
            addFolderToZip($file_path, $zip, $zip_path . '/');
        } else {
            $zip->addFile($file_path, $zip_path);
        }
    }
}

// اضافه کردن فایل‌ها به ZIP
addFolderToZip($plugin_build_dir, $zip, $plugin_name . '/');

$result = $zip->close();

if ($result) {
    $zip_size = filesize($zip_path);
    $zip_size_kb = round($zip_size / 1024, 2);
    
    echo "✅ ZIP package created successfully!\n";
    echo "📦 File: $zip_name\n";
    echo "📏 Size: $zip_size_kb KB\n";
    echo "📍 Location: $zip_path\n";
    
    echo "\n🎉 Both TAR.GZ and ZIP packages are ready!\n";
    echo "📥 Upload either file to WordPress\n";
} else {
    echo "❌ Failed to create ZIP package\n";
}

echo "\n" . str_repeat("=", 50) . "\n";