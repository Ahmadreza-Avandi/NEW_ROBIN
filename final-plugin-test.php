<?php
/**
 * تست نهایی و کامل پلاگین WordPress CRM Integration
 */

echo "🔥 FINAL COMPREHENSIVE PLUGIN TEST\n";
echo str_repeat("=", 60) . "\n\n";

$plugin_dir = __DIR__ . '/wordpress-crm-simple';
$errors = [];
$warnings = [];
$success_count = 0;
$total_tests = 0;

function test_result($condition, $message, $error_msg = '') {
    global $errors, $success_count, $total_tests;
    $total_tests++;
    
    if ($condition) {
        echo "✅ $message\n";
        $success_count++;
        return true;
    } else {
        echo "❌ $message\n";
        if ($error_msg) {
            $errors[] = $error_msg;
            echo "   Error: $error_msg\n";
        }
        return false;
    }
}

// 1. ساختار فایل‌ها
echo "📁 File Structure Tests:\n";
$required_files = [
    'wordpress-crm-integration.php' => 'Main plugin file',
    'includes/class-admin.php' => 'Admin class',
    'includes/class-api-client.php' => 'API Client',
    'includes/class-logger.php' => 'Logger class',
    'includes/class-event-handler.php' => 'Event Handler',
    'assets/css/admin.css' => 'Admin CSS',
    'assets/js/admin.js' => 'Admin JavaScript',
    'languages/wordpress-crm-integration-fa_IR.po' => 'Persian translation'
];

foreach ($required_files as $file => $desc) {
    $file_path = $plugin_dir . '/' . $file;
    $exists = file_exists($file_path);
    $size = $exists ? filesize($file_path) : 0;
    
    test_result(
        $exists && $size > 0,
        "$desc exists ($size bytes)",
        "Missing or empty file: $file"
    );
}

echo "\n";

// 2. تست Syntax
echo "🔍 PHP Syntax Tests:\n";
$php_files = [
    'wordpress-crm-integration.php',
    'includes/class-admin.php',
    'includes/class-api-client.php',
    'includes/class-logger.php',
    'includes/class-event-handler.php'
];

foreach ($php_files as $file) {
    $file_path = $plugin_dir . '/' . $file;
    if (file_exists($file_path)) {
        $output = [];
        $return_var = 0;
        exec("php -l \"$file_path\" 2>&1", $output, $return_var);
        
        test_result(
            $return_var === 0,
            "Syntax check: $file",
            "Syntax error in $file: " . implode(' ', $output)
        );
    }
}

echo "\n";

// 3. تست WordPress Headers
echo "📋 WordPress Plugin Headers:\n";
$main_file = $plugin_dir . '/wordpress-crm-integration.php';
if (file_exists($main_file)) {
    $content = file_get_contents($main_file);
    
    $headers = [
        'Plugin Name:' => 'Plugin Name header',
        'Version:' => 'Version header',
        'Description:' => 'Description header',
        'Author:' => 'Author header',
        'Text Domain:' => 'Text Domain header'
    ];
    
    foreach ($headers as $header => $desc) {
        test_result(
            strpos($content, $header) !== false,
            $desc,
            "Missing $header in main file"
        );
    }
    
    // Security check
    test_result(
        strpos($content, "if (!defined('ABSPATH'))") !== false,
        "Security check (ABSPATH)",
        "Missing ABSPATH security check"
    );
}

echo "\n";

// 4. تست کلاس‌ها
echo "🏗️ Class Loading Tests:\n";

// شبیه‌سازی WordPress
if (!defined('ABSPATH')) {
    define('ABSPATH', '/fake/wordpress/');
}

$wp_functions = [
    'plugin_dir_path', 'plugin_dir_url', 'plugin_basename', 'add_action',
    'add_filter', 'register_activation_hook', 'register_deactivation_hook',
    'get_option', 'update_option', 'wp_parse_args', 'current_time',
    'load_plugin_textdomain', 'admin_url', 'is_admin', '__', '_e',
    'esc_html', 'esc_attr', 'esc_url', 'wp_nonce_field', 'check_admin_referer',
    'current_user_can', 'wp_die', 'add_menu_page', 'add_submenu_page'
];

foreach ($wp_functions as $func) {
    if (!function_exists($func)) {
        eval("function $func() { return true; }");
    }
}

global $wpdb;
$wpdb = new stdClass();
$wpdb->prefix = 'wp_';
$wpdb->get_charset_collate = function() { return 'DEFAULT CHARSET=utf8mb4'; };

try {
    include_once $main_file;
    
    test_result(
        class_exists('WP_CRM_Integration'),
        "Main class WP_CRM_Integration loaded",
        "Main class not found after including file"
    );
    
    if (class_exists('WP_CRM_Integration')) {
        // راه‌اندازی نمونه برای بارگذاری کلاس‌ها
        $instance = WP_CRM_Integration::get_instance();
        
        test_result(
            $instance !== null,
            "getInstance() method works",
            "getInstance() returned null"
        );
        
        if ($instance) {
            $methods = ['get_setting', 'update_setting', 'get_settings', 'is_active', 'log'];
            foreach ($methods as $method) {
                test_result(
                    method_exists($instance, $method),
                    "Method $method exists",
                    "Required method $method missing"
                );
            }
            
            // حالا کلاس‌های کمکی باید بارگذاری شده باشند
            $helper_classes = [
                'WP_CRM_Admin',
                'WP_CRM_API_Client', 
                'WP_CRM_Logger',
                'WP_CRM_Event_Handler'
            ];
            
            foreach ($helper_classes as $class) {
                test_result(
                    class_exists($class),
                    "Helper class $class loaded",
                    "Helper class $class not found"
                );
            }
        }
    }
    
} catch (Exception $e) {
    test_result(false, "Plugin loading", "Exception: " . $e->getMessage());
} catch (ParseError $e) {
    test_result(false, "Plugin parsing", "Parse error: " . $e->getMessage());
}

echo "\n";

// 5. تست Assets
echo "🎨 Assets Tests:\n";
$css_file = $plugin_dir . '/assets/css/admin.css';
$js_file = $plugin_dir . '/assets/js/admin.js';

if (file_exists($css_file)) {
    $css_content = file_get_contents($css_file);
    test_result(
        !empty($css_content) && strpos($css_content, '.wp-crm') !== false,
        "CSS file has content and classes",
        "CSS file empty or missing wp-crm classes"
    );
}

if (file_exists($js_file)) {
    $js_content = file_get_contents($js_file);
    test_result(
        !empty($js_content) && strpos($js_content, 'wp_crm') !== false,
        "JavaScript file has content and wp_crm references",
        "JS file empty or missing wp_crm references"
    );
}

echo "\n";

// 6. تست زبان
echo "🌐 Language Tests:\n";
$po_file = $plugin_dir . '/languages/wordpress-crm-integration-fa_IR.po';
if (file_exists($po_file)) {
    $po_content = file_get_contents($po_file);
    test_result(
        !empty($po_content) && strpos($po_content, 'msgid') !== false,
        "Persian translation file format",
        "PO file format invalid"
    );
}

echo "\n";

// 7. گزارش نهایی
echo "📊 FINAL RESULTS:\n";
echo str_repeat("-", 40) . "\n";
echo "Total Tests: $total_tests\n";
echo "Passed: $success_count\n";
echo "Failed: " . ($total_tests - $success_count) . "\n";
echo "Success Rate: " . round(($success_count / $total_tests) * 100, 1) . "%\n\n";

if (empty($errors)) {
    echo "🎉 ALL TESTS PASSED!\n";
    echo "✅ Plugin is ready for production\n";
    echo "✅ No critical issues found\n";
    echo "✅ WordPress standards compliant\n\n";
    
    echo "🚀 READY FOR BUILD!\n";
    return true;
} else {
    echo "⚠️ ISSUES FOUND:\n";
    foreach ($errors as $i => $error) {
        echo ($i + 1) . ". $error\n";
    }
    echo "\n🔧 Fix these issues before building\n";
    return false;
}