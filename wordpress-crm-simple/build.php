<?php
/**
 * Build script برای WordPress CRM Integration - Professional
 */

echo "🚀 Building WordPress CRM Integration - Professional v2.0.0\n";
echo str_repeat("=", 60) . "\n\n";

$plugin_dir = __DIR__;
$build_dir = $plugin_dir . '/build';
$zip_name = 'wordpress-crm-integration-professional-v2.0.0.zip';

// پاک کردن build directory قبلی
if (is_dir($build_dir)) {
    deleteDirectory($build_dir);
}

// ایجاد build directory
mkdir($build_dir, 0755, true);
mkdir($build_dir . '/wordpress-crm-integration', 0755, true);

echo "📁 Copying plugin files...\n";

// فایل‌های اصلی
$files_to_copy = array(
    'wordpress-crm-integration.php',
    'readme.txt'
);

foreach ($files_to_copy as $file) {
    if (file_exists($plugin_dir . '/' . $file)) {
        copy($plugin_dir . '/' . $file, $build_dir . '/wordpress-crm-integration/' . $file);
        echo "  ✅ $file\n";
    }
}

// پوشه‌های اصلی
$dirs_to_copy = array(
    'includes',
    'assets',
    'languages'
);

foreach ($dirs_to_copy as $dir) {
    if (is_dir($plugin_dir . '/' . $dir)) {
        copyDirectory($plugin_dir . '/' . $dir, $build_dir . '/wordpress-crm-integration/' . $dir);
        echo "  ✅ $dir/\n";
    }
}

echo "\n📦 Creating ZIP package...\n";

// ایجاد فایل ZIP
$zip = new ZipArchive();
$zip_path = $build_dir . '/' . $zip_name;

if ($zip->open($zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
    die("❌ Cannot create ZIP file: $zip_path\n");
}

// اضافه کردن فایل‌ها به ZIP
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($build_dir . '/wordpress-crm-integration', RecursiveDirectoryIterator::SKIP_DOTS),
    RecursiveIteratorIterator::SELF_FIRST
);

foreach ($iterator as $file) {
    $file_path = $file->getRealPath();
    $relative_path = 'wordpress-crm-integration/' . substr($file_path, strlen($build_dir . '/wordpress-crm-integration') + 1);
    
    if ($file->isDir()) {
        $zip->addEmptyDir($relative_path);
    } else {
        $zip->addFile($file_path, $relative_path);
    }
}

$zip->close();

$file_size = formatBytes(filesize($zip_path));

echo "✅ ZIP package created successfully!\n";
echo "📄 File: $zip_name\n";
echo "📊 Size: $file_size\n\n";

echo "🎉 Build completed successfully!\n";
echo "📍 Location: $zip_path\n\n";

echo "📋 Installation Instructions:\n";
echo "1. Upload the ZIP file to WordPress\n";
echo "2. Activate the plugin\n";
echo "3. Go to CRM Integration settings\n";
echo "4. Configure your CRM connection\n";
echo "5. Test connection and enable sync\n\n";

echo "🔗 Ready for Rabin CRM Integration!\n";

/**
 * حذف پوشه به‌صورت بازگشتی
 */
function deleteDirectory($dir) {
    if (!is_dir($dir)) {
        return;
    }
    
    $files = array_diff(scandir($dir), array('.', '..'));
    
    foreach ($files as $file) {
        $path = $dir . '/' . $file;
        if (is_dir($path)) {
            deleteDirectory($path);
        } else {
            unlink($path);
        }
    }
    
    rmdir($dir);
}

/**
 * کپی پوشه به‌صورت بازگشتی
 */
function copyDirectory($src, $dst) {
    if (!is_dir($src)) {
        return;
    }
    
    if (!is_dir($dst)) {
        mkdir($dst, 0755, true);
    }
    
    $files = array_diff(scandir($src), array('.', '..'));
    
    foreach ($files as $file) {
        $src_path = $src . '/' . $file;
        $dst_path = $dst . '/' . $file;
        
        if (is_dir($src_path)) {
            copyDirectory($src_path, $dst_path);
        } else {
            copy($src_path, $dst_path);
        }
    }
}

/**
 * فرمت کردن اندازه فایل
 */
function formatBytes($bytes, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}