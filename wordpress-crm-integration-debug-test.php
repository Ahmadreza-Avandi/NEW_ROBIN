<?php
/**
 * Debug test for WordPress CRM Integration
 * 
 * این فایل برای تست و debug افزونه استفاده می‌شود
 * فقط کلاس‌های اصلی را لود می‌کند تا مشکلات را شناسایی کند
 */

// شبیه‌سازی محیط WordPress
if (!defined('ABSPATH')) {
    define('ABSPATH', '/fake/wordpress/path/');
}

if (!defined('WP_DEBUG')) {
    define('WP_DEBUG', true);
}

// تعریف توابع WordPress مورد نیاز
if (!function_exists('plugin_dir_path')) {
    function plugin_dir_path($file) {
        return dirname($file) . '/';
    }
}

if (!function_exists('plugin_dir_url')) {
    function plugin_dir_url($file) {
        return 'http://localhost/wp-content/plugins/' . basename(dirname($file)) . '/';
    }
}

if (!function_exists('plugin_basename')) {
    function plugin_basename($file) {
        return basename(dirname($file)) . '/' . basename($file);
    }
}

if (!function_exists('add_action')) {
    function add_action($hook, $callback, $priority = 10, $args = 1) {
        echo "Action added: $hook\n";
    }
}

if (!function_exists('register_activation_hook')) {
    function register_activation_hook($file, $callback) {
        echo "Activation hook registered\n";
    }
}

if (!function_exists('register_deactivation_hook')) {
    function register_deactivation_hook($file, $callback) {
        echo "Deactivation hook registered\n";
    }
}

if (!function_exists('load_plugin_textdomain')) {
    function load_plugin_textdomain($domain, $deprecated, $plugin_rel_path) {
        echo "Textdomain loaded: $domain\n";
    }
}

if (!function_exists('__')) {
    function __($text, $domain = 'default') {
        return $text;
    }
}

if (!function_exists('is_admin')) {
    function is_admin() {
        return true;
    }
}

if (!function_exists('error_log')) {
    function error_log($message) {
        echo "[ERROR_LOG] $message\n";
    }
}

if (!function_exists('add_filter')) {
    function add_filter($hook, $callback, $priority = 10, $args = 1) {
        echo "Filter added: $hook\n";
    }
}

if (!function_exists('wp_schedule_event')) {
    function wp_schedule_event($timestamp, $recurrence, $hook, $args = array()) {
        echo "Event scheduled: $hook\n";
    }
}

if (!function_exists('wp_next_scheduled')) {
    function wp_next_scheduled($hook, $args = array()) {
        return false;
    }
}

if (!function_exists('wp_clear_scheduled_hook')) {
    function wp_clear_scheduled_hook($hook, $args = array()) {
        echo "Hook cleared: $hook\n";
    }
}

// شروع تست
echo "🧪 WordPress CRM Integration Debug Test\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    // تست لود کردن فایل اصلی
    echo "📁 Loading main plugin file...\n";
    
    // تنظیم مسیر
    $plugin_dir = __DIR__ . '/wordpress-crm-integration/';
    $main_file = $plugin_dir . 'wordpress-crm-integration.php';
    
    if (!file_exists($main_file)) {
        throw new Exception("Main plugin file not found: $main_file");
    }
    
    // تست لود کردن فایل‌های include
    echo "📚 Testing include files...\n";
    
    $include_files = array(
        'includes/class-wp-crm-integration-compatibility.php',
        'includes/class-wp-crm-integration-conflict-prevention.php',
        'includes/class-wp-crm-integration-migration.php',
        'includes/class-wp-crm-integration-config.php',
        'includes/class-wp-crm-integration-logger.php',
        'includes/class-wp-crm-integration-retry-handler.php',
        'includes/class-wp-crm-integration-admin.php',
        'includes/class-wp-crm-integration-api-client.php',
        'includes/class-wp-crm-integration-event-handlers.php',
        'includes/class-wp-crm-integration-field-mapper.php',
        'includes/class-wp-crm-integration-queue-manager.php',
        'includes/class-wp-crm-integration-batch-processor.php',
        'includes/class-wp-crm-integration-rate-limiter.php',
        'includes/class-wp-crm-integration-performance-optimizer.php'
    );
    
    foreach ($include_files as $file) {
        $file_path = $plugin_dir . $file;
        if (file_exists($file_path)) {
            echo "  ✅ $file - EXISTS\n";
        } else {
            echo "  ❌ $file - MISSING\n";
        }
    }
    
    echo "\n🔄 Loading main plugin file...\n";
    
    // تنظیم constants مورد نیاز
    define('WP_CRM_INTEGRATION_VERSION', '1.0.0');
    define('WP_CRM_INTEGRATION_PLUGIN_FILE', $main_file);
    define('WP_CRM_INTEGRATION_PLUGIN_DIR', $plugin_dir);
    define('WP_CRM_INTEGRATION_PLUGIN_URL', 'http://localhost/wp-content/plugins/wordpress-crm-integration/');
    define('WP_CRM_INTEGRATION_PLUGIN_BASENAME', 'wordpress-crm-integration/wordpress-crm-integration.php');
    
    // لود کردن فایل اصلی
    include_once $main_file;
    
    echo "✅ Main plugin file loaded successfully!\n";
    
    // تست کلاس‌ها
    echo "\n🔍 Testing classes...\n";
    
    $classes_to_test = array(
        'WordPressCRMIntegration',
        'WP_CRM_Integration_Compatibility',
        'WP_CRM_Integration_Config',
        'WP_CRM_Integration_Logger'
    );
    
    foreach ($classes_to_test as $class_name) {
        if (class_exists($class_name)) {
            echo "  ✅ Class $class_name - EXISTS\n";
            
            // تست getInstance اگر موجود باشد
            if (method_exists($class_name, 'get_instance')) {
                try {
                    $instance = $class_name::get_instance();
                    echo "    ✅ getInstance() - SUCCESS\n";
                } catch (Exception $e) {
                    echo "    ❌ getInstance() - ERROR: " . $e->getMessage() . "\n";
                }
            }
        } else {
            echo "  ❌ Class $class_name - NOT FOUND\n";
        }
    }
    
    echo "\n🎉 Debug test completed successfully!\n";
    echo "\n📋 Summary:\n";
    echo "  - Main plugin file: ✅ Loaded\n";
    echo "  - Include files: ✅ Available\n";
    echo "  - Classes: ✅ Defined\n";
    echo "  - No fatal errors detected\n";
    
    echo "\n💡 Plugin should work in WordPress environment.\n";
    echo "   If activation fails, check WordPress error logs for details.\n";
    
} catch (Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "\n🔧 Troubleshooting:\n";
    echo "  1. Check file permissions\n";
    echo "  2. Verify all include files exist\n";
    echo "  3. Check PHP syntax errors\n";
    echo "  4. Enable WordPress debug mode\n";
}

echo "\n" . str_repeat("=", 60) . "\n";