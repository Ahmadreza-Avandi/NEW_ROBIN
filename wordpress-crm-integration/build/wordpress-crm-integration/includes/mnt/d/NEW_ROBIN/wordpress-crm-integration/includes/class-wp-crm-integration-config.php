<?php
/**
 * Configuration management for WordPress CRM Integration
 *
 * @package WordPressCRMIntegration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Configuration class
 */
class WP_CRM_Integration_Config {
    
    /**
     * Instance of this class
     *
     * @var WP_CRM_Integration_Config
     */
    private static $instance = null;
    
    /**
     * Settings cache
     *
     * @var array
     */
    private $settings = null;
    
    /**
     * Get instance
     *
     * @return WP_CRM_Integration_Config
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
        // Load settings on demand
    }
    
    /**
     * Get all settings
     *
     * @return array
     */
    public function get_settings() {
        if (null === $this->settings) {
            $this->settings = get_option('wp_crm_integration_settings', array());
        }
        return $this->settings;
    }
    
    /**
     * Get specific setting
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public function get($key, $default = null) {
        $settings = $this->get_settings();
        return isset($settings[$key]) ? $settings[$key] : $default;
    }
    
    /**
     * Set setting
     *
     * @param string $key
     * @param mixed $value
     * @return bool
     */
    public function set($key, $value) {
        $settings = $this->get_settings();
        $settings[$key] = $value;
        $this->settings = $settings;
        return update_option('wp_crm_integration_settings', $settings);
    }
    
    /**
     * Update multiple settings
     *
     * @param array $new_settings
     * @return bool
     */
    public function update_settings($new_settings) {
        $settings = $this->get_settings();
        $settings = array_merge($settings, $new_settings);
        $this->settings = $settings;
        return update_option('wp_crm_integration_settings', $settings);
    }
}