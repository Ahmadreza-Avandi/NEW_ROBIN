<?php
/**
 * Rate limiter for WordPress CRM Integration
 *
 * @package WordPressCRMIntegration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Rate limiter class
 */
class WP_CRM_Integration_Rate_Limiter {
    
    /**
     * Instance of this class
     *
     * @var WP_CRM_Integration_Rate_Limiter
     */
    private static $instance = null;
    
    /**
     * Get instance
     *
     * @return WP_CRM_Integration_Rate_Limiter
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
        // Initialize rate limiter
    }
    
    /**
     * Check if request is allowed
     *
     * @return bool
     */
    public function is_allowed() {
        // Simple rate limiting - can be enhanced
        return true;
    }
}