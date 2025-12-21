<?php
/**
 * Test script for WordPress CRM Integration Event Handlers
 * 
 * This script tests the event handler functionality without requiring
 * a full WordPress installation.
 */

// Mock WordPress functions for testing
if (!function_exists('get_option')) {
    function get_option($option, $default = false) {
        // Mock settings for testing
        if ($option === 'wp_crm_integration_settings') {
            return array(
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
                        'phone' => 'billing_phone'
                    ),
                    'order' => array(
                        'customer_email' => 'billing_email',
                        'total_amount' => 'order_total',
                        'status' => 'order_status'
                    )
                ),
                'crm_url' => 'http://localhost:3000',
                'api_key' => 'test-api-key',
                'tenant_key' => 'test-tenant'
            );
        }
        return $default;
    }
}

if (!function_exists('get_userdata')) {
    function get_userdata($user_id) {
        // Mock user data
        $user = new stdClass();
        $user->ID = $user_id;
        $user->data = new stdClass();
        $user->data->user_email = "user{$user_id}@example.com";
        $user->data->user_login = "user{$user_id}";
        $user->user_email = "user{$user_id}@example.com";
        $user->user_login = "user{$user_id}";
        $user->user_registered = '2024-01-01 12:00:00';
        $user->display_name = "Test User {$user_id}";
        return $user;
    }
}

if (!function_exists('get_user_meta')) {
    function get_user_meta($user_id, $key, $single = false) {
        // Mock user meta
        $meta_values = array(
            'first_name' => "First{$user_id}",
            'last_name' => "Last{$user_id}",
            'billing_phone' => "+123456789{$user_id}"
        );
        return isset($meta_values[$key]) ? $meta_values[$key] : '';
    }
}

if (!function_exists('current_time')) {
    function current_time($type) {
        return date('Y-m-d H:i:s');
    }
}

if (!function_exists('error_log')) {
    function error_log($message) {
        echo "[LOG] " . $message . "\n";
    }
}

if (!class_exists('WooCommerce')) {
    class WooCommerce {}
}

if (!function_exists('wc_get_order')) {
    function wc_get_order($order_id) {
        // Mock WooCommerce order
        $order = new stdClass();
        $order->id = $order_id;
        
        // Add methods as properties (simplified mock)
        $order->get_id = function() use ($order_id) { return $order_id; };
        $order->get_billing_email = function() use ($order_id) { return "customer{$order_id}@example.com"; };
        $order->get_total = function() { return 99.99; };
        $order->get_status = function() { return 'processing'; };
        $order->get_currency = function() { return 'USD'; };
        $order->get_customer_id = function() { return 0; }; // Guest order
        $order->get_date_created = function() { 
            $date = new stdClass();
            $date->format = function($format) { return date($format); };
            return $date;
        };
        $order->get_billing_first_name = function() { return 'John'; };
        $order->get_billing_last_name = function() { return 'Doe'; };
        $order->get_billing_company = function() { return 'Test Company'; };
        $order->get_billing_address_1 = function() { return '123 Test St'; };
        $order->get_billing_address_2 = function() { return ''; };
        $order->get_billing_city = function() { return 'Test City'; };
        $order->get_billing_state = function() { return 'Test State'; };
        $order->get_billing_postcode = function() { return '12345'; };
        $order->get_billing_country = function() { return 'US'; };
        $order->get_billing_phone = function() { return '+1234567890'; };
        $order->get_items = function() {
            return array(
                1 => (object) array(
                    'get_name' => function() { return 'Test Product'; },
                    'get_quantity' => function() { return 2; },
                    'get_subtotal' => function() { return 199.98; },
                    'get_total' => function() { return 199.98; },
                    'get_product_id' => function() { return 123; },
                    'get_variation_id' => function() { return 0; },
                    'get_product' => function() {
                        $product = new stdClass();
                        $product->get_sku = function() { return 'TEST-SKU'; };
                        return $product;
                    }
                )
            );
        };
        
        return $order;
    }
}

// Mock queue manager for testing
class WP_CRM_Integration_Queue_Manager {
    private static $instance = null;
    private $queue = array();
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function add_to_queue($entity_type, $entity_id, $action, $additional_data = array()) {
        $this->queue[] = array(
            'entity_type' => $entity_type,
            'entity_id' => $entity_id,
            'action' => $action,
            'additional_data' => $additional_data,
            'timestamp' => current_time('mysql')
        );
        
        echo "[QUEUE] Added to queue: {$entity_type} #{$entity_id} ({$action})\n";
        if (!empty($additional_data)) {
            echo "[QUEUE] Additional data: " . json_encode($additional_data, JSON_PRETTY_PRINT) . "\n";
        }
        
        return true;
    }
    
    public function get_queue() {
        return $this->queue;
    }
    
    public function clear_queue() {
        $this->queue = array();
    }
}

// Mock field mapper for testing
class WP_CRM_Integration_Field_Mapper {
    public function extract_user_data($user_id, $field_mappings) {
        $user = get_userdata($user_id);
        if (!$user) {
            return array();
        }
        
        $data = array();
        foreach ($field_mappings as $crm_field => $wp_field) {
            if (empty($wp_field)) continue;
            
            switch ($wp_field) {
                case 'user_email':
                    $data[$crm_field] = $user->user_email;
                    break;
                case 'first_name':
                    $data[$crm_field] = get_user_meta($user_id, 'first_name', true);
                    break;
                case 'last_name':
                    $data[$crm_field] = get_user_meta($user_id, 'last_name', true);
                    break;
                case 'billing_phone':
                    $data[$crm_field] = get_user_meta($user_id, 'billing_phone', true);
                    break;
            }
        }
        
        return $data;
    }
    
    public function extract_order_data($order_id, $field_mappings) {
        $order = wc_get_order($order_id);
        if (!$order) {
            return array();
        }
        
        $data = array();
        foreach ($field_mappings as $crm_field => $wp_field) {
            if (empty($wp_field)) continue;
            
            switch ($wp_field) {
                case 'billing_email':
                    $data[$crm_field] = call_user_func($order->get_billing_email);
                    break;
                case 'order_total':
                    $data[$crm_field] = call_user_func($order->get_total);
                    break;
                case 'order_status':
                    $data[$crm_field] = call_user_func($order->get_status);
                    break;
            }
        }
        
        return $data;
    }
}

// Include the event handlers class
require_once 'includes/class-wp-crm-integration-event-handlers.php';

// Test the event handlers
echo "=== WordPress CRM Integration Event Handlers Test ===\n\n";

// Get the event handlers instance
$event_handlers = WP_CRM_Integration_Event_Handlers::get_instance();
$queue_manager = WP_CRM_Integration_Queue_Manager::get_instance();

echo "1. Testing User Registration Handler\n";
echo "-----------------------------------\n";
$queue_manager->clear_queue();
$event_handlers->handle_user_registration(123);
echo "\n";

echo "2. Testing User Update Handler\n";
echo "------------------------------\n";
$event_handlers->handle_user_update(123);
echo "\n";

echo "3. Testing WooCommerce New Order Handler\n";
echo "----------------------------------------\n";
$event_handlers->handle_new_order(456);
echo "\n";

echo "4. Testing WooCommerce Order Status Change Handler\n";
echo "--------------------------------------------------\n";
$event_handlers->handle_order_status_change(456, 'pending', 'processing');
echo "\n";

echo "5. Queue Summary\n";
echo "----------------\n";
$queue = $queue_manager->get_queue();
echo "Total items in queue: " . count($queue) . "\n";
foreach ($queue as $index => $item) {
    echo "Item " . ($index + 1) . ": {$item['entity_type']} #{$item['entity_id']} ({$item['action']}) at {$item['timestamp']}\n";
}

echo "\n=== Test Completed Successfully ===\n";