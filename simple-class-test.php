<?php
/**
 * تست ساده کلاس‌ها
 */

echo "🧪 Simple Class Loading Test\n";
echo str_repeat("=", 40) . "\n\n";

$plugin_dir = __DIR__ . '/wordpress-crm-simple';

// شبیه‌سازی WordPress
if (!defined('ABSPATH')) {
    define('ABSPATH', '/fake/wordpress/');
}

// تعریف ثوابت
define('WP_CRM_PLUGIN_DIR', $plugin_dir . '/');

// توابع مورد نیاز
$functions = ['plugin_dir_path', 'plugin_dir_url', 'plugin_basename', 'add_action', 'get_option', 'update_option'];
foreach ($functions as $func) {
    if (!function_exists($func)) {
        eval("function $func() { return true; }");
    }
}

echo "1. Testing direct class includes:\n";

// تست مستقیم کلاس‌ها
$classes = [
    'includes/class-admin.php' => 'WP_CRM_Admin',
    'includes/class-api-client.php' => 'WP_CRM_API_Client',
    'includes/class-logger.php' => 'WP_CRM_Logger',
    'includes/class-event-handler.php' => 'WP_CRM_Event_Handler'
];

foreach ($classes as $file => $class_name) {
    $file_path = $plugin_dir . '/' . $file;
    
    if (file_exists($file_path)) {
        include_once $file_path;
        
        if (class_exists($class_name)) {
            echo "✅ $class_name loaded successfully\n";
        } else {
            echo "❌ $class_name not found after include\n";
        }
    } else {
        echo "❌ File not found: $file\n";
    }
}

echo "\n2. Testing main plugin file:\n";

$main_file = $plugin_dir . '/wordpress-crm-integration.php';
if (file_exists($main_file)) {
    include_once $main_file;
    
    if (class_exists('WP_CRM_Integration')) {
        echo "✅ Main class loaded\n";
        
        $instance = WP_CRM_Integration::get_instance();
        if ($instance) {
            echo "✅ Instance created\n";
            echo "✅ Plugin active: " . ($instance->is_active() ? 'YES' : 'NO') . "\n";
        }
    } else {
        echo "❌ Main class not found\n";
    }
}

echo "\n3. Final class check:\n";
$all_classes = ['WP_CRM_Integration', 'WP_CRM_Admin', 'WP_CRM_API_Client', 'WP_CRM_Logger', 'WP_CRM_Event_Handler'];

foreach ($all_classes as $class) {
    echo (class_exists($class) ? "✅" : "❌") . " $class\n";
}

echo "\n" . str_repeat("=", 40) . "\n";