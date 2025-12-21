<?php
/**
 * API Client for WordPress CRM Integration
 *
 * @package WordPressCRMIntegration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * API Client class
 */
class WP_CRM_Integration_API_Client {
    
    /**
     * Instance of this class
     *
     * @var WP_CRM_Integration_API_Client
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
     * @return WP_CRM_Integration_API_Client
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
    }
    
    /**
     * Send customer data to CRM
     *
     * @param array $customer_data
     * @return array
     */
    public function send_customer($customer_data) {
        $crm_url = $this->config->get('crm_url');
        $api_key = $this->config->get('api_key');
        
        if (empty($crm_url) || empty($api_key)) {
            return array(
                'success' => false,
                'error' => 'CRM URL or API key not configured'
            );
        }
        
        $endpoint = rtrim($crm_url, '/') . '/api/integrations/wordpress/customers';
        
        $response = wp_remote_post($endpoint, array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-WP-API-Key' => $api_key,
                'User-Agent' => 'WordPress/' . get_bloginfo('version') . ' CRM-Integration/' . WP_CRM_INTEGRATION_VERSION
            ),
            'body' => json_encode($customer_data),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            $this->logger->error('API request failed', array(
                'error' => $response->get_error_message(),
                'endpoint' => $endpoint
            ));
            
            return array(
                'success' => false,
                'error' => $response->get_error_message()
            );
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->logger->error('Invalid JSON response', array(
                'response' => $body,
                'endpoint' => $endpoint
            ));
            
            return array(
                'success' => false,
                'error' => 'Invalid JSON response from CRM'
            );
        }
        
        return $data;
    }
    
    /**
     * Test connection to CRM
     *
     * @return array
     */
    public function test_connection() {
        $crm_url = $this->config->get('crm_url');
        $api_key = $this->config->get('api_key');
        
        if (empty($crm_url) || empty($api_key)) {
            return array(
                'success' => false,
                'error' => 'CRM URL or API key not configured'
            );
        }
        
        $endpoint = rtrim($crm_url, '/') . '/api/integrations/wordpress/test';
        
        $response = wp_remote_get($endpoint, array(
            'headers' => array(
                'X-WP-API-Key' => $api_key,
                'User-Agent' => 'WordPress/' . get_bloginfo('version') . ' CRM-Integration/' . WP_CRM_INTEGRATION_VERSION
            ),
            'timeout' => 15
        ));
        
        if (is_wp_error($response)) {
            return array(
                'success' => false,
                'error' => $response->get_error_message()
            );
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code === 200) {
            return array(
                'success' => true,
                'message' => 'Connection successful'
            );
        }
        
        return array(
            'success' => false,
            'error' => 'Connection failed with status code: ' . $code
        );
    }
}