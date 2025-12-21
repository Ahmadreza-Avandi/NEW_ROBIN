<?php
/**
 * Migration system for WordPress CRM Integration
 *
 * @package WordPressCRMIntegration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Migration class
 */
class WP_CRM_Integration_Migration {
    
    /**
     * Instance of this class
     *
     * @var WP_CRM_Integration_Migration
     */
    private static $instance = null;
    
    /**
     * Current plugin version
     *
     * @var string
     */
    private $current_version;
    
    /**
     * Installed version
     *
     * @var string
     */
    private $installed_version;
    
    /**
     * Get instance
     *
     * @return WP_CRM_Integration_Migration
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
        $this->current_version = WP_CRM_INTEGRATION_VERSION;
        $this->installed_version = get_option('wp_crm_integration_version', '0.0.0');
        
        $this->maybe_migrate();
    }
    
    /**
     * Check if migration is needed
     */
    private function maybe_migrate() {
        if (version_compare($this->installed_version, $this->current_version, '<')) {
            $this->run_migrations();
            update_option('wp_crm_integration_version', $this->current_version);
        }
    }
    
    /**
     * Run migrations
     */
    private function run_migrations() {
        // Migration from 0.0.0 to 1.0.0
        if (version_compare($this->installed_version, '1.0.0', '<')) {
            $this->migrate_to_1_0_0();
        }
    }
    
    /**
     * Migrate to version 1.0.0
     */
    private function migrate_to_1_0_0() {
        // Initial setup - nothing to migrate
        wp_crm_integration_debug_log('Migration to 1.0.0 completed');
    }
}