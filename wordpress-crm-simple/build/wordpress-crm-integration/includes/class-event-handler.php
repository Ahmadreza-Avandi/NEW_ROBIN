<?php
/**
 * کلاس Event Handler برای مدیریت رویدادها
 */

if (!defined('ABSPATH')) {
    exit;
}

class WP_CRM_Event_Handler {
    
    /**
     * نمونه افزونه اصلی
     */
    private $plugin;
    
    /**
     * API Client
     */
    private $api_client;
    
    /**
     * سازنده
     */
    public function __construct($plugin) {
        $this->plugin = $plugin;
        $this->api_client = new WP_CRM_API_Client($plugin);
        $this->init();
    }
    
    /**
     * راه‌اندازی
     */
    private function init() {
        // هوک‌های کاربران
        if ($this->plugin->get_setting('sync_users')) {
            add_action('user_register', array($this, 'handle_user_register'));
            add_action('profile_update', array($this, 'handle_user_update'));
        }
        
        // هوک‌های WooCommerce
        if ($this->plugin->get_setting('sync_woocommerce') && class_exists('WooCommerce')) {
            add_action('woocommerce_new_order', array($this, 'handle_new_order'));
            add_action('woocommerce_order_status_changed', array($this, 'handle_order_status_change'));
            add_action('woocommerce_customer_save_address', array($this, 'handle_customer_address_update'));
        }
        
        // پردازش صف
        add_action('wp_crm_process_queue', array($this, 'process_sync_queue'));
        
        // زمان‌بندی پردازش صف
        if (!wp_next_scheduled('wp_crm_process_queue')) {
            wp_schedule_event(time(), 'hourly', 'wp_crm_process_queue');
        }
    }
    
    /**
     * مدیریت ثبت‌نام کاربر جدید
     */
    public function handle_user_register($user_id) {
        $this->plugin->log("New user registered: $user_id", 'info');
        $this->queue_user_sync($user_id, 'create');
    }
    
    /**
     * مدیریت به‌روزرسانی کاربر
     */
    public function handle_user_update($user_id) {
        $this->plugin->log("User updated: $user_id", 'info');
        $this->queue_user_sync($user_id, 'update');
    }
    
    /**
     * مدیریت سفارش جدید WooCommerce
     */
    public function handle_new_order($order_id) {
        $this->plugin->log("New WooCommerce order: $order_id", 'info');
        
        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }
        
        // همگام‌سازی مشتری اگر کاربر ثبت‌نام شده باشد
        $user_id = $order->get_user_id();
        if ($user_id) {
            $this->queue_user_sync($user_id, 'update');
        } else {
            // ایجاد مشتری مهمان
            $this->queue_guest_customer_sync($order);
        }
    }
    
    /**
     * مدیریت تغییر وضعیت سفارش
     */
    public function handle_order_status_change($order_id) {
        $this->plugin->log("Order status changed: $order_id", 'info');
        $this->handle_new_order($order_id); // همان پردازش
    }
    
    /**
     * مدیریت به‌روزرسانی آدرس مشتری
     */
    public function handle_customer_address_update($user_id) {
        $this->plugin->log("Customer address updated: $user_id", 'info');
        $this->queue_user_sync($user_id, 'update');
    }
    
    /**
     * اضافه کردن کاربر به صف همگام‌سازی
     */
    private function queue_user_sync($user_id, $action = 'create') {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crm_sync_queue';
        
        // بررسی اینکه آیا این کاربر قبلاً در صف است یا نه
        $existing = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table_name WHERE entity_type = 'user' AND entity_id = %d AND status = 'pending'",
            $user_id
        ));
        
        if ($existing) {
            $this->plugin->log("User $user_id already in sync queue", 'debug');
            return;
        }
        
        $customer_data = $this->api_client->prepare_customer_data($user_id);
        if (!$customer_data) {
            $this->plugin->log("Failed to prepare customer data for user $user_id", 'error');
            return;
        }
        
        $wpdb->insert(
            $table_name,
            array(
                'entity_type' => 'user',
                'entity_id' => $user_id,
                'action' => $action,
                'data' => json_encode($customer_data),
                'status' => 'pending',
                'created_at' => current_time('mysql')
            ),
            array('%s', '%d', '%s', '%s', '%s', '%s')
        );
        
        $this->plugin->log("User $user_id queued for sync", 'info');
    }
    
    /**
     * اضافه کردن مشتری مهمان به صف
     */
    private function queue_guest_customer_sync($order) {
        global $wpdb;
        
        $customer_data = array(
            'source' => 'woocommerce_guest',
            'email' => $order->get_billing_email(),
            'first_name' => $order->get_billing_first_name(),
            'last_name' => $order->get_billing_last_name(),
            'phone' => $order->get_billing_phone(),
            'company_name' => $order->get_billing_company(),
            'address' => $order->get_billing_address_1(),
            'city' => $order->get_billing_city(),
            'state' => $order->get_billing_state(),
            'country' => $order->get_billing_country(),
            'postal_code' => $order->get_billing_postcode(),
            'registration_date' => $order->get_date_created()->format('Y-m-d H:i:s'),
            'metadata' => array(
                'order_id' => $order->get_id(),
                'guest_customer' => true,
                'site_url' => get_site_url()
            )
        );
        
        $table_name = $wpdb->prefix . 'crm_sync_queue';
        
        $wpdb->insert(
            $table_name,
            array(
                'entity_type' => 'guest_customer',
                'entity_id' => $order->get_id(),
                'action' => 'create',
                'data' => json_encode($customer_data),
                'status' => 'pending',
                'created_at' => current_time('mysql')
            ),
            array('%s', '%d', '%s', '%s', '%s', '%s')
        );
        
        $this->plugin->log("Guest customer queued for sync (Order: {$order->get_id()})", 'info');
    }
    
    /**
     * پردازش صف همگام‌سازی
     */
    public function process_sync_queue() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crm_sync_queue';
        
        // دریافت آیتم‌های pending
        $items = $wpdb->get_results(
            "SELECT * FROM $table_name 
             WHERE status = 'pending' 
             ORDER BY created_at ASC 
             LIMIT 10"
        );
        
        if (empty($items)) {
            return;
        }
        
        $this->plugin->log("Processing " . count($items) . " items from sync queue", 'info');
        
        foreach ($items as $item) {
            $this->process_sync_item($item);
        }
    }
    
    /**
     * پردازش یک آیتم از صف
     */
    private function process_sync_item($item) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crm_sync_queue';
        
        // تغییر وضعیت به processing
        $wpdb->update(
            $table_name,
            array('status' => 'processing'),
            array('id' => $item->id),
            array('%s'),
            array('%d')
        );
        
        $customer_data = json_decode($item->data, true);
        if (!$customer_data) {
            $this->plugin->log("Invalid data for queue item {$item->id}", 'error');
            $this->mark_item_failed($item->id, 'Invalid data format');
            return;
        }
        
        // ارسال به CRM
        $result = $this->api_client->send_customer($customer_data);
        
        if ($result['success']) {
            // موفقیت‌آمیز
            $wpdb->update(
                $table_name,
                array(
                    'status' => 'completed',
                    'updated_at' => current_time('mysql')
                ),
                array('id' => $item->id),
                array('%s', '%s'),
                array('%d')
            );
            
            $this->plugin->log("Successfully synced queue item {$item->id}", 'info');
        } else {
            // خطا
            $this->mark_item_failed($item->id, $result['error']);
        }
    }
    
    /**
     * علامت‌گذاری آیتم به عنوان ناموفق
     */
    private function mark_item_failed($item_id, $error_message) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crm_sync_queue';
        
        $wpdb->update(
            $table_name,
            array(
                'status' => 'failed',
                'attempts' => $wpdb->get_var($wpdb->prepare("SELECT attempts FROM $table_name WHERE id = %d", $item_id)) + 1,
                'error_message' => $error_message,
                'updated_at' => current_time('mysql')
            ),
            array('id' => $item_id),
            array('%s', '%d', '%s', '%s'),
            array('%d')
        );
        
        $this->plugin->log("Queue item $item_id failed: $error_message", 'error');
    }
    
    /**
     * همگام‌سازی فوری کاربر
     */
    public function sync_user_immediately($user_id) {
        $customer_data = $this->api_client->prepare_customer_data($user_id);
        if (!$customer_data) {
            return array('success' => false, 'error' => 'کاربر یافت نشد');
        }
        
        return $this->api_client->send_customer($customer_data);
    }
}