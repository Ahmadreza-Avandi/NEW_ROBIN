<?php
/**
 * کلاس Event Handler برای مدیریت رویدادها
 */

if (!defined('ABSPATH')) {
    exit;
}

class WP_CRM_Event_Handler {
    
    private $plugin;
    private $api_client;
    
    public function __construct($plugin) {
        $this->plugin = $plugin;
        $this->api_client = new WP_CRM_API_Client($plugin);
        $this->init();
    }
    
    private function init() {
        if ($this->plugin->get_setting('sync_users')) {
            add_action('user_register', array($this, 'handle_user_register'));
            add_action('profile_update', array($this, 'handle_user_update'));
            add_action('delete_user', array($this, 'handle_user_delete'));
        }
        
        if ($this->plugin->get_setting('sync_woocommerce') && class_exists('WooCommerce')) {
            add_action('woocommerce_new_order', array($this, 'handle_new_order'));
            add_action('woocommerce_order_status_changed', array($this, 'handle_order_status_change'));
            add_action('save_post', array($this, 'handle_product_save'));
        }
        
        add_action('wp_crm_process_queue', array($this, 'process_sync_queue'));
        
        if (!wp_next_scheduled('wp_crm_process_queue')) {
            wp_schedule_event(time(), 'hourly', 'wp_crm_process_queue');
        }
        
        add_action('wp_ajax_wp_crm_sync_all_customers', array($this, 'ajax_sync_all_customers'));
        add_action('wp_ajax_wp_crm_sync_all_products', array($this, 'ajax_sync_all_products'));
        add_action('wp_ajax_wp_crm_sync_all_orders', array($this, 'ajax_sync_all_orders'));
    }
    
    public function handle_user_register($user_id) {
        $this->plugin->log("New user registered: $user_id", 'info');
        $this->queue_sync('user', $user_id, 'create');
    }
    
    public function handle_user_update($user_id) {
        $this->plugin->log("User updated: $user_id", 'info');
        $this->queue_sync('user', $user_id, 'update');
    }
    
    public function handle_user_delete($user_id) {
        $this->plugin->log("User deleted: $user_id", 'info');
    }
    
    public function handle_new_order($order_id) {
        $this->plugin->log("New order: $order_id", 'info');
        $order = wc_get_order($order_id);
        if ($order && $order->get_user_id()) {
            $this->queue_sync('user', $order->get_user_id(), 'update');
        }
    }
    
    public function handle_order_status_change($order_id) {
        $this->handle_new_order($order_id);
    }
    
    public function handle_product_save($post_id) {
        if (get_post_type($post_id) !== 'product') {
            return;
        }
        $this->plugin->log("Product saved: $post_id", 'info');
        $this->queue_sync('product', $post_id, 'update');
    }
    
    private function queue_sync($entity_type, $entity_id, $action) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'crm_sync_queue';
        
        $data = array();
        if ($entity_type === 'user') {
            $data = $this->api_client->prepare_customer_data($entity_id);
        }
        
        if (empty($data)) {
            return;
        }
        
        $wpdb->insert(
            $table_name,
            array(
                'entity_type' => $entity_type,
                'entity_id' => $entity_id,
                'action' => $action,
                'data' => json_encode($data),
                'status' => 'pending',
                'created_at' => current_time('mysql')
            ),
            array('%s', '%d', '%s', '%s', '%s', '%s')
        );
    }
    
    public function process_sync_queue() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'crm_sync_queue';
        
        $items = $wpdb->get_results(
            "SELECT * FROM $table_name WHERE status = 'pending' ORDER BY created_at ASC LIMIT 10"
        );
        
        foreach ($items as $item) {
            $data = json_decode($item->data, true);
            $result = $this->api_client->send_customer($data);
            
            $wpdb->update(
                $table_name,
                array(
                    'status' => $result['success'] ? 'completed' : 'failed',
                    'updated_at' => current_time('mysql')
                ),
                array('id' => $item->id)
            );
        }
    }
    
    public function ajax_sync_all_customers() {
        check_ajax_referer('wp_crm_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $users = get_users(array('number' => 100));
        $results = array('success' => 0, 'failed' => 0, 'errors' => array());
        
        foreach ($users as $user) {
            $data = $this->api_client->prepare_customer_data($user->ID);
            if ($data) {
                $result = $this->api_client->send_customer($data);
                if ($result['success']) {
                    $results['success']++;
                } else {
                    $results['failed']++;
                    $results['errors'][] = array('user' => $user->ID, 'error' => $result['error']);
                }
            }
        }
        
        wp_send_json_success($results);
    }
    
    public function ajax_sync_all_products() {
        check_ajax_referer('wp_crm_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        wp_send_json_success(array('success' => 0, 'failed' => 0, 'message' => 'Product sync not implemented'));
    }
    
    public function ajax_sync_all_orders() {
        check_ajax_referer('wp_crm_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        wp_send_json_success(array('success' => 0, 'failed' => 0, 'message' => 'Order sync not implemented'));
    }
}
