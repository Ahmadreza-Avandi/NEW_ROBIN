<?php
/**
 * End-to-End Integration Tests for WordPress CRM Integration
 * 
 * This test suite validates the complete data flow from WordPress events
 * through field mapping, API transmission, CRM validation, and database storage.
 * 
 * @package WordPressCRMIntegration
 * @subpackage Tests
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * End-to-End Integration Test Class
 * 
 * Tests complete sync flows including:
 * - WordPress environment simulation
 * - Event capture and data preparation
 * - API communication with retry logic
 * - Error scenarios and recovery
 * - Field mapping accuracy
 * - CRM data validation and storage
 */
class WP_CRM_Integration_End_To_End_Test extends WP_UnitTestCase {
    
    /**
     * Test CRM URL for integration testing
     */
    private $test_crm_url;
    
    /**
     * Test API key
     */
    private $test_api_key;
    
    /**
     * Test tenant key
     */
    private $test_tenant_key;
    
    /**
     * Original plugin settings
     */
    private $original_settings;
    
    /**
     * Test user IDs created during tests
     */
    private $test_user_ids = array();
    
    /**
     * Test order IDs created during tests (if WooCommerce available)
     */
    private $test_order_ids = array();
    
    /**
     * Test product IDs created during tests (if WooCommerce available)
     */
    private $test_product_ids = array();
    
    /**
     * Mock CRM responses for testing
     */
    private $mock_crm_responses = array();
    
    /**
     * Set up test environment before each test
     */
    public function setUp(): void {
        parent::setUp();
        
        // Set up test CRM configuration
        $this->test_crm_url = 'https://test-crm.example.com';
        $this->test_api_key = 'test_api_key_12345';
        $this->test_tenant_key = 'test_tenant';
        
        // Store original settings
        $this->original_settings = get_option('wp_crm_integration_settings', array());
        
        // Set up test configuration
        $test_settings = array(
            'crm_url' => $this->test_crm_url,
            'api_key' => $this->test_api_key,
            'tenant_key' => $this->test_tenant_key,
            'sync_enabled' => array(
                'customers' => true,
                'orders' => true,
                'products' => true
            ),
            'field_mappings' => array(
                'customer' => array(
                    'email' => 'user_email',
                    'first_name' => 'first_name',
                    'last_name' => 'last_name',
                    'phone' => 'billing_phone',
                    'company' => 'billing_company',
                    'address' => 'billing_address_1',
                    'city' => 'billing_city',
                    'country' => 'billing_country'
                ),
                'order' => array(
                    'customer_email' => 'billing_email',
                    'total_amount' => 'order_total',
                    'currency' => 'order_currency',
                    'status' => 'order_status',
                    'order_date' => 'order_date'
                ),
                'product' => array(
                    'name' => 'product_name',
                    'description' => 'product_description',
                    'sku' => 'product_sku',
                    'price' => 'product_price',
                    'category' => 'product_category'
                )
            ),
            'retry_settings' => array(
                'max_attempts' => 3,
                'base_delay' => 1,
                'max_delay' => 10,
                'backoff_multiplier' => 2,
                'jitter_enabled' => false // Disable for predictable testing
            )
        );
        
        update_option('wp_crm_integration_settings', $test_settings);
        
        // Set up mock CRM responses
        $this->setup_mock_crm_responses();
        
        // Hook into HTTP requests to intercept CRM API calls
        add_filter('pre_http_request', array($this, 'mock_crm_api_requests'), 10, 3);
        
        // Clear any existing queue items
        $this->clear_test_queue();
        
        // Initialize plugin components for testing
        $this->initialize_test_components();
    }
    
    /**
     * Clean up after each test
     */
    public function tearDown(): void {
        // Restore original settings
        update_option('wp_crm_integration_settings', $this->original_settings);
        
        // Remove HTTP request filter
        remove_filter('pre_http_request', array($this, 'mock_crm_api_requests'));
        
        // Clean up test data
        $this->cleanup_test_data();
        
        // Clear test queue
        $this->clear_test_queue();
        
        parent::tearDown();
    }
    
    /**
     * Test complete customer registration sync flow
     * 
     * Validates: Requirements 3.1, 4.2, 4.3, 4.4
     */
    public function test_complete_customer_registration_sync_flow() {
        // Create test user with complete profile data
        $user_data = array(
            'user_login' => 'testuser_' . time(),
            'user_email' => 'testuser@example.com',
            'user_pass' => 'testpassword123',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'display_name' => 'John Doe'
        );
        
        $user_id = wp_insert_user($user_data);
        $this->assertIsInt($user_id, 'User creation should succeed');
        $this->test_user_ids[] = $user_id;
        
        // Add user meta data for field mapping
        update_user_meta($user_id, 'billing_phone', '+1234567890');
        update_user_meta($user_id, 'billing_company', 'Test Company Inc');
        update_user_meta($user_id, 'billing_address_1', '123 Test Street');
        update_user_meta($user_id, 'billing_city', 'Test City');
        update_user_meta($user_id, 'billing_country', 'US');
        
        // Set up successful CRM response
        $this->mock_crm_responses['customers'] = array(
            'success' => true,
            'status_code' => 200,
            'body' => wp_json_encode(array(
                'success' => true,
                'message' => 'Customer created successfully',
                'data' => array(
                    'customer_id' => 'crm_customer_123',
                    'wordpress_user_id' => $user_id,
                    'email' => $user_data['user_email'],
                    'action' => 'created'
                )
            ))
        );
        
        // Trigger user registration action (simulates WordPress user registration)
        do_action('user_register', $user_id);
        
        // Process queue immediately for testing
        $queue_manager = WP_CRM_Integration_Queue_Manager::get_instance();
        $processed = $queue_manager->process_queue_items(1);
        
        // Verify queue processing
        $this->assertGreaterThan(0, $processed, 'Queue should process at least one item');
        
        // Verify API request was made with correct data
        $this->assertTrue($this->was_api_called('customers'), 'Customer API should be called');
        
        $api_request_data = $this->get_last_api_request_data('customers');
        $this->assertNotEmpty($api_request_data, 'API request data should not be empty');
        
        // Verify field mapping was applied correctly
        $this->assertEquals($user_data['user_email'], $api_request_data['email']);
        $this->assertEquals($user_data['first_name'], $api_request_data['first_name']);
        $this->assertEquals($user_data['last_name'], $api_request_data['last_name']);
        $this->assertEquals('+1234567890', $api_request_data['phone']);
        $this->assertEquals('Test Company Inc', $api_request_data['company_name']);
        $this->assertEquals('123 Test Street', $api_request_data['address']);
        $this->assertEquals('Test City', $api_request_data['city']);
        $this->assertEquals('US', $api_request_data['country']);
        
        // Verify WordPress-specific metadata
        $this->assertEquals('wordpress', $api_request_data['source']);
        $this->assertEquals($user_id, $api_request_data['wordpress_user_id']);
        $this->assertArrayHasKey('metadata', $api_request_data);
        $this->assertArrayHasKey('wordpress_user_login', $api_request_data['metadata']);
        $this->assertArrayHasKey('sync_timestamp', $api_request_data['metadata']);
        
        // Verify no items remain in queue (successful processing)
        $remaining_items = $this->get_queue_item_count();
        $this->assertEquals(0, $remaining_items, 'Queue should be empty after successful processing');
    }
    
    /**
     * Test WooCommerce order sync flow (if WooCommerce is available)
     * 
     * Validates: Requirements 3.2, 4.2, 4.5
     */
    public function test_woocommerce_order_sync_flow() {
        if (!$this->is_woocommerce_available()) {
            $this->markTestSkipped('WooCommerce not available for order testing');
        }
        
        // Create test customer
        $customer_id = $this->create_test_customer();
        
        // Create test product
        $product_id = $this->create_test_product();
        
        // Create test order
        $order_data = array(
            'customer_id' => $customer_id,
            'billing_email' => 'customer@example.com',
            'billing_first_name' => 'Jane',
            'billing_last_name' => 'Smith',
            'billing_phone' => '+1987654321',
            'billing_company' => 'Customer Company LLC',
            'billing_address_1' => '456 Customer Ave',
            'billing_city' => 'Customer City',
            'billing_country' => 'CA',
            'total' => 99.99,
            'currency' => 'USD',
            'status' => 'processing'
        );
        
        $order_id = $this->create_test_order($order_data, array(
            array(
                'product_id' => $product_id,
                'quantity' => 2,
                'price' => 49.99
            )
        ));
        
        $this->test_order_ids[] = $order_id;
        
        // Set up successful CRM response for order
        $this->mock_crm_responses['orders'] = array(
            'success' => true,
            'status_code' => 200,
            'body' => wp_json_encode(array(
                'success' => true,
                'message' => 'Order created successfully',
                'data' => array(
                    'order_id' => 'crm_order_456',
                    'wordpress_order_id' => $order_id,
                    'customer_email' => $order_data['billing_email'],
                    'action' => 'created'
                )
            ))
        );
        
        // Trigger order creation action
        do_action('woocommerce_new_order', $order_id);
        
        // Process queue
        $queue_manager = WP_CRM_Integration_Queue_Manager::get_instance();
        $processed = $queue_manager->process_queue_items(1);
        
        // Verify processing
        $this->assertGreaterThan(0, $processed, 'Order queue should process at least one item');
        $this->assertTrue($this->was_api_called('orders'), 'Order API should be called');
        
        $api_request_data = $this->get_last_api_request_data('orders');
        
        // Verify order data mapping
        $this->assertEquals($order_data['billing_email'], $api_request_data['customer_email']);
        $this->assertEquals($order_data['total'], $api_request_data['total_amount']);
        $this->assertEquals($order_data['currency'], $api_request_data['currency']);
        $this->assertEquals($order_data['status'], $api_request_data['status']);
        $this->assertEquals($order_id, $api_request_data['wordpress_order_id']);
        
        // Verify billing info structure
        $this->assertArrayHasKey('billing_info', $api_request_data);
        $billing_info = $api_request_data['billing_info'];
        $this->assertEquals($order_data['billing_first_name'], $billing_info['first_name']);
        $this->assertEquals($order_data['billing_last_name'], $billing_info['last_name']);
        $this->assertEquals($order_data['billing_phone'], $billing_info['phone']);
        
        // Verify line items
        $this->assertArrayHasKey('line_items', $api_request_data);
        $this->assertCount(1, $api_request_data['line_items']);
        
        $line_item = $api_request_data['line_items'][0];
        $this->assertEquals(2, $line_item['quantity']);
        $this->assertEquals(49.99, $line_item['unit_price']);
        $this->assertEquals(99.98, $line_item['total_price']);
    }
    
    /**
     * Test API error handling and retry logic
     * 
     * Validates: Requirements 3.4, 3.5
     */
    public function test_api_error_handling_and_retry_logic() {
        // Create test user
        $user_id = $this->create_test_user();
        
        // Set up failing CRM response (500 error)
        $this->mock_crm_responses['customers'] = array(
            'success' => false,
            'status_code' => 500,
            'body' => wp_json_encode(array(
                'success' => false,
                'error' => 'Internal server error',
                'message' => 'CRM server temporarily unavailable'
            ))
        );
        
        // Trigger user registration
        do_action('user_register', $user_id);
        
        // Process queue (should fail and retry)
        $queue_manager = WP_CRM_Integration_Queue_Manager::get_instance();
        
        // First attempt should fail
        $processed = $queue_manager->process_queue_items(1);
        $this->assertGreaterThan(0, $processed, 'Queue should process the item');
        
        // Verify item is still in queue with incremented attempt count
        $queue_items = $this->get_queue_items();
        $this->assertCount(1, $queue_items, 'Failed item should remain in queue');
        $this->assertEquals(1, $queue_items[0]->attempts, 'Attempt count should be incremented');
        $this->assertEquals('failed', $queue_items[0]->status, 'Status should be failed');
        $this->assertNotEmpty($queue_items[0]->error_message, 'Error message should be recorded');
        
        // Set up successful response for retry
        $this->mock_crm_responses['customers'] = array(
            'success' => true,
            'status_code' => 200,
            'body' => wp_json_encode(array(
                'success' => true,
                'message' => 'Customer created successfully',
                'data' => array(
                    'customer_id' => 'crm_customer_retry_123',
                    'wordpress_user_id' => $user_id,
                    'action' => 'created'
                )
            ))
        );
        
        // Process retry
        $processed = $queue_manager->process_queue_items(1);
        $this->assertGreaterThan(0, $processed, 'Retry should process successfully');
        
        // Verify queue is now empty
        $remaining_items = $this->get_queue_item_count();
        $this->assertEquals(0, $remaining_items, 'Queue should be empty after successful retry');
    }
    
    /**
     * Test rate limiting handling
     * 
     * Validates: Requirements 8.2
     */
    public function test_rate_limiting_handling() {
        // Create test user
        $user_id = $this->create_test_user();
        
        // Set up rate limiting response (429 error)
        $this->mock_crm_responses['customers'] = array(
            'success' => false,
            'status_code' => 429,
            'headers' => array(
                'Retry-After' => '60'
            ),
            'body' => wp_json_encode(array(
                'success' => false,
                'error' => 'Rate limit exceeded',
                'message' => 'Too many requests, please try again later'
            ))
        );
        
        // Trigger user registration
        do_action('user_register', $user_id);
        
        // Process queue (should handle rate limiting)
        $queue_manager = WP_CRM_Integration_Queue_Manager::get_instance();
        $processed = $queue_manager->process_queue_items(1);
        
        // Verify rate limiting was handled
        $this->assertGreaterThan(0, $processed, 'Queue should process the rate-limited item');
        
        $queue_items = $this->get_queue_items();
        $this->assertCount(1, $queue_items, 'Rate-limited item should remain in queue');
        
        // Verify the item is scheduled for retry after the rate limit period
        $scheduled_time = strtotime($queue_items[0]->scheduled_at);
        $current_time = time();
        $this->assertGreaterThan($current_time + 50, $scheduled_time, 'Item should be scheduled for future retry');
    }
    
    /**
     * Test field mapping validation and error handling
     * 
     * Validates: Requirements 2.4, 2.5
     */
    public function test_field_mapping_validation() {
        // Set up invalid field mapping (missing required field)
        $invalid_settings = get_option('wp_crm_integration_settings');
        $invalid_settings['field_mappings']['customer']['email'] = ''; // Remove required email mapping
        update_option('wp_crm_integration_settings', $invalid_settings);
        
        // Create test user
        $user_id = $this->create_test_user();
        
        // Trigger user registration
        do_action('user_register', $user_id);
        
        // Process queue
        $queue_manager = WP_CRM_Integration_Queue_Manager::get_instance();
        $processed = $queue_manager->process_queue_items(1);
        
        // Verify validation error was handled
        $queue_items = $this->get_queue_items();
        $this->assertCount(1, $queue_items, 'Invalid mapping should create queue item');
        $this->assertEquals('failed', $queue_items[0]->status, 'Item should fail validation');
        $this->assertStringContainsString('email', $queue_items[0]->error_message, 'Error should mention missing email');
    }
    
    /**
     * Test connection validation
     * 
     * Validates: Requirements 1.4, 1.5
     */
    public function test_connection_validation() {
        // Set up test connection endpoint response
        $this->mock_crm_responses['test'] = array(
            'success' => true,
            'status_code' => 200,
            'body' => wp_json_encode(array(
                'success' => true,
                'message' => 'WordPress integration connection successful',
                'data' => array(
                    'status' => 'healthy',
                    'api_version' => '1.0.0',
                    'tenant_key' => $this->test_tenant_key,
                    'endpoints' => array(
                        'customers' => '/api/integrations/wordpress/customers',
                        'orders' => '/api/integrations/wordpress/orders',
                        'products' => '/api/integrations/wordpress/products'
                    )
                )
            ))
        );
        
        // Test connection using API client
        $api_client = new WP_CRM_Integration_API_Client(
            $this->test_crm_url,
            $this->test_api_key,
            $this->test_tenant_key
        );
        
        $connection_result = $api_client->test_connection();
        
        // Verify successful connection
        $this->assertTrue($connection_result['success'], 'Connection test should succeed');
        $this->assertEquals('Connection successful', $connection_result['message']);
        $this->assertArrayHasKey('data', $connection_result);
        $this->assertEquals('healthy', $connection_result['data']['status']);
        $this->assertEquals($this->test_tenant_key, $connection_result['data']['tenant_key']);
    }
    
    /**
     * Test authentication failure handling
     * 
     * Validates: Requirements 4.1, 7.4
     */
    public function test_authentication_failure_handling() {
        // Set up authentication failure response
        $this->mock_crm_responses['customers'] = array(
            'success' => false,
            'status_code' => 401,
            'body' => wp_json_encode(array(
                'success' => false,
                'error' => 'Authentication failed',
                'message' => 'Invalid API key'
            ))
        );
        
        // Create test user
        $user_id = $this->create_test_user();
        
        // Trigger user registration
        do_action('user_register', $user_id);
        
        // Process queue
        $queue_manager = WP_CRM_Integration_Queue_Manager::get_instance();
        $processed = $queue_manager->process_queue_items(1);
        
        // Verify authentication error was handled
        $queue_items = $this->get_queue_items();
        $this->assertCount(1, $queue_items, 'Auth failure should create queue item');
        $this->assertEquals('failed', $queue_items[0]->status, 'Item should fail authentication');
        $this->assertStringContainsString('Authentication', $queue_items[0]->error_message, 'Error should mention authentication');
    }
    
    /**
     * Test batch processing functionality
     * 
     * Validates: Requirements 8.1, 8.3
     */
    public function test_batch_processing() {
        if (!$this->is_woocommerce_available()) {
            $this->markTestSkipped('WooCommerce not available for batch testing');
        }
        
        // Create multiple test users for batch processing
        $user_ids = array();
        for ($i = 0; $i < 5; $i++) {
            $user_ids[] = $this->create_test_user("batchuser{$i}@example.com");
        }
        
        // Set up successful batch response
        $this->mock_crm_responses['customers'] = array(
            'success' => true,
            'status_code' => 200,
            'body' => wp_json_encode(array(
                'success' => true,
                'message' => 'Batch processed successfully',
                'data' => array(
                    'processed_count' => 5,
                    'successful_count' => 5,
                    'failed_count' => 0
                )
            ))
        );
        
        // Trigger user registrations
        foreach ($user_ids as $user_id) {
            do_action('user_register', $user_id);
        }
        
        // Process queue in batch
        $queue_manager = WP_CRM_Integration_Queue_Manager::get_instance();
        $processed = $queue_manager->process_queue_items(5); // Process up to 5 items
        
        // Verify batch processing
        $this->assertEquals(5, $processed, 'Should process all 5 items in batch');
        
        // Verify queue is empty
        $remaining_items = $this->get_queue_item_count();
        $this->assertEquals(0, $remaining_items, 'Queue should be empty after batch processing');
    }
    
    /**
     * Test WordPress compatibility across different scenarios
     * 
     * Validates: Requirements 6.1, 6.2, 6.3
     */
    public function test_wordpress_compatibility() {
        // Test with different user roles
        $subscriber_id = $this->create_test_user('subscriber@example.com', 'subscriber');
        $editor_id = $this->create_test_user('editor@example.com', 'editor');
        $admin_id = $this->create_test_user('admin@example.com', 'administrator');
        
        // Set up successful responses
        $this->mock_crm_responses['customers'] = array(
            'success' => true,
            'status_code' => 200,
            'body' => wp_json_encode(array(
                'success' => true,
                'message' => 'Customer created successfully',
                'data' => array('action' => 'created')
            ))
        );
        
        // Trigger registrations for different user roles
        do_action('user_register', $subscriber_id);
        do_action('user_register', $editor_id);
        do_action('user_register', $admin_id);
        
        // Process queue
        $queue_manager = WP_CRM_Integration_Queue_Manager::get_instance();
        $processed = $queue_manager->process_queue_items(3);
        
        // Verify all user types are processed correctly
        $this->assertEquals(3, $processed, 'Should process users of all roles');
        
        // Verify API was called for each user
        $this->assertEquals(3, $this->get_api_call_count('customers'), 'Should make API call for each user');
    }
    
    // Helper Methods
    
    /**
     * Set up mock CRM responses for testing
     */
    private function setup_mock_crm_responses() {
        $this->mock_crm_responses = array(
            'test' => array(
                'success' => true,
                'status_code' => 200,
                'body' => wp_json_encode(array(
                    'success' => true,
                    'message' => 'Connection successful',
                    'data' => array(
                        'status' => 'healthy',
                        'api_version' => '1.0.0',
                        'tenant_key' => $this->test_tenant_key
                    )
                ))
            ),
            'customers' => array(
                'success' => true,
                'status_code' => 200,
                'body' => wp_json_encode(array(
                    'success' => true,
                    'message' => 'Customer created successfully'
                ))
            ),
            'orders' => array(
                'success' => true,
                'status_code' => 200,
                'body' => wp_json_encode(array(
                    'success' => true,
                    'message' => 'Order created successfully'
                ))
            ),
            'products' => array(
                'success' => true,
                'status_code' => 200,
                'body' => wp_json_encode(array(
                    'success' => true,
                    'message' => 'Product created successfully'
                ))
            )
        );
    }
    
    /**
     * Mock CRM API requests for testing
     */
    public function mock_crm_api_requests($preempt, $parsed_args, $url) {
        // Only intercept requests to our test CRM URL
        if (strpos($url, $this->test_crm_url) === false) {
            return false; // Let other requests proceed normally
        }
        
        // Determine endpoint type from URL
        $endpoint_type = 'test'; // Default
        if (strpos($url, '/customers') !== false) {
            $endpoint_type = 'customers';
        } elseif (strpos($url, '/orders') !== false) {
            $endpoint_type = 'orders';
        } elseif (strpos($url, '/products') !== false) {
            $endpoint_type = 'products';
        }
        
        // Store request data for verification
        $this->store_api_request_data($endpoint_type, $parsed_args);
        
        // Return mock response
        $mock_response = isset($this->mock_crm_responses[$endpoint_type]) 
            ? $this->mock_crm_responses[$endpoint_type] 
            : $this->mock_crm_responses['test'];
        
        $response = array(
            'headers' => isset($mock_response['headers']) ? $mock_response['headers'] : array(),
            'body' => $mock_response['body'],
            'response' => array(
                'code' => $mock_response['status_code'],
                'message' => $mock_response['success'] ? 'OK' : 'Error'
            ),
            'cookies' => array(),
            'filename' => null
        );
        
        return $response;
    }
    
    /**
     * Store API request data for verification
     */
    private function store_api_request_data($endpoint_type, $parsed_args) {
        if (!isset($this->api_requests)) {
            $this->api_requests = array();
        }
        
        if (!isset($this->api_requests[$endpoint_type])) {
            $this->api_requests[$endpoint_type] = array();
        }
        
        $request_data = null;
        if (isset($parsed_args['body'])) {
            $request_data = json_decode($parsed_args['body'], true);
        }
        
        $this->api_requests[$endpoint_type][] = array(
            'method' => isset($parsed_args['method']) ? $parsed_args['method'] : 'GET',
            'headers' => isset($parsed_args['headers']) ? $parsed_args['headers'] : array(),
            'data' => $request_data,
            'timestamp' => time()
        );
    }
    
    /**
     * Check if API was called for specific endpoint
     */
    private function was_api_called($endpoint_type) {
        return isset($this->api_requests[$endpoint_type]) && !empty($this->api_requests[$endpoint_type]);
    }
    
    /**
     * Get last API request data for endpoint
     */
    private function get_last_api_request_data($endpoint_type) {
        if (!$this->was_api_called($endpoint_type)) {
            return null;
        }
        
        $requests = $this->api_requests[$endpoint_type];
        $last_request = end($requests);
        
        return $last_request['data'];
    }
    
    /**
     * Get API call count for endpoint
     */
    private function get_api_call_count($endpoint_type) {
        if (!isset($this->api_requests[$endpoint_type])) {
            return 0;
        }
        
        return count($this->api_requests[$endpoint_type]);
    }
    
    /**
     * Create test user with optional role
     */
    private function create_test_user($email = null, $role = 'subscriber') {
        $email = $email ?: 'testuser_' . time() . '@example.com';
        
        $user_data = array(
            'user_login' => 'testuser_' . time() . '_' . rand(1000, 9999),
            'user_email' => $email,
            'user_pass' => 'testpassword123',
            'first_name' => 'Test',
            'last_name' => 'User',
            'role' => $role
        );
        
        $user_id = wp_insert_user($user_data);
        $this->test_user_ids[] = $user_id;
        
        return $user_id;
    }
    
    /**
     * Create test customer (WooCommerce)
     */
    private function create_test_customer() {
        if (!$this->is_woocommerce_available()) {
            return null;
        }
        
        $customer = new WC_Customer();
        $customer->set_email('customer@example.com');
        $customer->set_first_name('Jane');
        $customer->set_last_name('Smith');
        $customer->set_billing_phone('+1987654321');
        $customer->set_billing_company('Customer Company LLC');
        $customer->set_billing_address_1('456 Customer Ave');
        $customer->set_billing_city('Customer City');
        $customer->set_billing_country('CA');
        $customer->save();
        
        return $customer->get_id();
    }
    
    /**
     * Create test product (WooCommerce)
     */
    private function create_test_product() {
        if (!$this->is_woocommerce_available()) {
            return null;
        }
        
        $product = new WC_Product_Simple();
        $product->set_name('Test Product');
        $product->set_regular_price(49.99);
        $product->set_sku('TEST-SKU-123');
        $product->set_description('Test product description');
        $product->set_status('publish');
        $product->save();
        
        $this->test_product_ids[] = $product->get_id();
        
        return $product->get_id();
    }
    
    /**
     * Create test order (WooCommerce)
     */
    private function create_test_order($order_data, $line_items = array()) {
        if (!$this->is_woocommerce_available()) {
            return null;
        }
        
        $order = wc_create_order();
        
        // Set billing information
        $order->set_billing_email($order_data['billing_email']);
        $order->set_billing_first_name($order_data['billing_first_name']);
        $order->set_billing_last_name($order_data['billing_last_name']);
        $order->set_billing_phone($order_data['billing_phone']);
        $order->set_billing_company($order_data['billing_company']);
        $order->set_billing_address_1($order_data['billing_address_1']);
        $order->set_billing_city($order_data['billing_city']);
        $order->set_billing_country($order_data['billing_country']);
        
        // Set order properties
        $order->set_currency($order_data['currency']);
        $order->set_status($order_data['status']);
        
        // Add line items
        foreach ($line_items as $item) {
            $order->add_product(wc_get_product($item['product_id']), $item['quantity']);
        }
        
        // Set customer if provided
        if (isset($order_data['customer_id'])) {
            $order->set_customer_id($order_data['customer_id']);
        }
        
        $order->calculate_totals();
        $order->save();
        
        return $order->get_id();
    }
    
    /**
     * Check if WooCommerce is available
     */
    private function is_woocommerce_available() {
        return class_exists('WooCommerce') && function_exists('wc_create_order');
    }
    
    /**
     * Clear test queue
     */
    private function clear_test_queue() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crm_integration_queue';
        $wpdb->query("DELETE FROM {$table_name}");
    }
    
    /**
     * Get queue item count
     */
    private function get_queue_item_count() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crm_integration_queue';
        return (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table_name}");
    }
    
    /**
     * Get queue items
     */
    private function get_queue_items() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crm_integration_queue';
        return $wpdb->get_results("SELECT * FROM {$table_name} ORDER BY created_at DESC");
    }
    
    /**
     * Clean up test data
     */
    private function cleanup_test_data() {
        // Delete test users
        foreach ($this->test_user_ids as $user_id) {
            wp_delete_user($user_id);
        }
        
        // Delete test orders (WooCommerce)
        if ($this->is_woocommerce_available()) {
            foreach ($this->test_order_ids as $order_id) {
                wp_delete_post($order_id, true);
            }
            
            // Delete test products
            foreach ($this->test_product_ids as $product_id) {
                wp_delete_post($product_id, true);
            }
        }
        
        // Reset arrays
        $this->test_user_ids = array();
        $this->test_order_ids = array();
        $this->test_product_ids = array();
    }
    
    /**
     * Initialize test components
     */
    private function initialize_test_components() {
        // Ensure all plugin components are loaded for testing
        if (class_exists('WP_CRM_Integration_Queue_Manager')) {
            WP_CRM_Integration_Queue_Manager::get_instance();
        }
        
        if (class_exists('WP_CRM_Integration_Event_Handlers')) {
            WP_CRM_Integration_Event_Handlers::get_instance();
        }
        
        if (class_exists('WP_CRM_Integration_Logger')) {
            WP_CRM_Integration_Logger::get_instance();
        }
    }
}
 