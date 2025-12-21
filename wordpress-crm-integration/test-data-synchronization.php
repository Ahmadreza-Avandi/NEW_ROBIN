<?php
/**
 * Test Data Synchronization Logic
 * 
 * This file tests the enhanced field mapping and API communication logic
 * implemented in task 5.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    // For testing outside WordPress, define basic constants
    define('ABSPATH', dirname(__FILE__) . '/');
    define('WP_CRM_INTEGRATION_VERSION', '1.0.0');
    
    // Mock WordPress functions for testing
    if (!function_exists('get_option')) {
        function get_option($option, $default = false) {
            return $default;
        }
    }
    
    if (!function_exists('current_time')) {
        function current_time($type) {
            return date('Y-m-d H:i:s');
        }
    }
    
    if (!function_exists('sanitize_text_field')) {
        function sanitize_text_field($str) {
            return trim(strip_tags($str));
        }
    }
    
    if (!function_exists('sanitize_email')) {
        function sanitize_email($email) {
            return filter_var($email, FILTER_SANITIZE_EMAIL);
        }
    }
    
    if (!function_exists('is_email')) {
        function is_email($email) {
            return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
        }
    }
    
    if (!function_exists('wp_json_encode')) {
        function wp_json_encode($data, $options = 0) {
            return json_encode($data, $options);
        }
    }
    
    if (!function_exists('get_site_url')) {
        function get_site_url() {
            return 'https://example.com';
        }
    }
    
    if (!function_exists('__')) {
        function __($text, $domain = 'default') {
            return $text;
        }
    }
}

// Include the classes
require_once 'includes/class-wp-crm-integration-field-mapper.php';
require_once 'includes/class-wp-crm-integration-api-client.php';

/**
 * Test Field Mapping Engine
 */
function test_field_mapping_engine() {
    echo "=== Testing Field Mapping Engine ===\n";
    
    $field_mapper = new WP_CRM_Integration_Field_Mapper();
    
    // Test data type conversion and validation
    echo "Testing data type conversion and validation...\n";
    
    // Test email validation
    $test_data = array(
        'email' => 'test@example.com',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'phone' => '+1-234-567-8900',
        'total_amount' => '99.99',
        'registration_date' => '2023-01-01 12:00:00'
    );
    
    $validation_result = $field_mapper->validate_extracted_data($test_data, 'customer');
    
    if ($validation_result['valid']) {
        echo "✓ Customer data validation passed\n";
    } else {
        echo "✗ Customer data validation failed: " . implode(', ', $validation_result['errors']) . "\n";
    }
    
    // Test invalid email
    $invalid_data = array(
        'email' => 'invalid-email',
        'first_name' => 'John'
    );
    
    $validation_result = $field_mapper->validate_extracted_data($invalid_data, 'customer');
    
    if (!$validation_result['valid']) {
        echo "✓ Invalid email correctly rejected\n";
    } else {
        echo "✗ Invalid email should have been rejected\n";
    }
    
    echo "\n";
}

/**
 * Test API Communication Logic
 */
function test_api_communication_logic() {
    echo "=== Testing API Communication Logic ===\n";
    
    $api_client = new WP_CRM_Integration_API_Client(
        'https://example-crm.com',
        'test-api-key-12345',
        'test-tenant'
    );
    
    // Test credential validation
    echo "Testing credential validation...\n";
    
    $validation_result = $api_client->validate_credentials();
    
    if ($validation_result['valid']) {
        echo "✓ Credentials validation passed\n";
    } else {
        echo "✗ Credentials validation failed: " . implode(', ', $validation_result['errors']) . "\n";
    }
    
    // Test invalid credentials
    $invalid_client = new WP_CRM_Integration_API_Client('', '', '');
    $validation_result = $invalid_client->validate_credentials();
    
    if (!$validation_result['valid']) {
        echo "✓ Invalid credentials correctly rejected\n";
    } else {
        echo "✗ Invalid credentials should have been rejected\n";
    }
    
    echo "\n";
}

/**
 * Test JSON Payload Formatting
 */
function test_json_payload_formatting() {
    echo "=== Testing JSON Payload Formatting ===\n";
    
    $api_client = new WP_CRM_Integration_API_Client(
        'https://example-crm.com',
        'test-api-key-12345',
        'test-tenant'
    );
    
    // Test customer payload formatting
    $customer_data = array(
        'wordpress_user_id' => 123,
        'email' => 'test@example.com',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'phone' => '+1-234-567-8900',
        'registration_date' => '2023-01-01 12:00:00',
        'billing_info' => array(
            'address_1' => '123 Main St',
            'city' => 'Anytown',
            'country' => 'US'
        )
    );
    
    // Use reflection to test private method
    $reflection = new ReflectionClass($api_client);
    $format_method = $reflection->getMethod('format_customer_payload');
    $format_method->setAccessible(true);
    
    $formatted_payload = $format_method->invoke($api_client, $customer_data);
    
    // Validate formatted payload structure
    $required_fields = array('source', 'email', 'first_name', 'last_name');
    $all_present = true;
    
    foreach ($required_fields as $field) {
        if (!isset($formatted_payload[$field])) {
            $all_present = false;
            echo "✗ Missing required field: $field\n";
        }
    }
    
    if ($all_present) {
        echo "✓ Customer payload formatting passed\n";
    }
    
    // Check metadata structure
    if (isset($formatted_payload['metadata']) && is_array($formatted_payload['metadata'])) {
        echo "✓ Metadata structure is correct\n";
    } else {
        echo "✗ Metadata structure is incorrect\n";
    }
    
    echo "\n";
}

/**
 * Test Data Validation
 */
function test_data_validation() {
    echo "=== Testing Data Validation ===\n";
    
    $field_mapper = new WP_CRM_Integration_Field_Mapper();
    
    // Test various validation scenarios
    $test_cases = array(
        array(
            'name' => 'Valid customer data',
            'data' => array('email' => 'test@example.com', 'first_name' => 'John'),
            'type' => 'customer',
            'should_pass' => true
        ),
        array(
            'name' => 'Missing required email',
            'data' => array('first_name' => 'John'),
            'type' => 'customer',
            'should_pass' => false
        ),
        array(
            'name' => 'Valid order data',
            'data' => array('customer_email' => 'test@example.com', 'total_amount' => 99.99),
            'type' => 'order',
            'should_pass' => true
        ),
        array(
            'name' => 'Invalid order amount',
            'data' => array('customer_email' => 'test@example.com', 'total_amount' => 'invalid'),
            'type' => 'order',
            'should_pass' => false
        )
    );
    
    foreach ($test_cases as $test_case) {
        $result = $field_mapper->validate_extracted_data($test_case['data'], $test_case['type']);
        
        if ($result['valid'] === $test_case['should_pass']) {
            echo "✓ {$test_case['name']}: " . ($test_case['should_pass'] ? 'Passed' : 'Correctly rejected') . "\n";
        } else {
            echo "✗ {$test_case['name']}: Unexpected result\n";
            if (!empty($result['errors'])) {
                echo "  Errors: " . implode(', ', $result['errors']) . "\n";
            }
        }
    }
    
    echo "\n";
}

/**
 * Run all tests
 */
function run_all_tests() {
    echo "WordPress CRM Integration - Data Synchronization Logic Tests\n";
    echo "===========================================================\n\n";
    
    try {
        test_field_mapping_engine();
        test_api_communication_logic();
        test_json_payload_formatting();
        test_data_validation();
        
        echo "=== Test Summary ===\n";
        echo "All tests completed. Check output above for results.\n";
        
    } catch (Exception $e) {
        echo "Test failed with exception: " . $e->getMessage() . "\n";
        echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    }
}

// Run tests if this file is executed directly
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    run_all_tests();
}