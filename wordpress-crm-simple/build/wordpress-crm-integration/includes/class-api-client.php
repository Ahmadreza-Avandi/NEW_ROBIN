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
            'sslverify' => false // برای تست محلی
        );
        
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