<?php
/**
 * Test Configuration for WordPress CRM Integration
 * 
 * This file contains configuration settings for running tests.
 * Copy this file and modify the settings as needed for your environment.
 * 
 * @package WordPressCRMIntegration
 * @subpackage Tests
 */

// Test Database Configuration
define('WP_CRM_TEST_DB_NAME', 'wordpress_test');
define('WP_CRM_TEST_DB_USER', 'root');
define('WP_CRM_TEST_DB_PASS', '');
define('WP_CRM_TEST_DB_HOST', 'localhost');

// Test CRM Configuration
define('WP_CRM_TEST_CRM_URL', 'https://test-crm.example.com');
define('WP_CRM_TEST_API_KEY', 'test_api_key_12345');
define('WP_CRM_TEST_TENANT_KEY', 'test_tenant');

// WordPress Test Suite Paths
define('WP_CRM_TEST_WP_TESTS_DIR', sys_get_temp_dir() . '/wordpress-tests-lib');
define('WP_CRM_TEST_WP_CORE_DIR', sys_get_temp_dir() . '/wordpress');

// Test Behavior Configuration
define('WP_CRM_TEST_SKIP_EXTERNAL_REQUESTS', true);
define('WP_CRM_TEST_MOCK_CRM_RESPONSES', true);
define('WP_CRM_TEST_CLEANUP_DATA', true);

// WooCommerce Test Configuration
define('WP_CRM_TEST_WOOCOMMERCE_AVAILABLE', class_exists('WooCommerce'));
define('WP_CRM_TEST_MOCK_WOOCOMMERCE', false); // Set to true to mock WooCommerce when not available

// Logging Configuration
define('WP_CRM_TEST_LOG_LEVEL', 'info'); // debug, info, warning, error
define('WP_CRM_TEST_LOG_TO_FILE', false);
define('WP_CRM_TEST_LOG_FILE', __DIR__ . '/logs/test.log');

// Performance Test Configuration
define('WP_CRM_TEST_BATCH_SIZE', 5);
define('WP_CRM_TEST_MAX_USERS', 10);
define('WP_CRM_TEST_MAX_ORDERS', 5);
define('WP_CRM_TEST_MAX_PRODUCTS', 3);

// Coverage Configuration
define('WP_CRM_TEST_COVERAGE_ENABLED', extension_loaded('xdebug'));
define('WP_CRM_TEST_COVERAGE_DIR', __DIR__ . '/coverage');

/**
 * Get test configuration value
 * 
 * @param string $key Configuration key
 * @param mixed $default Default value if key not found
 * @return mixed Configuration value
 */
function wp_crm_test_config($key, $default = null) {
    $config_map = array(
        'db_name' => WP_CRM_TEST_DB_NAME,
        'db_user' => WP_CRM_TEST_DB_USER,
        'db_pass' => WP_CRM_TEST_DB_PASS,
        'db_host' => WP_CRM_TEST_DB_HOST,
        'crm_url' => WP_CRM_TEST_CRM_URL,
        'api_key' => WP_CRM_TEST_API_KEY,
        'tenant_key' => WP_CRM_TEST_TENANT_KEY,
        'wp_tests_dir' => WP_CRM_TEST_WP_TESTS_DIR,
        'wp_core_dir' => WP_CRM_TEST_WP_CORE_DIR,
        'skip_external_requests' => WP_CRM_TEST_SKIP_EXTERNAL_REQUESTS,
        'mock_crm_responses' => WP_CRM_TEST_MOCK_CRM_RESPONSES,
        'cleanup_data' => WP_CRM_TEST_CLEANUP_DATA,
        'woocommerce_available' => WP_CRM_TEST_WOOCOMMERCE_AVAILABLE,
        'mock_woocommerce' => WP_CRM_TEST_MOCK_WOOCOMMERCE,
        'log_level' => WP_CRM_TEST_LOG_LEVEL,
        'log_to_file' => WP_CRM_TEST_LOG_TO_FILE,
        'log_file' => WP_CRM_TEST_LOG_FILE,
        'batch_size' => WP_CRM_TEST_BATCH_SIZE,
        'max_users' => WP_CRM_TEST_MAX_USERS,
        'max_orders' => WP_CRM_TEST_MAX_ORDERS,
        'max_products' => WP_CRM_TEST_MAX_PRODUCTS,
        'coverage_enabled' => WP_CRM_TEST_COVERAGE_ENABLED,
        'coverage_dir' => WP_CRM_TEST_COVERAGE_DIR
    );
    
    return isset($config_map[$key]) ? $config_map[$key] : $default;
}

/**
 * Check if test environment is properly configured
 * 
 * @return array Array of configuration issues (empty if all good)
 */
function wp_crm_test_check_environment() {
    $issues = array();
    
    // Check PHP version
    if (version_compare(PHP_VERSION, '7.4.0', '<')) {
        $issues[] = 'PHP 7.4 or higher is required. Current version: ' . PHP_VERSION;
    }
    
    // Check required extensions
    $required_extensions = array('json', 'curl', 'mysqli');
    foreach ($required_extensions as $ext) {
        if (!extension_loaded($ext)) {
            $issues[] = "Required PHP extension '{$ext}' is not loaded";
        }
    }
    
    // Check WordPress test suite
    if (!file_exists(WP_CRM_TEST_WP_TESTS_DIR . '/includes/functions.php')) {
        $issues[] = 'WordPress test suite not found at ' . WP_CRM_TEST_WP_TESTS_DIR;
    }
    
    // Check database connectivity (if configured)
    if (WP_CRM_TEST_DB_HOST && WP_CRM_TEST_DB_NAME) {
        $connection = @mysqli_connect(
            WP_CRM_TEST_DB_HOST,
            WP_CRM_TEST_DB_USER,
            WP_CRM_TEST_DB_PASS,
            WP_CRM_TEST_DB_NAME
        );
        
        if (!$connection) {
            $issues[] = 'Cannot connect to test database: ' . mysqli_connect_error();
        } else {
            mysqli_close($connection);
        }
    }
    
    // Check write permissions for coverage
    if (WP_CRM_TEST_COVERAGE_ENABLED && !is_writable(dirname(WP_CRM_TEST_COVERAGE_DIR))) {
        $issues[] = 'Coverage directory is not writable: ' . dirname(WP_CRM_TEST_COVERAGE_DIR);
    }
    
    return $issues;
}

/**
 * Print test environment status
 */
function wp_crm_test_print_environment() {
    echo "WordPress CRM Integration Test Environment\n";
    echo "==========================================\n\n";
    
    echo "Configuration:\n";
    echo "  PHP Version: " . PHP_VERSION . "\n";
    echo "  Database: " . WP_CRM_TEST_DB_NAME . "@" . WP_CRM_TEST_DB_HOST . "\n";
    echo "  CRM URL: " . WP_CRM_TEST_CRM_URL . "\n";
    echo "  WordPress Tests: " . WP_CRM_TEST_WP_TESTS_DIR . "\n";
    echo "  WooCommerce: " . (WP_CRM_TEST_WOOCOMMERCE_AVAILABLE ? 'Available' : 'Not Available') . "\n";
    echo "  Coverage: " . (WP_CRM_TEST_COVERAGE_ENABLED ? 'Enabled' : 'Disabled') . "\n\n";
    
    $issues = wp_crm_test_check_environment();
    if (empty($issues)) {
        echo "Status: ✓ Environment is ready for testing\n\n";
    } else {
        echo "Status: ✗ Environment has issues:\n";
        foreach ($issues as $issue) {
            echo "  - " . $issue . "\n";
        }
        echo "\n";
    }
}

// Auto-print environment status if this file is run directly
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    wp_crm_test_print_environment();
}