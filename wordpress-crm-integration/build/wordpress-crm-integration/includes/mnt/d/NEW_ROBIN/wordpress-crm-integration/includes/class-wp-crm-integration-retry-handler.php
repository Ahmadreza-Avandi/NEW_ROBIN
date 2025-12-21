<?php
/**
 * Retry handler for WordPress CRM Integration
 *
 * @package WordPressCRMIntegration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Retry handler class
 */
class WP_CRM_Integration_Retry_Handler {
    
    /**
     * Instance of this class
     *
     * @var WP_CRM_Integration_Retry_Handler
     */
    private static $instance = null;
    
    /**
     * Get instance
     *
     * @return WP_CRM_Integration_Retry_Handler
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
        // Initialize retry handler
    }
    
    /**
     * Calculate retry delay
     *
     * @param int $attempt
     * @return int
     */
    public function calculate_delay($attempt) {
        $base_delay = 5; // 5 seconds
        $max_delay = 300; // 5 minutes
        $multiplier = 2;
        
        $delay = $base_delay * pow($multiplier, $attempt - 1);
        return min($delay, $max_delay);
    }
    
    /**
     * Should retry
     *
     * @param int $attempts
     * @param int $max_attempts
     * @return bool
     */
    public function should_retry($attempts, $max_attempts = 3) {
        return $attempts < $max_attempts;
    }
}