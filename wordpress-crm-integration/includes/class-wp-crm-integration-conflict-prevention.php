<?php
/**
 * Conflict prevention for WordPress CRM Integration
 *
 * @package WordPressCRMIntegration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Conflict prevention class
 */
class WP_CRM_Integration_Conflict_Prevention {
    
    /**
     * Instance of this class
     *
     * @var WP_CRM_Integration_Conflict_Prevention
     */
    private static $instance = null;
    
    /**
     * Detected conflicts
     *
     * @var array
     */
    private $conflicts = array();
    
    /**
     * Get instance
     *
     * @return WP_CRM_Integration_Conflict_Prevention
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
        $this->check_conflicts();
    }
    
    /**
     * Check for conflicts
     */
    private function check_conflicts() {
        // Check for conflicting plugins
        $conflicting_plugins = array(
            'another-crm-plugin/another-crm-plugin.php' => array(
                'name' => 'Another CRM Plugin',
                'severity' => 'medium'
            )
        );
        
        foreach ($conflicting_plugins as $plugin_file => $plugin_info) {
            if (is_plugin_active($plugin_file)) {
                $this->conflicts[] = array(
                    'type' => 'plugin',
                    'severity' => $plugin_info['severity'],
                    'message' => sprintf(
                        __('Conflicting plugin detected: %s', 'wordpress-crm-integration'),
                        $plugin_info['name']
                    )
                );
            }
        }
        
        // Check for function conflicts
        $conflicting_functions = array(
            'wp_crm_sync_customer',
            'crm_integration_process'
        );
        
        foreach ($conflicting_functions as $function_name) {
            if (function_exists($function_name)) {
                $this->conflicts[] = array(
                    'type' => 'function',
                    'severity' => 'high',
                    'message' => sprintf(
                        __('Function conflict detected: %s already exists', 'wordpress-crm-integration'),
                        $function_name
                    )
                );
            }
        }
    }
    
    /**
     * Check if there are critical conflicts
     *
     * @return bool
     */
    public function has_critical_conflicts() {
        foreach ($this->conflicts as $conflict) {
            if ($conflict['severity'] === 'high') {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get conflicts by severity
     *
     * @param string $severity
     * @return array
     */
    public function get_conflicts($severity = '') {
        if (empty($severity)) {
            return $this->conflicts;
        }
        
        return array_filter($this->conflicts, function($conflict) use ($severity) {
            return $conflict['severity'] === $severity;
        });
    }
}