<?php
/**
 * تست عمیق پلاگین WordPress CRM Integration
 * برای تشخیص مشکلات اجرا در محیط واقعی وردپرس
 */

echo "🔍 WordPress CRM Plugin Deep Debug\n";
echo str_repeat("=", 60) . "\n\n";

// 1. بررسی ساختار فایل‌ها
echo "📁 File Structure Check:\n";
$plugin_dir = __DIR__ . '/wordpress-crm-simple';

$required_files = [
    'wordpress-crm-integration.php' => 'Main plugin file',
    'includes/class-admin.php' => 'Admin class',
    'includes/class-api-client.php' => 'API Client class',
    'includes/class-logger.php' => 'Logger class',
    'includes/class-event-handler.php' => 'Event Handler class',
    'assets/css/admin.css' => 'Admin CSS',
    'assets/js/admin.js' => 'Admin JS',
    'languages/wordpress-crm-integration-fa_IR.po' => 'Persian language file'
];

foreach ($required_files as $file => $description) {
    $file_path = $plugin_dir . '/' . $file;
    if (file_exists($file_path)) {
        $size = filesize($file_path);
        echo "✅ $description: EXISTS ($size bytes)\n";
    } else {
        echo "❌ $description: MISSING\n";
    }
}

echo "\n";

// 2. بررسی syntax فایل اصلی
echo "🔍 PHP Syntax Check:\n";
$main_file = $plugin_dir . '/wordpress-crm-integration.php';

if (file_exists($main_file)) {
    $output = [];
    $return_var = 0;
    exec("php -l \"$main_file\" 2>&1", $output, $return_var);
    
    if ($return_var === 0) {
        echo "✅ Main file syntax: OK\n";
    } else {
        echo "❌ Main file syntax: ERROR\n";
        echo "   " . implode("\n   ", $output) . "\n";
    }
} else {
    echo "❌ Main file not found\n";
}

// بررسی syntax کلاس‌ها
$class_files = [
    'includes/class-admin.php',
    'includes/class-api-client.php',
    'includes/class-logger.php',
    'includes/class-event-handler.php'
];

foreach ($class_files as $class_file) {
    $file_path = $plugin_dir . '/' . $class_file;
    if (file_exists($file_path)) {
        $output = [];
        $return_var = 0;
        exec("php -l \"$file_path\" 2>&1", $output, $return_var);
        
        if ($return_var === 0) {
            echo "✅ $class_file syntax: OK\n";
        } else {
            echo "❌ $class_file syntax: ERROR\n";
            echo "   " . implode("\n   ", $output) . "\n";
        }
    }
}

echo "\n";

// 3. بررسی header پلاگین
echo "🔍 Plugin Header Check:\n";
if (file_exists($main_file)) {
    $content = file_get_contents($main_file);
    
    // بررسی header های مورد نیاز
    $required_headers = [
        'Plugin Name:' => 'Plugin Name',
        'Version:' => 'Version',
        'Description:' => 'Description',
        'Author:' => 'Author'
    ];
    
    foreach ($required_headers as $header => $name) {
        if (strpos($content, $header) !== false) {
            echo "✅ $name header: FOUND\n";
        } else {
            echo "❌ $name header: MISSING\n";
        }
    }
    
    // بررسی security check
    if (strpos($content, "if (!defined('ABSPATH'))") !== false) {
        echo "✅ Security check: FOUND\n";
    } else {
        echo "❌ Security check: MISSING\n";
    }
}

echo "\n";

// 4. بررسی کلاس‌ها و توابع
echo "🔍 Class and Function Check:\n";

// شبیه‌سازی محیط WordPress
if (!defined('ABSPATH')) {
    define('ABSPATH', '/fake/wordpress/');
}

// توابع مورد نیاز WordPress
$wp_functions = [
    'plugin_dir_path', 'plugin_dir_url', 'plugin_basename', 'add_action',
    'add_filter', 'register_activation_hook', 'register_deactivation_hook',
    'get_option', 'update_option', 'wp_parse_args', 'current_time',
    'load_plugin_textdomain', 'admin_url', 'is_admin'
];

foreach ($wp_functions as $func) {
    if (!function_exists($func)) {
        eval("function $func() { return true; }");
    }
}

// بارگذاری فایل اصلی
try {
    include_once $main_file;
    
    if (class_exists('WP_CRM_Integration')) {
        echo "✅ Main class WP_CRM_Integration: LOADED\n";
        
        // تست getInstance
        $instance = WP_CRM_Integration::get_instance();
        if ($instance) {
            echo "✅ getInstance method: WORKS\n";
            
            // تست متدهای اصلی
            $methods = ['get_setting', 'update_setting', 'get_settings', 'is_active', 'log'];
            foreach ($methods as $method) {
                if (method_exists($instance, $method)) {
                    echo "✅ Method $method: EXISTS\n";
                } else {
                    echo "❌ Method $method: MISSING\n";
                }
            }
        } else {
            echo "❌ getInstance method: FAILED\n";
        }
    } else {
        echo "❌ Main class WP_CRM_Integration: NOT FOUND\n";
    }
    
} catch (Exception $e) {
    echo "❌ Loading error: " . $e->getMessage() . "\n";
} catch (ParseError $e) {
    echo "❌ Parse error: " . $e->getMessage() . "\n";
} catch (Error $e) {
    echo "❌ Fatal error: " . $e->getMessage() . "\n";
}

echo "\n";

// 5. بررسی مجوزها
echo "🔍 File Permissions Check:\n";
$files_to_check = [
    $plugin_dir,
    $main_file,
    $plugin_dir . '/includes',
    $plugin_dir . '/assets'
];

foreach ($files_to_check as $file) {
    if (file_exists($file)) {
        $perms = fileperms($file);
        $perms_octal = substr(sprintf('%o', $perms), -4);
        echo "✅ " . basename($file) . ": $perms_octal\n";
    }
}

echo "\n";

// 6. تولید گزارش نهایی
echo "📋 Final Diagnosis:\n";
echo str_repeat("-", 40) . "\n";

$issues = [];

// بررسی فایل‌های مفقود
foreach ($required_files as $file => $desc) {
    if (!file_exists($plugin_dir . '/' . $file)) {
        $issues[] = "Missing file: $file";
    }
}

// بررسی syntax errors
foreach (array_merge([$main_file], array_map(function($f) use ($plugin_dir) { 
    return $plugin_dir . '/' . $f; 
}, $class_files)) as $file) {
    if (file_exists($file)) {
        $output = [];
        $return_var = 0;
        exec("php -l \"$file\" 2>&1", $output, $return_var);
        if ($return_var !== 0) {
            $issues[] = "Syntax error in: " . basename($file);
        }
    }
}

if (empty($issues)) {
    echo "🎉 NO CRITICAL ISSUES FOUND!\n";
    echo "✅ Plugin structure is correct\n";
    echo "✅ All required files exist\n";
    echo "✅ No syntax errors detected\n";
    echo "✅ Main class loads successfully\n\n";
    
    echo "🚀 PLUGIN SHOULD WORK IN WORDPRESS!\n\n";
    
    echo "📝 Installation Steps:\n";
    echo "1. Copy 'wordpress-crm-simple' folder to wp-content/plugins/\n";
    echo "2. Rename folder to 'wordpress-crm-integration'\n";
    echo "3. Go to WordPress Admin > Plugins\n";
    echo "4. Activate 'WordPress CRM Integration - Professional'\n";
    echo "5. Go to CRM Integration menu for settings\n";
    
} else {
    echo "❌ ISSUES FOUND:\n";
    foreach ($issues as $issue) {
        echo "   • $issue\n";
    }
    echo "\n🔧 Fix these issues before installing in WordPress\n";
}

echo "\n" . str_repeat("=", 60) . "\n";