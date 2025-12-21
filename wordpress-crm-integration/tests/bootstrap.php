<?php
/**
 * WordPress CRM Integration Test Bootstrap
 * 
 * Sets up the WordPress test environment for running integration tests.
 * 
 * @package WordPressCRMIntegration
 * @subpackage Tests
 */

// Define test environment
define('WP_CRM_INTEGRATION_TESTING', true);

// WordPress test configuration
$_tests_dir = getenv('WP_TESTS_DIR');

if (!$_tests_dir) {
    $_tests_dir = rtrim(sys_get_temp_dir(), '/\\') . '/wordpress-tests-lib';
}

// Check if WordPress test suite is available
if (!file_exists($_tests_dir . '/includes/functions.php')) {
    echo "Could not find WordPress test suite at $_tests_dir\n";
    echo "Please install WordPress test suite or set WP_TESTS_DIR environment variable\n";
    exit(1);
}

// Load WordPress test functions
require_once $_tests_dir . '/includes/functions.php';

/**
 * Manually load the plugin for testing
 */
function _manually_load_plugin() {
    // Load plugin
    require dirname(__FILE__) . '/../wordpress-crm-integration.php';
    
    // Load WooCommerce if available (for order/product testing)
    if (defined('WP_PLUGIN_DIR') && file_exists(WP_PLUGIN_DIR . '/woocommerce/woocommerce.php')) {
        require_once WP_PLUGIN_DIR . '/woocommerce/woocommerce.php';
        
        // Initialize WooCommerce for testing
        add_action('init', function() {
            if (class_exists('WooCommerce')) {
                WC()->init();
            }
        });
    }
}

// Hook plugin loading
tests_add_filter('muplugins_loaded', '_manually_load_plugin');

/**
 * Set up test database configuration
 */
function _setup_test_database() {
    // Set up test database tables
    global $wpdb;
    
    // Ensure plugin tables are created
    if (function_exists('wp_crm_integration_init')) {
        $plugin = wp_crm_integration_init();
        if (method_exists($plugin, 'activate')) {
            $plugin->activate();
        }
    }
}

// Hook database setup
tests_add_filter('wp_install', '_setup_test_database');

/**
 * Configure test environment settings
 */
function _configure_test_environment() {
    // Disable external HTTP requests during testing (except for our mocked ones)
    add_filter('pre_http_request', function($preempt, $parsed_args, $url) {
        // Allow requests to test CRM URL (will be mocked)
        if (strpos($url, 'test-crm.example.com') !== false) {
            return false; // Let the request proceed (will be intercepted by test mocks)
        }
        
        // Block all other external requests
        return new WP_Error('http_request_blocked', 'HTTP requests blocked during testing');
    }, 5, 3);
    
    // Set up test-friendly error reporting
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
    
    // Configure WordPress for testing
    update_option('siteurl', 'http://example.org');
    update_option('home', 'http://example.org');
}

// Hook environment configuration
tests_add_filter('init', '_configure_test_environment');

// Start up the WP testing environment
require $_tests_dir . '/includes/bootstrap.php';

// Load test utilities
require_once dirname(__FILE__) . '/includes/class-wp-crm-test-utilities.php';

echo "WordPress CRM Integration test environment loaded successfully.\n";