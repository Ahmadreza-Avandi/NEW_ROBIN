<?php
/**
 * Performance optimizer for WordPress CRM Integration
 *
 * @package WordPressCRMIntegration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Performance optimizer class
 */
class WP_CRM_Integration_Performance_Optimizer {
    
    /**
     * Instance of this class
     *
     * @var WP_CRM_Integration_Performance_Optimizer
     */
    private static $instance = null;
    
    /**
     * Get instance
     *
     * @return WP_CRM_Integration_Performance_Optimizer
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
        add_action('wp_crm_integration_performance_cleanup', array($this, 'cleanup_old_logs'));
    }
    
    /**
     * Cleanup old logs
     */
    public function cleanup_old_logs() {
        global $wpdb;
        
        $log_table = $wpdb->prefix . 'crm_integration_log';
        $queue_table = $wpdb->prefix . 'crm_integration_queue';
        
        // Delete logs older than 30 days
        $wpdb->query(
            "DELETE FROM $log_table WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)"
        );
        
        // Delete completed queue items older than 7 days
        $wpdb->query(
            "DELETE FROM $queue_table WHERE status = 'completed' AND updated_at < DATE_SUB(NOW(), INTERVAL 7 DAY)"
        );
    }
}