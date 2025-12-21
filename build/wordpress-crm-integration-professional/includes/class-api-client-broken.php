<?php
/**
 * کلاس API Client برای ارتباط با CRM
 */

if (!defined('ABSPATH')) {
    exit;
}

class WP_CRM_API_Client {
    
    /**
     * نمونه افزونه اصلی
     */
    private $plugin;
    
    /**
     * سازنده
     */
    public function __construct($plugin) {
        $this->plugin = $plugin;
    }
    
    /**
     * تست اتصال به CRM
     */
    public function test_connection() {
        $crm_url = $this->plugin->get_setting('crm_url');
        $api_key = $this->plugin->get_setting('api_key');
        $tenant_key = $this->plugin->get_setting('tenant_key');
        
        if (empty($crm_url) || empty($api_key)) {
            return array(
                'success' => false,
                'error' => 'تنظیمات CRM کامل نیست'
            );
        }
        
        // اصلاح endpoint برای تست
        $endpoint = rtrim($crm_url, '/') . '/api/integrations/wordpress/test';
        
        $args = array(
            'method' => 'GET',
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-WP-API-Key' => $api_key,
                'User-Agent' => 'WordPress/' . get_bloginfo('version') . ' CRM-Integration/' . WP_CRM_VERSION
            ),
            'timeout' => 30,
            'sslverify' => false
        );
        
        $this->plugin->log('Testing connection to: ' . $endpoint, 'info');
        
        $response = wp_remote_get($endpoint, $args);
        
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            $this->plugin->log('Connection test failed: ' . $error_message, 'error');
            return array(
                'success' => false,
                'error' => 'خطا در اتصال: ' . $error_message
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        $this->plugin->log('Connection test response: ' . $response_code . ' - ' . $response_body, 'info');
        
        if ($response_code !== 200) {
            return array(
                'success' => false,
                'error' => 'کد خطا: ' . $response_code,
                'response' => $response_body
            );
        }
        
        $data = json_decode($response_body, true);
        
        if (!$data || !isset($data['success']) || !$data['success']) {
            return array(
                'success' => false,
                'error' => 'پاسخ نامعتبر از سرور',
                'response' => $response_body
            );
        }
        
        return array(
            'success' => true,
            'message' => 'اتصال موفق',
            'data' => $data['data'] ?? null
        );
    }
        
        $response = wp_remote_post($endpoint, $args);
        
        if (is_wp_error($response)) {
            $this->plugin->log('API request failed: ' . $response->get_error_message(), 'error');
            return array(
                'success' => false,
                'error' => $response->get_error_message()
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($response_code !== 200) {
            $this->plugin->log("API request failed with code: $response_code", 'error', array(
                'response_body' => $response_body
            ));
            return array(
                'success' => false,
                'error' => "HTTP Error: $response_code"
            );
        }
        
        $data = json_decode($response_body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->plugin->log('Invalid JSON response from CRM', 'error', array(
                'response' => $response_body
            ));
            return array(
                'success' => false,
                'error' => 'پاسخ نامعتبر از CRM'
            );
        }
        
        if (isset($data['success']) && $data['success']) {
            $this->plugin->log('Customer data sent successfully', 'info', array(
                'customer_email' => $customer_data['email'] ?? 'unknown'
            ));
        }
        
        return $data;
    }
    
    /**
     * تست اتصال به CRM
     */
    public function test_connection() {
        $crm_url = $this->plugin->get_setting('crm_url');
        $api_key = $this->plugin->get_setting('api_key');
        
        if (empty($crm_url) || empty($api_key)) {
            return array(
                'success' => false,
                'error' => 'لطفاً آدرس CRM و کلید API را وارد کنید'
            );
        }
        
        // تست با endpoint ساده
        $test_endpoints = array(
            rtrim($crm_url, '/') . '/api/integrations/wordpress/test',
            rtrim($crm_url, '/') . '/api/test',
            rtrim($crm_url, '/')
        );
        
        foreach ($test_endpoints as $endpoint) {
            $args = array(
                'method' => 'GET',
                'headers' => array(
                    'X-WP-API-Key' => $api_key,
                    'User-Agent' => 'WordPress/' . get_bloginfo('version') . ' CRM-Integration/' . WP_CRM_VERSION
                ),
                'timeout' => 15,
                'sslverify' => false
            );
            
            $response = wp_remote_get($endpoint, $args);
            
            if (!is_wp_error($response)) {
                $response_code = wp_remote_retrieve_response_code($response);
                
                if ($response_code === 200) {
                    $this->plugin->log('Connection test successful', 'info', array(
                        'endpoint' => $endpoint
                    ));
                    return array(
                        'success' => true,
                        'message' => 'اتصال موفقیت‌آمیز بود',
                        'endpoint' => $endpoint
                    );
                }
            }
        }
        
        $this->plugin->log('Connection test failed for all endpoints', 'error');
        return array(
            'success' => false,
            'error' => 'امکان اتصال به CRM وجود ندارد'
        );
    }
    
    /**
     * آماده‌سازی داده مشتری برای ارسال
     */
    public function prepare_customer_data($user_id) {
        $user = get_user_by('id', $user_id);
        if (!$user) {
            return false;
        }
        
        $customer_data = array(
            'source' => 'wordpress',
            'wordpress_user_id' => $user->ID,
            'email' => $user->user_email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'registration_date' => $user->user_registered,
            'metadata' => array(
                'wordpress_user_login' => $user->user_login,
                'wordpress_display_name' => $user->display_name,
                'site_url' => get_site_url()
            )
        );
        
        // اضافه کردن اطلاعات WooCommerce اگر موجود باشد
        if (class_exists('WooCommerce')) {
            $billing_data = array(
                'phone' => get_user_meta($user_id, 'billing_phone', true),
                'company_name' => get_user_meta($user_id, 'billing_company', true),
                'address' => get_user_meta($user_id, 'billing_address_1', true),
                'city' => get_user_meta($user_id, 'billing_city', true),
                'state' => get_user_meta($user_id, 'billing_state', true),
                'country' => get_user_meta($user_id, 'billing_country', true),
                'postal_code' => get_user_meta($user_id, 'billing_postcode', true)
            );
            
            // فقط فیلدهای پر شده را اضافه کن
            foreach ($billing_data as $key => $value) {
                if (!empty($value)) {
                    $customer_data[$key] = $value;
                }
            }
        }
        
        return $customer_data;
    }
}
    
    /**
     * ارسال داده مشتری به CRM
     */
    public function send_customer($customer_data) {
        $crm_url = $this->plugin->get_setting('crm_url');
        $api_key = $this->plugin->get_setting('api_key');
        
        if (empty($crm_url) || empty($api_key)) {
            return array(
                'success' => false,
                'error' => 'تنظیمات CRM کامل نیست'
            );
        }
        
        $endpoint = rtrim($crm_url, '/') . '/api/integrations/wordpress/customers';
        
        $args = array(
            'method' => 'POST',
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-WP-API-Key' => $api_key,
                'User-Agent' => 'WordPress/' . get_bloginfo('version') . ' CRM-Integration/' . WP_CRM_VERSION
            ),
            'body' => json_encode($customer_data),
            'timeout' => 30,
            'sslverify' => false
        );
        
        $this->plugin->log('Sending customer data to: ' . $endpoint, 'info');
        
        $response = wp_remote_post($endpoint, $args);
        
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            $this->plugin->log('Customer sync failed: ' . $error_message, 'error');
            return array(
                'success' => false,
                'error' => 'خطا در ارسال: ' . $error_message
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($response_code !== 200) {
            $this->plugin->log('Customer sync failed with code: ' . $response_code, 'error');
            return array(
                'success' => false,
                'error' => 'کد خطا: ' . $response_code,
                'response' => $response_body
            );
        }
        
        $data = json_decode($response_body, true);
        
        if (!$data || !isset($data['success']) || !$data['success']) {
            return array(
                'success' => false,
                'error' => 'پاسخ نامعتبر از سرور',
                'response' => $response_body
            );
        }
        
        $this->plugin->log('Customer synced successfully: ' . $customer_data['email'], 'info');
        
        return array(
            'success' => true,
            'data' => $data['data'] ?? null
        );
    }
    
    /**
     * ارسال داده محصول به CRM
     */
    public function send_product($product_data) {
        $crm_url = $this->plugin->get_setting('crm_url');
        $api_key = $this->plugin->get_setting('api_key');
        
        if (empty($crm_url) || empty($api_key)) {
            return array(
                'success' => false,
                'error' => 'تنظیمات CRM کامل نیست'
            );
        }
        
        $endpoint = rtrim($crm_url, '/') . '/api/integrations/wordpress/products';
        
        $args = array(
            'method' => 'POST',
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-WP-API-Key' => $api_key,
                'User-Agent' => 'WordPress/' . get_bloginfo('version') . ' CRM-Integration/' . WP_CRM_VERSION
            ),
            'body' => json_encode($product_data),
            'timeout' => 30,
            'sslverify' => false
        );
        
        $this->plugin->log('Sending product data to: ' . $endpoint, 'info');
        
        $response = wp_remote_post($endpoint, $args);
        
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            $this->plugin->log('Product sync failed: ' . $error_message, 'error');
            return array(
                'success' => false,
                'error' => 'خطا در ارسال: ' . $error_message
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($response_code !== 200) {
            $this->plugin->log('Product sync failed with code: ' . $response_code, 'error');
            return array(
                'success' => false,
                'error' => 'کد خطا: ' . $response_code,
                'response' => $response_body
            );
        }
        
        $data = json_decode($response_body, true);
        
        if (!$data || !isset($data['success']) || !$data['success']) {
            return array(
                'success' => false,
                'error' => 'پاسخ نامعتبر از سرور',
                'response' => $response_body
            );
        }
        
        $this->plugin->log('Product synced successfully: ' . $product_data['name'], 'info');
        
        return array(
            'success' => true,
            'data' => $data['data'] ?? null
        );
    }
    
    /**
     * ارسال داده سفارش به CRM
     */
    public function send_order($order_data) {
        $crm_url = $this->plugin->get_setting('crm_url');
        $api_key = $this->plugin->get_setting('api_key');
        
        if (empty($crm_url) || empty($api_key)) {
            return array(
                'success' => false,
                'error' => 'تنظیمات CRM کامل نیست'
            );
        }
        
        $endpoint = rtrim($crm_url, '/') . '/api/integrations/wordpress/orders';
        
        $args = array(
            'method' => 'POST',
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-WP-API-Key' => $api_key,
                'User-Agent' => 'WordPress/' . get_bloginfo('version') . ' CRM-Integration/' . WP_CRM_VERSION
            ),
            'body' => json_encode($order_data),
            'timeout' => 30,
            'sslverify' => false
        );
        
        $this->plugin->log('Sending order data to: ' . $endpoint, 'info');
        
        $response = wp_remote_post($endpoint, $args);
        
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            $this->plugin->log('Order sync failed: ' . $error_message, 'error');
            return array(
                'success' => false,
                'error' => 'خطا در ارسال: ' . $error_message
            );
        }
        
        $response_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        if ($response_code !== 200) {
            $this->plugin->log('Order sync failed with code: ' . $response_code, 'error');
            return array(
                'success' => false,
                'error' => 'کد خطا: ' . $response_code,
                'response' => $response_body
            );
        }
        
        $data = json_decode($response_body, true);
        
        if (!$data || !isset($data['success']) || !$data['success']) {
            return array(
                'success' => false,
                'error' => 'پاسخ نامعتبر از سرور',
                'response' => $response_body
            );
        }
        
        $this->plugin->log('Order synced successfully: ' . $order_data['order_id'], 'info');
        
        return array(
            'success' => true,
            'data' => $data['data'] ?? null
        );
    }
    
    /**
     * همگام‌سازی دسته‌ای مشتریان
     */
    public function bulk_sync_customers($customers) {
        $results = array(
            'success' => 0,
            'failed' => 0,
            'errors' => array()
        );
        
        foreach ($customers as $customer) {
            $result = $this->send_customer($customer);
            
            if ($result['success']) {
                $results['success']++;
            } else {
                $results['failed']++;
                $results['errors'][] = array(
                    'customer' => $customer['email'] ?? 'Unknown',
                    'error' => $result['error']
                );
            }
            
            // کمی استراحت بین درخواست‌ها
            usleep(100000); // 0.1 second
        }
        
        return $results;
    }
    
    /**
     * همگام‌سازی دسته‌ای محصولات
     */
    public function bulk_sync_products($products) {
        $results = array(
            'success' => 0,
            'failed' => 0,
            'errors' => array()
        );
        
        foreach ($products as $product) {
            $result = $this->send_product($product);
            
            if ($result['success']) {
                $results['success']++;
            } else {
                $results['failed']++;
                $results['errors'][] = array(
                    'product' => $product['name'] ?? 'Unknown',
                    'error' => $result['error']
                );
            }
            
            // کمی استراحت بین درخواست‌ها
            usleep(100000); // 0.1 second
        }
        
        return $results;
    }
}