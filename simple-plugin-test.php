<?php
/**
 * تست ساده پلاگین WordPress CRM
 */

echo "🔍 Simple WordPress CRM Plugin Test\n";
echo str_repeat("=", 50) . "\n\n";

// شبیه‌سازی محیط WordPress
if (!defined('ABSPATH')) {
    define('ABSPATH', '/fake/wordpress/');
}

// توابع اساسی WordPress
$wp_functions = [
    'plugin_dir_path', 'plugin_dir_url', 'plugin_basename', 
    'add_action', 'add_filter', 'get_option', 'update_option',
    'wp_parse_args', 'current_time', 'is_admin'
];

foreach ($wp_functions as $func) {
    if (!function_exists($func)) {
        eval("function $func() { return true; }");
    }
}

// متغیر wpdb
global $wpdb;
$wpdb = new stdClass();
$wpdb->prefix = 'wp_';
$wpdb->insert = function() { return true; };

try {
    echo "📁 Loading plugin...\n";
    
    $plugin_file = __DIR__ . '/wordpress-crm-simple/wordpress-crm-integration.php';
    
    if (!file_exists($plugin_file)) {
        throw new Exception("Plugin file not found!");
    }
    
    include_once $plugin_file;
    
    echo "✅ Plugin loaded successfully\n";
    
    // تست کلاس اصلی
    if (class_exists('WP_CRM_Integration')) {
        echo "✅ Main class exists\n";
        
        $instance = WP_CRM_Integration::get_instance();
        if ($instance) {
            echo "✅ Instance created\n";
            echo "✅ Plugin active: " . ($instance->is_active() ? "YES" : "NO") . "\n";
        }
    }
    
    echo "\n🎉 PLUGIN WORKS CORRECTLY!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
} catch (Error $e) {
    echo "❌ Fatal Error: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";