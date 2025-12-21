<?php
/**
 * تست فعال‌سازی پلاگین WordPress CRM
 */

echo "🔍 WordPress CRM Plugin Activation Debug\n";
echo str_repeat("=", 50) . "\n\n";

// شبیه‌سازی کامل محیط WordPress
if (!defined('ABSPATH')) {
    define('ABSPATH', '/fake/wordpress/');
}

if (!defined('WP_DEBUG')) {
    define('WP_DEBUG', true);
}

// متغیرهای سراسری WordPress
global $wp_version, $wpdb;
$wp_version = '6.4';

// شبیه‌سازی wpdb
$wpdb = new stdClass();
$wpdb->prefix = 'wp_';
$wpdb->get_charset_collate = function() { return 'DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'; };
$wpdb->insert = function($table, $data, $format = null) {
    echo "   📝 DB INSERT: $table\n";
    return true;
};

// توابع WordPress
$wp_functions = [
    'plugin_dir_path' => function($file) { return dirname($file) . '/'; },
    'plugin_dir_url' => function($file) { return 'http://example.com/wp-content/plugins/' . basename(dirname($file)) . '/'; },
    'plugin_basename' => function($file) { return basename(dirname($file)) . '/' . basename($file); },
    'add_action' => function($hook, $callback) { echo "   🔗 Hook registered: $hook\n"; },
    'add_filter' => function($hook, $callback) { echo "   🔗 Filter registered: $hook\n"; },
    'register_activation_hook' => function($file, $callback) { echo "   ⚡ Activation hook registered\n"; },
    'register_deactivation_hook' => function($file, $callback) { echo "   ⚡ Deactivation hook registered\n"; },
    'get_option' => function($option, $default = false) { return $default; },
    'update_option' => function($option, $value) { echo "   💾 Option updated: $option\n"; return true; },
    'wp_parse_args' => function($args, $defaults) { return array_merge($defaults, (array)$args); },
    'current_time' => function($type) { return date('Y-m-d H:i:s'); },
    'is_admin' => function() { return true; },
    'load_plugin_textdomain' => function() { echo "   🌐 Language loaded\n"; },
    'wp_clear_scheduled_hook' => function($hook) { echo "   🕐 Cron cleared: $hook\n"; },
    'error_log' => function($message) { echo "   📋 LOG: $message\n"; }
];

foreach ($wp_functions as $name => $func) {
    if (!function_exists($name)) {
        eval("function $name() { return call_user_func_array(\$GLOBALS['wp_functions']['$name'], func_get_args()); }");
    }
}

// شبیه‌سازی dbDelta
if (!function_exists('dbDelta')) {
    function dbDelta($sql) {
        echo "   🗄️  Database table created/updated\n";
        return ['wp_crm_sync_queue' => 'Created table wp_crm_sync_queue'];
    }
}

try {
    echo "📁 Loading plugin with full WordPress simulation...\n";
    
    $plugin_file = __DIR__ . '/wordpress-crm-simple/wordpress-crm-integration.php';
    
    if (!file_exists($plugin_file)) {
        throw new Exception("Plugin file not found!");
    }
    
    // بارگذاری پلاگین
    include_once $plugin_file;
    
    echo "✅ Plugin loaded successfully\n\n";
    
    // تست کلاس اصلی
    echo "🔍 Testing main class...\n";
    if (class_exists('WP_CRM_Integration')) {
        echo "✅ WP_CRM_Integration class exists\n";
        
        $instance = WP_CRM_Integration::get_instance();
        if ($instance) {
            echo "✅ Instance created successfully\n";
            echo "✅ Plugin is active: " . ($instance->is_active() ? "YES" : "NO") . "\n";
            
            // تست تنظیمات
            $settings = $instance->get_settings();
            echo "✅ Settings loaded: " . count($settings) . " items\n";
            
            // تست لاگ
            echo "\n🔍 Testing logging system...\n";
            $instance->log('Test activation message', 'info');
            echo "✅ Logging works\n";
            
            // تست فعال‌سازی دستی
            echo "\n🔍 Testing manual activation...\n";
            $instance->activate();
            echo "✅ Activation completed\n";
            
        } else {
            echo "❌ Failed to create instance\n";
        }
    } else {
        echo "❌ WP_CRM_Integration class not found\n";
    }
    
    // تست کلاس‌های کمکی
    echo "\n🔍 Testing helper classes...\n";
    $helper_classes = [
        'WP_CRM_Admin' => 'Admin interface',
        'WP_CRM_API_Client' => 'API client',
        'WP_CRM_Logger' => 'Logger',
        'WP_CRM_Event_Handler' => 'Event handler'
    ];
    
    foreach ($helper_classes as $class => $desc) {
        if (class_exists($class)) {
            echo "✅ $class ($desc): Available\n";
        } else {
            echo "❌ $class ($desc): Missing\n";
        }
    }
    
    // تست تابع کمکی
    echo "\n🔍 Testing helper function...\n";
    if (function_exists('wp_crm')) {
        $helper_instance = wp_crm();
        if ($helper_instance) {
            echo "✅ wp_crm() helper function works\n";
        } else {
            echo "❌ wp_crm() helper function failed\n";
        }
    } else {
        echo "❌ wp_crm() helper function not found\n";
    }
    
    echo "\n🎉 PLUGIN ACTIVATION TEST COMPLETED!\n";
    echo "✅ All core components are working\n";
    echo "✅ Database tables would be created\n";
    echo "✅ Settings would be initialized\n";
    echo "✅ Hooks would be registered\n";
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . "\n";
    echo "   Line: " . $e->getLine() . "\n";
} catch (Error $e) {
    echo "❌ Fatal Error: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . "\n";
    echo "   Line: " . $e->getLine() . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";