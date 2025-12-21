<?php
/**
 * Event handlers for WordPress CRM Integration
 *
 * @package WordPressCRMIntegration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Event handlers class
 */
class WP_CRM_Integration_Event_Handlers {
    
    /**
     * Instance of this class
     *
     * @var WP_CRM_Integration_Event_Handlers
     */
    private static $instance = null;
    
    /**
     * Config instance
     *
     * @var WP_CRM_Integration_Config
     */
    private $config;
    
    /**
     * Logger instance
     *
     * @var WP_CRM_Integration_Logger
     */
    private $logger;
    
    /**
     * Get instance
     *
     * @return WP_CRM_Integration_Event_Handlers
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->config = WP_CRM_Integration_Config::get_instance();
        $this->logger = WP_CRM_Integration_Logger::get_instance();
        
        $this->init_hooks();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // User registration
        add_action('user_register', array($this, 'handle_user_registration'));
        
        // User profile update
        add_action('profile_update', array($this, 'handle_user_update'));
        
        // WooCommerce hooks (if WooCommerce is active)
        if (class_exists('WooCommerce')) {
            add_action('woocommerce_new_order', array($this, 'handle_new_order'));
            add_action('woocommerce_order_status_changed', array($this, 'handle_order_status_change'));
        }
    }
    
    /**
     * Handle user registration
     *
     * @param int $user_id
     */
    public function handle_user_registration($user_id) {
        if (!$this->is_sync_enabled('customers')) {
            return;
        }
        
        $user = get_user_by('id', $user_id);
        if (!$user) {
            return;
        }
        
        $customer_data = $this->prepare_customer_data($user);
        $this->queue_sync('customer', $user_id, 'create', $customer_data);
        
        $this->logger->info('User registration queued for sync', array(
            'user_id' => $user_id,
            'email' => $user->user_email
        ));
    }
    
    /**
     * Handle user update
     *
     * @param int $user_id
     */
    public function handle_user_update($user_id) {
        if (!$this->is_sync_enabled('customers')) {
            return;
        }
        
        $user = get_user_by('id', $user_id);
        if (!$user) {
            return;
        }
        
        $customer_data = $this->prepare_customer_data($user);
        $this->queue_sync('customer', $user_id, 'update', $customer_data);
        
        $this->logger->info('User update queued for sync', array(
            'user_id' => $user_id,
            'email' => $user->user_email
        ));
    }
    
    /**
     * Handle new WooCommerce order
     *
     * @param int $order_id
     */
    public function handle_new_order($order_id) {
        if (!$this->is_sync_enabled('orders')) {
            return;
        }
        
        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }
        
        $order_data = $this->prepare_order_data($order);
        $this->queue_sync('order', $order_id, 'create', $order_data);
        
        $this->logger->info('Order queued for sync', array(
            'order_id' => $order_id,
            'customer_email' => $order->get_billing_email()
        ));
    }
    
    /**
     * Handle WooCommerce order status change
     *
     * @param int $order_id
     */
    public function handle_order_status_change($order_id) {
        if (!$this->is_sync_enabled('orders')) {
            return;
        }
        
        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }
        
        $order_data = $this->prepare_order_data($order);
        $this->queue_sync('order', $order_id, 'update', $order_data);
        
        $this->logger->info('Order status change queued for sync', array(
            'order_id' => $order_id,
            'status' => $order->get_status()
        ));
    }
    
    /**
     * Check if sync is enabled for entity type
     *
     * @param string $entity_type
     * @return bool
     */
    private function is_sync_enabled($entity_type) {
        $sync_settings = $this->config->get('sync_enabled', array());
        return isset($sync_settings[$entity_type]) && $sync_settings[$entity_type];
    }
    
    /**
     * Prepare customer data for CRM
     *
     * @param WP_User $user
     * @return array
     */
    private function prepare_customer_data($user) {
        return array(
            'source' => 'wordpress',
            'wordpress_user_id' => $user->ID,
            'email' => $user->user_email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'registration_date' => $user->user_registered,
            'metadata' => array(
                'wordpress_user_login' => $user->user_login,
                'wordpress_display_name' => $user->display_name
            )
        );
    }
    
    /**
     * Prepare order data for CRM
     *
     * @param WC_Order $order
     * @return array
     */
    private function prepare_order_data($order) {
        return array(
            'source' => 'woocommerce',
            'order_id' => $order->get_id(),
            'customer_email' => $order->get_billing_email(),
            'total' => $order->get_total(),
            'status' => $order->get_status(),
            'date_created' => $order->get_date_created()->format('Y-m-d H:i:s'),
            'billing' => array(
                'first_name' => $order->get_billing_first_name(),
                'last_name' => $order->get_billing_last_name(),
                'company' => $order->get_billing_company(),
                'address_1' => $order->get_billing_address_1(),
                'address_2' => $order->get_billing_address_2(),
                'city' => $order->get_billing_city(),
                'state' => $order->get_billing_state(),
                'postcode' => $order->get_billing_postcode(),
                'country' => $order->get_billing_country(),
                'phone' => $order->get_billing_phone()
            )
        );
    }
    
    /**
     * Queue sync operation
     *
     * @param string $entity_type
     * @param int $entity_id
     * @param string $action
     * @param array $data
     */
    private function queue_sync($entity_type, $entity_id, $action, $data) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crm_integration_queue';
        
        $wpdb->insert(
            $table_name,
            array(
                'entity_type' => $entity_type,
                'entity_id' => $entity_id,
                'action' => $action,
                'data' => json_encode($data),
                'status' => 'pending',
                'priority' => 5,
                'created_at' => current_time('mysql'),
                'scheduled_at' => current_time('mysql')
            ),
            array('%s', '%d', '%s', '%s', '%s', '%d', '%s', '%s')
        );
    }
}