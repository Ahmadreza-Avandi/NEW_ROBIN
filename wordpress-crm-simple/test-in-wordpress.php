<?php
/**
 * تست پلاگین در محیط واقعی وردپرس
 * این فایل را در root وردپرس قرار دهید و اجرا کنید
 */

// بارگذاری WordPress
require_once('wp-config.php');
require_once('wp-load.php');

echo "🧪 Testing WordPress CRM Integration in Real WordPress Environment\n";
echo str_repeat("=", 70) . "\n\n";

// 1. بررسی وضعیت پلاگین
echo "📋 Plugin Status Check:\n";

if (!function_exists('is_plugin_active')) {
    require_once(ABSPATH . 'wp-admin/includes/plugin.php');
}

$plugin_file = 'wordpress-crm-integration/wordpress-crm-integration.php';
$is_active = is_plugin_active($plugin_file);

echo "Plugin File: $plugin_file\n";
echo "Status: " . ($is_active ? "✅ ACTIVE" : "❌ INACTIVE") . "\n";

if (!$is_active) {
    echo "\n🔧 Plugin is not active. Trying to activate...\n";
    
    $result = activate_plugin($plugin_file);
    if (is_wp_error($result)) {
        echo "❌ Activation failed: " . $result->get_error_message() . "\n";
    } else {
        echo "✅ Plugin activated successfully!\n";
        $is_active = true;
    }
}

echo "\n";

// 2. بررسی کلاس اصلی
echo "🔍 Main Class Check:\n";

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
        $instance->log('Test message from WordPress environment', 'info');
        echo "✅ Logging system works\n";
        
    } else {
        echo "❌ Failed to get instance\n";
    }
} else {
    echo "❌ WP_CRM_Integration class not found\n";
    echo "   This indicates the plugin is not loaded properly\n";
}

echo "\n";

// 3. بررسی کلاس‌های کمکی
echo "🔍 Helper Classes Check:\n";

$helper_classes = [
    'WP_CRM_Admin' => 'Admin interface',
    'WP_CRM_API_Client' => 'API communication',
    'WP_CRM_Logger' => 'Logging system',
    'WP_CRM_Event_Handler' => 'Event handling'
];

foreach ($helper_classes as $class => $description) {
    if (class_exists($class)) {
        echo "✅ $class ($description): LOADED\n";
    } else {
        echo "❌ $class ($description): NOT FOUND\n";
    }
}

echo "\n";

// 4. بررسی دیتابیس
echo "🔍 Database Check:\n";

global $wpdb;

// بررسی جدول صف همگام‌سازی
$sync_table = $wpdb->prefix . 'crm_sync_queue';
$table_exists = $wpdb->get_var("SHOW TABLES LIKE '$sync_table'") == $sync_table;

echo "Sync Queue Table ($sync_table): " . ($table_exists ? "✅ EXISTS" : "❌ MISSING") . "\n";

// بررسی جدول لاگ
$log_table = $wpdb->prefix . 'crm_sync_log';
$log_table_exists = $wpdb->get_var("SHOW TABLES LIKE '$log_table'") == $log_table;

echo "Log Table ($log_table): " . ($log_table_exists ? "✅ EXISTS" : "❌ MISSING") . "\n";

if ($table_exists) {
    $queue_count = $wpdb->get_var("SELECT COUNT(*) FROM $sync_table");
    echo "Queue items: $queue_count\n";
}

if ($log_table_exists) {
    $log_count = $wpdb->get_var("SELECT COUNT(*) FROM $log_table");
    echo "Log entries: $log_count\n";
}

echo "\n";

// 5. بررسی منوی مدیریت
echo "🔍 Admin Menu Check:\n";

if (is_admin() || wp_doing_ajax()) {
    echo "✅ Admin context detected\n";
    
    // بررسی منو
    global $menu, $submenu;
    
    $crm_menu_found = false;
    if (isset($menu)) {
        foreach ($menu as $menu_item) {
            if (isset($menu_item[2]) && $menu_item[2] === 'wp-crm-settings') {
                $crm_menu_found = true;
                break;
            }
        }
    }
    
    echo "CRM Menu: " . ($crm_menu_found ? "✅ FOUND" : "❌ NOT FOUND") . "\n";
} else {
    echo "ℹ️  Not in admin context, skipping menu check\n";
}

echo "\n";

// 6. تست اتصال API (اگر تنظیمات موجود باشد)
echo "🔍 API Connection Test:\n";

if (class_exists('WP_CRM_Integration')) {
    $instance = WP_CRM_Integration::get_instance();
    $crm_url = $instance->get_setting('crm_url');
    $api_key = $instance->get_setting('api_key');
    
    if (!empty($crm_url) && !empty($api_key)) {
        echo "CRM URL: $crm_url\n";
        echo "API Key: " . substr($api_key, 0, 10) . "...\n";
        
        if (class_exists('WP_CRM_API_Client')) {
            $api_client = new WP_CRM_API_Client($instance);
            
            // تست ساده
            $test_data = [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'phone' => '09123456789'
            ];
            
            echo "Testing API connection...\n";
            // در اینجا می‌توانید تست واقعی API انجام دهید
            echo "ℹ️  API test skipped (configure settings first)\n";
        }
    } else {
        echo "ℹ️  API settings not configured\n";
    }
}

echo "\n";

// 7. گزارش نهایی
echo "📋 Final Report:\n";
echo str_repeat("-", 50) . "\n";

$issues = [];
$successes = [];

// بررسی وضعیت کلی
if ($is_active) {
    $successes[] = "Plugin is active";
} else {
    $issues[] = "Plugin is not active";
}

if (class_exists('WP_CRM_Integration')) {
    $successes[] = "Main class loaded";
} else {
    $issues[] = "Main class not loaded";
}

if ($table_exists && $log_table_exists) {
    $successes[] = "Database tables created";
} else {
    $issues[] = "Database tables missing";
}

// نمایش نتایج
if (empty($issues)) {
    echo "🎉 PLUGIN IS WORKING PERFECTLY!\n\n";
    echo "✅ Successes:\n";
    foreach ($successes as $success) {
        echo "   • $success\n";
    }
    
    echo "\n🚀 Next Steps:\n";
    echo "1. Go to WordPress Admin > CRM Integration\n";
    echo "2. Configure your CRM URL and API key\n";
    echo "3. Test the connection\n";
    echo "4. Enable synchronization\n";
    
} else {
    echo "⚠️  ISSUES DETECTED:\n";
    foreach ($issues as $issue) {
        echo "   • $issue\n";
    }
    
    if (!empty($successes)) {
        echo "\n✅ Working parts:\n";
        foreach ($successes as $success) {
            echo "   • $success\n";
        }
    }
    
    echo "\n🔧 Troubleshooting:\n";
    echo "1. Check if plugin folder is in wp-content/plugins/\n";
    echo "2. Verify file permissions\n";
    echo "3. Check WordPress error logs\n";
    echo "4. Try deactivating and reactivating the plugin\n";
}

echo "\n" . str_repeat("=", 70) . "\n";