<?php
/**
 * Test Utilities for WordPress CRM Integration
 * 
 * Provides helper methods and utilities for testing the integration.
 * 
 * @package WordPressCRMIntegration
 * @subpackage Tests
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Test utilities class
 */
class WP_CRM_Test_Utilities {
    
    /**
     * Create a test WordPress user with complete profile data
     * 
     * @param array $user_data Optional user data overrides
     * @return int User ID
     */
    public static function create_test_user($user_data = array()) {
        $defaults = array(
            'user_login' => 'testuser_' . time() . '_' . rand(1000, 9999),
            'user_email' => 'testuser_' . time() . '@example.com',
            'user_pass' => 'testpassword123',
            'first_name' => 'Test',
            'last_name' => 'User',
            'display_name' => 'Test User',
            'role' => 'subscriber'
        );
        
        $user_data = wp_parse_args($user_data, $defaults);
        $user_id = wp_insert_user($user_data);
        
        if (is_wp_error($user_id)) {
            throw new Exception('Failed to create test user: ' . $user_id->get_error_message());
        }
        
        // Add common user meta for field mapping tests
        update_user_meta($user_id, 'billing_phone', '+1234567890');
        update_user_meta($user_id, 'billing_company', 'Test Company Inc');
        update_user_meta($user_id, 'billing_address_1', '123 Test Street');
        update_user_meta($user_id, 'billing_city', 'Test City');
        update_user_meta($user_id, 'billing_state', 'Test State');
        update_user_meta($user_id, 'billing_country', 'US');
        update_user_meta($user_id, 'billing_postcode', '12345');
        
        return $user_id;
    }
    
    /**
     * Create a test WooCommerce customer
     * 
     * @param array $customer_data Optional customer data overrides
     * @return int Customer ID
     */
    public static function create_test_wc_customer($customer_data = array()) {
        if (!class_exists('WC_Customer')) {
            throw new Exception('WooCommerce not available for customer creation');
        }
        
        $defaults = array(
            'email' => 'customer_' . time() . '@example.com',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'billing_phone' => '+1987654321',
            'billing_company' => 'Customer Company LLC',
            'billing_address_1' => '456 Customer Ave',
            'billing_city' => 'Customer City',
            'billing_state' => 'Customer State',
            'billing_country' => 'CA',
            'billing_postcode' => '54321'
        );
        
        $customer_data = wp_parse_args($customer_data, $defaults);
        
        $customer = new WC_Customer();
        $customer->set_email($customer_data['email']);
        $customer->set_first_name($customer_data['first_name']);
        $customer->set_last_name($customer_data['last_name']);
        $customer->set_billing_phone($customer_data['billing_phone']);
        $customer->set_billing_company($customer_data['billing_company']);
        $customer->set_billing_address_1($customer_data['billing_address_1']);
        $customer->set_billing_city($customer_data['billing_city']);
        $customer->set_billing_state($customer_data['billing_state']);
        $customer->set_billing_country($customer_data['billing_country']);
        $customer->set_billing_postcode($customer_data['billing_postcode']);
        $customer->save();
        
        return $customer->get_id();
    }
    
    /**
     * Create a test WooCommerce product
     * 
     * @param array $product_data Optional product data overrides
     * @return int Product ID
     */
    public static function create_test_wc_product($product_data = array()) {
        if (!class_exists('WC_Product_Simple')) {
            throw new Exception('WooCommerce not available for product creation');
        }
        
        $defaults = array(
            'name' => 'Test Product ' . time(),
            'regular_price' => 49.99,
            'sku' => 'TEST-SKU-' . time(),
            'description' => 'Test product description',
            'short_description' => 'Short test description',
            'status' => 'publish',
            'weight' => '1.5',
            'length' => '10',
            'width' => '8',
            'height' => '6'
        );
        
        $product_data = wp_parse_args($product_data, $defaults);
        
        $product = new WC_Product_Simple();
        $product->set_name($product_data['name']);
        $product->set_regular_price($product_data['regular_price']);
        $product->set_sku($product_data['sku']);
        $product->set_description($product_data['description']);
        $product->set_short_description($product_data['short_description']);
        $product->set_status($product_data['status']);
        $product->set_weight($product_data['weight']);
        $product->set_length($product_data['length']);
        $product->set_width($product_data['width']);
        $product->set_height($product_data['height']);
        $product->save();
        
        return $product->get_id();
    }
    
    /**
     * Create a test WooCommerce order
     * 
     * @param array $order_data Order data
     * @param array $line_items Line items for the order
     * @return int Order ID
     */
    public static function create_test_wc_order($order_data = array(), $line_items = array()) {
        if (!function_exists('wc_create_order')) {
            throw new Exception('WooCommerce not available for order creation');
        }
        
        $defaults = array(
            'billing_email' => 'customer@example.com',
            'billing_first_name' => 'Jane',
            'billing_last_name' => 'Smith',
            'billing_phone' => '+1987654321',
            'billing_company' => 'Customer Company LLC',
            'billing_address_1' => '456 Customer Ave',
            'billing_city' => 'Customer City',
            'billing_state' => 'Customer State',
            'billing_country' => 'CA',
            'billing_postcode' => '54321',
            'currency' => 'USD',
            'status' => 'processing'
        );
        
        $order_data = wp_parse_args($order_data, $defaults);
        
        $order = wc_create_order();
        
        // Set billing information
        $order->set_billing_email($order_data['billing_email']);
        $order->set_billing_first_name($order_data['billing_first_name']);
        $order->set_billing_last_name($order_data['billing_last_name']);
        $order->set_billing_phone($order_data['billing_phone']);
        $order->set_billing_company($order_data['billing_company']);
        $order->set_billing_address_1($order_data['billing_address_1']);
        $order->set_billing_city($order_data['billing_city']);
        $order->set_billing_state($order_data['billing_state']);
        $order->set_billing_country($order_data['billing_country']);
        $order->set_billing_postcode($order_data['billing_postcode']);
        
        // Set order properties
        $order->set_currency($order_data['currency']);
        $order->set_status($order_data['status']);
        
        // Set customer if provided
        if (isset($order_data['customer_id'])) {
            $order->set_customer_id($order_data['customer_id']);
        }
        
        // Add line items
        if (empty($line_items)) {
            // Create a default product and line item
            $product_id = self::create_test_wc_product();
            $line_items = array(
                array(
                    'product_id' => $product_id,
                    'quantity' => 1,
                    'price' => 49.99
                )
            );
        }
        
        foreach ($line_items as $item) {
            $product = wc_get_product($item['product_id']);
            if ($product) {
                $order->add_product($product, $item['quantity']);
            }
        }
        
        $order->calculate_totals();
        $order->save();
        
        return $order->get_id();
    }
    
    /**
     * Set up test plugin configuration
     * 
     * @param array $config_overrides Optional configuration overrides
     * @return array The test configuration
     */
    public static function setup_test_config($config_overrides = array()) {
        $default_config = array(
            'crm_url' => 'https://test-crm.example.com',
            'api_key' => 'test_api_key_12345',
            'tenant_key' => 'test_tenant',
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
                    'state' => 'billing_state',
                    'country' => 'billing_country',
                    'postal_code' => 'billing_postcode'
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
            ),
            'queue_settings' => array(
                'batch_size' => 5,
                'process_interval' => 60,
                'retention_days' => 7
            )
        );
        
        $config = wp_parse_args($config_overrides, $default_config);
        update_option('wp_crm_integration_settings', $config);
        
        return $config;
    }
    
    /**
     * Clear all test data from the database
     */
    public static function clear_test_data() {
        global $wpdb;
        
        // Clear queue table
        $queue_table = $wpdb->prefix . 'crm_integration_queue';
        $wpdb->query("DELETE FROM {$queue_table}");
        
        // Clear log table
        $log_table = $wpdb->prefix . 'crm_integration_log';
        $wpdb->query("DELETE FROM {$log_table}");
        
        // Clear batch progress table
        $batch_table = $wpdb->prefix . 'crm_integration_batch_progress';
        $wpdb->query("DELETE FROM {$batch_table}");
    }
    
    /**
     * Get queue items for testing
     * 
     * @param array $filters Optional filters
     * @return array Queue items
     */
    public static function get_queue_items($filters = array()) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crm_integration_queue';
        $where_clauses = array();
        $values = array();
        
        if (isset($filters['entity_type'])) {
            $where_clauses[] = 'entity_type = %s';
            $values[] = $filters['entity_type'];
        }
        
        if (isset($filters['status'])) {
            $where_clauses[] = 'status = %s';
            $values[] = $filters['status'];
        }
        
        $where_sql = '';
        if (!empty($where_clauses)) {
            $where_sql = 'WHERE ' . implode(' AND ', $where_clauses);
        }
        
        $sql = "SELECT * FROM {$table_name} {$where_sql} ORDER BY created_at DESC";
        
        if (!empty($values)) {
            $sql = $wpdb->prepare($sql, $values);
        }
        
        return $wpdb->get_results($sql);
    }
    
    /**
     * Get log entries for testing
     * 
     * @param array $filters Optional filters
     * @return array Log entries
     */
    public static function get_log_entries($filters = array()) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crm_integration_log';
        $where_clauses = array();
        $values = array();
        
        if (isset($filters['level'])) {
            $where_clauses[] = 'level = %s';
            $values[] = $filters['level'];
        }
        
        if (isset($filters['entity_type'])) {
            $where_clauses[] = 'entity_type = %s';
            $values[] = $filters['entity_type'];
        }
        
        if (isset($filters['action'])) {
            $where_clauses[] = 'action = %s';
            $values[] = $filters['action'];
        }
        
        $where_sql = '';
        if (!empty($where_clauses)) {
            $where_sql = 'WHERE ' . implode(' AND ', $where_clauses);
        }
        
        $sql = "SELECT * FROM {$table_name} {$where_sql} ORDER BY created_at DESC LIMIT 100";
        
        if (!empty($values)) {
            $sql = $wpdb->prepare($sql, $values);
        }
        
        return $wpdb->get_results($sql);
    }
    
    /**
     * Assert that a queue item exists with specific criteria
     * 
     * @param array $criteria Criteria to match
     * @param string $message Optional assertion message
     */
    public static function assert_queue_item_exists($criteria, $message = '') {
        $items = self::get_queue_items($criteria);
        
        if (empty($message)) {
            $message = 'Queue item should exist with criteria: ' . wp_json_encode($criteria);
        }
        
        PHPUnit\Framework\Assert::assertNotEmpty($items, $message);
    }
    
    /**
     * Assert that a log entry exists with specific criteria
     * 
     * @param array $criteria Criteria to match
     * @param string $message Optional assertion message
     */
    public static function assert_log_entry_exists($criteria, $message = '') {
        $entries = self::get_log_entries($criteria);
        
        if (empty($message)) {
            $message = 'Log entry should exist with criteria: ' . wp_json_encode($criteria);
        }
        
        PHPUnit\Framework\Assert::assertNotEmpty($entries, $message);
    }
    
    /**
     * Create mock CRM responses for testing
     * 
     * @param array $responses Response configuration
     * @return array Mock responses
     */
    public static function create_mock_responses($responses = array()) {
        $defaults = array(
            'test' => array(
                'success' => true,
                'status_code' => 200,
                'body' => wp_json_encode(array(
                    'success' => true,
                    'message' => 'Connection successful',
                    'data' => array(
                        'status' => 'healthy',
                        'api_version' => '1.0.0',
                        'tenant_key' => 'test_tenant'
                    )
                ))
            ),
            'customers' => array(
                'success' => true,
                'status_code' => 200,
                'body' => wp_json_encode(array(
                    'success' => true,
                    'message' => 'Customer created successfully',
                    'data' => array(
                        'customer_id' => 'crm_customer_123',
                        'action' => 'created'
                    )
                ))
            ),
            'orders' => array(
                'success' => true,
                'status_code' => 200,
                'body' => wp_json_encode(array(
                    'success' => true,
                    'message' => 'Order created successfully',
                    'data' => array(
                        'order_id' => 'crm_order_456',
                        'action' => 'created'
                    )
                ))
            ),
            'products' => array(
                'success' => true,
                'status_code' => 200,
                'body' => wp_json_encode(array(
                    'success' => true,
                    'message' => 'Product created successfully',
                    'data' => array(
                        'product_id' => 'crm_product_789',
                        'action' => 'created'
                    )
                ))
            )
        );
        
        return wp_parse_args($responses, $defaults);
    }
    
    /**
     * Simulate WordPress environment conditions
     * 
     * @param array $conditions Environment conditions to simulate
     */
    public static function simulate_environment($conditions = array()) {
        // Simulate different WordPress versions
        if (isset($conditions['wp_version'])) {
            global $wp_version;
            $wp_version = $conditions['wp_version'];
        }
        
        // Simulate different PHP versions
        if (isset($conditions['php_version'])) {
            // This is for testing compatibility checks, not actual PHP version change
            define('WP_CRM_TEST_PHP_VERSION', $conditions['php_version']);
        }
        
        // Simulate memory limits
        if (isset($conditions['memory_limit'])) {
            ini_set('memory_limit', $conditions['memory_limit']);
        }
        
        // Simulate plugin conflicts
        if (isset($conditions['conflicting_plugins'])) {
            foreach ($conditions['conflicting_plugins'] as $plugin) {
                // Simulate plugin activation
                update_option('active_plugins', array($plugin));
            }
        }
        
        // Simulate WooCommerce availability
        if (isset($conditions['woocommerce_active'])) {
            if ($conditions['woocommerce_active'] && !class_exists('WooCommerce')) {
                // Mock WooCommerce classes for testing
                self::mock_woocommerce_classes();
            }
        }
    }
    
    /**
     * Mock WooCommerce classes for testing when WooCommerce is not available
     */
    private static function mock_woocommerce_classes() {
        if (!class_exists('WC_Customer')) {
            class WC_Customer {
                private $data = array();
                
                public function set_email($email) { $this->data['email'] = $email; }
                public function set_first_name($name) { $this->data['first_name'] = $name; }
                public function set_last_name($name) { $this->data['last_name'] = $name; }
                public function set_billing_phone($phone) { $this->data['billing_phone'] = $phone; }
                public function set_billing_company($company) { $this->data['billing_company'] = $company; }
                public function set_billing_address_1($address) { $this->data['billing_address_1'] = $address; }
                public function set_billing_city($city) { $this->data['billing_city'] = $city; }
                public function set_billing_state($state) { $this->data['billing_state'] = $state; }
                public function set_billing_country($country) { $this->data['billing_country'] = $country; }
                public function set_billing_postcode($postcode) { $this->data['billing_postcode'] = $postcode; }
                
                public function save() { 
                    $this->data['id'] = rand(1000, 9999);
                    return $this->data['id'];
                }
                
                public function get_id() { return isset($this->data['id']) ? $this->data['id'] : 0; }
            }
        }
        
        if (!class_exists('WC_Product_Simple')) {
            class WC_Product_Simple {
                private $data = array();
                
                public function set_name($name) { $this->data['name'] = $name; }
                public function set_regular_price($price) { $this->data['regular_price'] = $price; }
                public function set_sku($sku) { $this->data['sku'] = $sku; }
                public function set_description($desc) { $this->data['description'] = $desc; }
                public function set_short_description($desc) { $this->data['short_description'] = $desc; }
                public function set_status($status) { $this->data['status'] = $status; }
                public function set_weight($weight) { $this->data['weight'] = $weight; }
                public function set_length($length) { $this->data['length'] = $length; }
                public function set_width($width) { $this->data['width'] = $width; }
                public function set_height($height) { $this->data['height'] = $height; }
                
                public function save() { 
                    $this->data['id'] = rand(1000, 9999);
                    return $this->data['id'];
                }
                
                public function get_id() { return isset($this->data['id']) ? $this->data['id'] : 0; }
            }
        }
        
        if (!function_exists('wc_create_order')) {
            function wc_create_order() {
                return new WC_Mock_Order();
            }
        }
        
        if (!function_exists('wc_get_product')) {
            function wc_get_product($product_id) {
                $product = new WC_Product_Simple();
                $product->set_name('Mock Product ' . $product_id);
                $product->set_regular_price(49.99);
                return $product;
            }
        }
        
        if (!class_exists('WC_Mock_Order')) {
            class WC_Mock_Order {
                private $data = array();
                private $line_items = array();
                
                public function set_billing_email($email) { $this->data['billing_email'] = $email; }
                public function set_billing_first_name($name) { $this->data['billing_first_name'] = $name; }
                public function set_billing_last_name($name) { $this->data['billing_last_name'] = $name; }
                public function set_billing_phone($phone) { $this->data['billing_phone'] = $phone; }
                public function set_billing_company($company) { $this->data['billing_company'] = $company; }
                public function set_billing_address_1($address) { $this->data['billing_address_1'] = $address; }
                public function set_billing_city($city) { $this->data['billing_city'] = $city; }
                public function set_billing_state($state) { $this->data['billing_state'] = $state; }
                public function set_billing_country($country) { $this->data['billing_country'] = $country; }
                public function set_billing_postcode($postcode) { $this->data['billing_postcode'] = $postcode; }
                public function set_currency($currency) { $this->data['currency'] = $currency; }
                public function set_status($status) { $this->data['status'] = $status; }
                public function set_customer_id($id) { $this->data['customer_id'] = $id; }
                
                public function add_product($product, $quantity) {
                    $this->line_items[] = array(
                        'product' => $product,
                        'quantity' => $quantity
                    );
                }
                
                public function calculate_totals() {
                    $total = 0;
                    foreach ($this->line_items as $item) {
                        $total += $item['product']->get_regular_price() * $item['quantity'];
                    }
                    $this->data['total'] = $total;
                }
                
                public function save() {
                    $this->data['id'] = rand(1000, 9999);
                    return $this->data['id'];
                }
                
                public function get_id() { return isset($this->data['id']) ? $this->data['id'] : 0; }
            }
        }
    }
}