<?php
/**
 * Plugin Name: WordPress CRM Integration
 * Plugin URI: https://github.com/your-repo/wordpress-crm-integration
 * Description: Seamlessly sync WordPress customer data, orders, and products with your CRM system. Supports WooCommerce integration with flexible field mapping and robust error handling.
 * Version: 1.0.0
 * Author: Your Company
 * Author URI: https://yourcompany.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wordpress-crm-integration
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
 *
 * @package WordPressCRMIntegration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Enable debug mode if WP_DEBUG is enabled
if (!defined('WP_CRM_INTEGRATION_DEBUG')) {
    define('WP_CRM_INTEGRATION_DEBUG', defined('WP_DEBUG') && WP_DEBUG);
}

// Debug logging function
if (!function_exists('wp_crm_integration_debug_log')) {
    function wp_crm_integration_debug_log($message, $data = null) {
        if (!WP_CRM_INTEGRATION_DEBUG) {
            return;
        }
        
        $log_message = '[WP CRM Integration] ' . $message;
        if ($data !== null) {
            $log_message .= ' | Data: ' . print_r($data, true);
        }
        
        error_log($log_message);
    }
}

// Error handler for plugin activation
if (!function_exists('wp_crm_integration_activation_error_handler')) {
    function wp_crm_integration_activation_error_handler($errno, $errstr, $errfile, $errline) {
        $error_message = "Plugin Activation Error: [$errno] $errstr in $errfile on line $errline";
        wp_crm_integration_debug_log($error_message);
        
        // Store error for display
        if (!isset($GLOBALS['wp_crm_integration_activation_errors'])) {
            $GLOBALS['wp_crm_integration_activation_errors'] = array();
        }
        $GLOBALS['wp_crm_integration_activation_errors'][] = $error_message;
        
        return false; // Let WordPress handle the error too
    }
}

// Define plugin constants
define('WP_CRM_INTEGRATION_VERSION', '1.0.0');
define('WP_CRM_INTEGRATION_PLUGIN_FILE', __FILE__);
define('WP_CRM_INTEGRATION_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WP_CRM_INTEGRATION_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WP_CRM_INTEGRATION_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main plugin class
 */
class WordPressCRMIntegration {
    
    /**
     * Plugin instance
     *
     * @var WordPressCRMIntegration
     */
    private static $instance = null;
    
    /**
     * Get plugin instance
     *
     * @return WordPressCRMIntegration
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
        $this->init_hooks();
        
        // Load dependencies first, then initialize if successful
        if ($this->load_dependencies()) {
            // Dependencies loaded successfully, continue with initialization
            wp_crm_integration_debug_log('Dependencies loaded successfully, continuing initialization');
        } else {
            // Dependencies failed to load, stop here
            wp_crm_integration_debug_log('Dependencies failed to load, stopping initialization');
            return;
        }
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        add_action('plugins_loaded', array($this, 'init'));
        add_action('init', array($this, 'load_textdomain'));
    }
    
    /**
     * Load plugin dependencies
     */
    private function load_dependencies() {
        wp_crm_integration_debug_log('Loading plugin dependencies...');
        
        try {
            // Set error handler for dependency loading
            set_error_handler('wp_crm_integration_activation_error_handler');
            
            $required_files = array(
                'includes/class-wp-crm-integration-compatibility.php',
                'includes/class-wp-crm-integration-conflict-prevention.php',
                'includes/class-wp-crm-integration-migration.php',
                'includes/class-wp-crm-integration-config.php',
                'includes/class-wp-crm-integration-logger.php',
                'includes/class-wp-crm-integration-retry-handler.php',
                'includes/class-wp-crm-integration-admin.php',
                'includes/class-wp-crm-integration-api-client.php',
                'includes/class-wp-crm-integration-event-handlers.php',
                'includes/class-wp-crm-integration-field-mapper.php',
                'includes/class-wp-crm-integration-queue-manager.php',
                'includes/class-wp-crm-integration-batch-processor.php',
                'includes/class-wp-crm-integration-rate-limiter.php',
                'includes/class-wp-crm-integration-performance-optimizer.php'
            );
            
            foreach ($required_files as $file) {
                $file_path = WP_CRM_INTEGRATION_PLUGIN_DIR . $file;
                
                if (!file_exists($file_path)) {
                    wp_crm_integration_debug_log("Required file missing: $file");
                    throw new Exception("Required file missing: $file");
                }
                
                wp_crm_integration_debug_log("Loading file: $file");
                require_once $file_path;
            }
            
            wp_crm_integration_debug_log('All dependencies loaded successfully');
            
        } catch (Exception $e) {
            wp_crm_integration_debug_log('Error loading dependencies: ' . $e->getMessage());
            
            // Show admin notice about the error
            add_action('admin_notices', function() use ($e) {
                echo '<div class="notice notice-error"><p>';
                echo '<strong>WordPress CRM Integration Error:</strong> ';
                echo esc_html($e->getMessage());
                echo '</p></div>';
            });
            
            return false;
        } finally {
            // Restore error handler
            restore_error_handler();
        }
        
        return true;
    }
    
    /**
     * Initialize plugin
     */
    public function init() {
        wp_crm_integration_debug_log('Initializing plugin...');
        
        try {
            // Initialize compatibility layer first
            if (class_exists('WP_CRM_Integration_Compatibility')) {
                $compatibility = WP_CRM_Integration_Compatibility::get_instance();
                wp_crm_integration_debug_log('Compatibility layer initialized');
            } else {
                wp_crm_integration_debug_log('Compatibility class not found');
                return;
            }
                wp_crm_integration_debug_log('Compatibility class not found');
                return;
            }
            
            // Initialize conflict prevention
            if (class_exists('WP_CRM_Integration_Conflict_Prevention')) {
                $conflict_prevention = WP_CRM_Integration_Conflict_Prevention::get_instance();
                wp_crm_integration_debug_log('Conflict prevention initialized');
            } else {
                wp_crm_integration_debug_log('Conflict prevention class not found');
            }
            
            // Initialize migration system
            if (class_exists('WP_CRM_Integration_Migration')) {
                $migration = WP_CRM_Integration_Migration::get_instance();
                wp_crm_integration_debug_log('Migration system initialized');
            } else {
                wp_crm_integration_debug_log('Migration class not found');
            }
            
            // Check if plugin can run safely
            if (isset($compatibility) && !$compatibility->can_run_safely()) {
                wp_crm_integration_debug_log('Plugin compatibility issues detected');
                
                // Log compatibility issues but don't prevent loading
                if (class_exists('WP_CRM_Integration_Logger')) {
                    $logger = WP_CRM_Integration_Logger::get_instance();
                    $logger->error('Plugin compatibility issues detected', array(
                        'errors' => $compatibility->get_warnings('error')
                    ));
                }
            }
            
            // Check for critical conflicts
            if (isset($conflict_prevention) && $conflict_prevention->has_critical_conflicts()) {
                wp_crm_integration_debug_log('Critical plugin conflicts detected');
                
                if (class_exists('WP_CRM_Integration_Logger')) {
                    $logger = WP_CRM_Integration_Logger::get_instance();
                    $logger->error('Critical plugin conflicts detected', array(
                        'conflicts' => $conflict_prevention->get_conflicts('high')
                    ));
                }
            }
            
            // Initialize admin interface if in admin area
            if (is_admin()) {
                if (class_exists('WP_CRM_Integration_Admin')) {
                    WP_CRM_Integration_Admin::get_instance();
                    wp_crm_integration_debug_log('Admin interface initialized');
                } else {
                    wp_crm_integration_debug_log('Admin class not found');
                }
            }
            
            // Initialize event handlers only if compatible and no critical conflicts
            $can_run = !isset($compatibility) || $compatibility->can_run_safely();
            $no_conflicts = !isset($conflict_prevention) || !$conflict_prevention->has_critical_conflicts();
            
            if ($can_run && $no_conflicts) {
                if (class_exists('WP_CRM_Integration_Event_Handlers')) {
                    WP_CRM_Integration_Event_Handlers::get_instance();
                    wp_crm_integration_debug_log('Event handlers initialized');
                }
                
                if (class_exists('WP_CRM_Integration_Queue_Manager')) {
                    WP_CRM_Integration_Queue_Manager::get_instance();
                    wp_crm_integration_debug_log('Queue manager initialized');
                }
                
                if (class_exists('WP_CRM_Integration_Performance_Optimizer')) {
                    WP_CRM_Integration_Performance_Optimizer::get_instance();
                    wp_crm_integration_debug_log('Performance optimizer initialized');
                }
            } else {
                wp_crm_integration_debug_log('Skipping event handlers due to compatibility issues or conflicts');
            }
            
            wp_crm_integration_debug_log('Plugin initialization completed successfully');
            
        } catch (Exception $e) {
            wp_crm_integration_debug_log('Error during plugin initialization: ' . $e->getMessage());
            
            // Show admin notice
            add_action('admin_notices', function() use ($e) {
                echo '<div class="notice notice-error"><p>';
                echo '<strong>WordPress CRM Integration Initialization Error:</strong> ';
                echo esc_html($e->getMessage());
                echo '</p></div>';
            });
        }
    }
    
    /**
     * Load plugin textdomain for translations
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'wordpress-crm-integration',
            false,
            dirname(WP_CRM_INTEGRATION_PLUGIN_BASENAME) . '/languages'
        );
    }
    
    /**
     * Plugin activation hook
     */
    public function activate() {
        // Check compatibility before activation
        $compatibility = WP_CRM_Integration_Compatibility::get_instance();
        
        if (!$compatibility->can_run_safely()) {
            $errors = $compatibility->get_warnings('error');
            $error_messages = array();
            
            foreach ($errors as $error) {
                $error_messages[] = $error['message'];
            }
            
            wp_die(
                sprintf(
                    __('WordPress CRM Integration cannot be activated due to compatibility issues:<br><br>%s<br><br>Please resolve these issues and try again.', 'wordpress-crm-integration'),
                    implode('<br>', $error_messages)
                ),
                __('Plugin Activation Error', 'wordpress-crm-integration'),
                array('back_link' => true)
            );
        }
        
        // Create database tables if needed
        $this->create_tables();
        
        // Set default options
        $this->set_default_options();
        
        // Schedule cron jobs
        $this->schedule_cron_jobs();
        
        // Schedule periodic compatibility checks
        if (!wp_next_scheduled('wp_crm_integration_compatibility_check')) {
            wp_schedule_event(time(), 'daily', 'wp_crm_integration_compatibility_check');
        }
        
        // Schedule periodic conflict checks
        if (!wp_next_scheduled('wp_crm_integration_conflict_check')) {
            wp_schedule_event(time(), 'daily', 'wp_crm_integration_conflict_check');
        }
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation hook
     */
    public function deactivate() {
        // Clear scheduled cron jobs
        $this->clear_cron_jobs();
        
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Create plugin database tables
     */
    private function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Create sync queue table
        $table_name = $wpdb->prefix . 'crm_integration_queue';
        
        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            entity_type varchar(50) NOT NULL,
            entity_id bigint(20) NOT NULL,
            action varchar(50) NOT NULL,
            data longtext NOT NULL,
            status varchar(20) DEFAULT 'pending',
            priority int(11) DEFAULT 5,
            attempts int(11) DEFAULT 0,
            max_attempts int(11) DEFAULT 3,
            error_message text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            scheduled_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY status (status),
            KEY scheduled_at (scheduled_at),
            KEY entity_type (entity_type),
            KEY priority (priority),
            KEY status_priority_scheduled (status, priority DESC, scheduled_at ASC)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Create enhanced sync log table
        $log_table_name = $wpdb->prefix . 'crm_integration_log';
        
        $log_sql = "CREATE TABLE $log_table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            level varchar(20) NOT NULL DEFAULT 'info',
            message text NOT NULL,
            context longtext,
            entity_type varchar(50),
            entity_id bigint(20),
            action varchar(50),
            status varchar(20),
            request_data longtext,
            response_data longtext,
            error_message text,
            execution_time float DEFAULT 0,
            user_id bigint(20),
            ip_address varchar(45),
            user_agent varchar(255),
            request_method varchar(10),
            request_uri varchar(255),
            site_url varchar(255),
            wordpress_version varchar(20),
            plugin_version varchar(20),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY level (level),
            KEY entity_type (entity_type),
            KEY status (status),
            KEY created_at (created_at),
            KEY user_id (user_id)
        ) $charset_collate;";
        
        dbDelta($log_sql);
        
        // Create batch progress table
        $batch_table_name = $wpdb->prefix . 'crm_integration_batch_progress';
        
        $batch_sql = "CREATE TABLE $batch_table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            batch_id varchar(100) NOT NULL,
            entity_type varchar(50) NOT NULL,
            action varchar(50) NOT NULL,
            total_entities int(11) NOT NULL DEFAULT 0,
            total_batches int(11) NOT NULL DEFAULT 0,
            processed_batches int(11) NOT NULL DEFAULT 0,
            successful_entities int(11) NOT NULL DEFAULT 0,
            failed_entities int(11) NOT NULL DEFAULT 0,
            status varchar(20) DEFAULT 'running',
            duration float DEFAULT 0,
            error_summary longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            completed_at datetime,
            PRIMARY KEY (id),
            UNIQUE KEY batch_id (batch_id),
            KEY status (status),
            KEY entity_type (entity_type),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        dbDelta($batch_sql);
    }
    
    /**
     * Set default plugin options
     */
    private function set_default_options() {
        $default_options = array(
            'crm_url' => '',
            'api_key' => '',
            'tenant_key' => '',
            'sync_enabled' => array(
                'customers' => false,
                'orders' => false,
                'products' => false
            ),
            'field_mappings' => array(
                'customer' => array(),
                'order' => array(),
                'product' => array()
            ),
            'retry_settings' => array(
                'max_attempts' => 5,
                'base_delay' => 5,
                'max_delay' => 300,
                'backoff_multiplier' => 2,
                'jitter_enabled' => true,
                'failure_threshold' => 10,
                'retry_age_hours' => 24
            ),
            'queue_settings' => array(
                'batch_size' => 10,
                'off_peak_batch_size' => 30,
                'process_interval' => 300, // 5 minutes
                'retention_days' => 30,
                'off_peak_start' => 22, // 10 PM
                'off_peak_end' => 6 // 6 AM
            ),
            'performance' => array(
                'memory_limit_percentage' => 0.75, // 75% of PHP memory limit
                'cleanup_batch_size' => 500,
                'queue_retention_days' => 30,
                'log_retention_days' => 30,
                'batch_progress_retention_days' => 14,
                'enable_query_optimization' => true,
                'enable_memory_monitoring' => true,
                'enable_auto_cleanup' => true
            )
        );
        
        // Only set if option doesn't exist
        if (!get_option('wp_crm_integration_settings')) {
            add_option('wp_crm_integration_settings', $default_options);
        }
    }
    
    /**
     * Schedule cron jobs
     */
    private function schedule_cron_jobs() {
        // Main queue processing - every 5 minutes
        if (!wp_next_scheduled('wp_crm_integration_process_queue')) {
            wp_schedule_event(time(), 'wp_crm_integration_5min', 'wp_crm_integration_process_queue');
        }
        
        // Queue cleanup - daily at 2 AM
        if (!wp_next_scheduled('wp_crm_integration_cleanup_queue')) {
            $cleanup_time = strtotime('tomorrow 2:00 AM');
            wp_schedule_event($cleanup_time, 'daily', 'wp_crm_integration_cleanup_queue');
        }
        
        // Retry failed items - every hour
        if (!wp_next_scheduled('wp_crm_integration_retry_failed')) {
            wp_schedule_event(time(), 'hourly', 'wp_crm_integration_retry_failed');
        }
        
        // Low-traffic processing - every 15 minutes during off-peak hours
        if (!wp_next_scheduled('wp_crm_integration_low_traffic_process')) {
            wp_schedule_event(time(), 'wp_crm_integration_15min', 'wp_crm_integration_low_traffic_process');
        }
        
        // Failure threshold monitoring - every 15 minutes
        if (!wp_next_scheduled('wp_crm_integration_monitor_failures')) {
            wp_schedule_event(time(), 'wp_crm_integration_15min', 'wp_crm_integration_monitor_failures');
        }
        
        // Performance cleanup - daily at 3 AM
        if (!wp_next_scheduled('wp_crm_integration_performance_cleanup')) {
            $cleanup_time = strtotime('tomorrow 3:00 AM');
            wp_schedule_event($cleanup_time, 'daily', 'wp_crm_integration_performance_cleanup');
        }
        
        // Memory monitoring - every 15 minutes
        if (!wp_next_scheduled('wp_crm_integration_memory_check')) {
            wp_schedule_event(time(), 'wp_crm_integration_15min', 'wp_crm_integration_memory_check');
        }
    }
    
    /**
     * Clear scheduled cron jobs
     */
    private function clear_cron_jobs() {
        wp_clear_scheduled_hook('wp_crm_integration_process_queue');
        wp_clear_scheduled_hook('wp_crm_integration_cleanup_queue');
        wp_clear_scheduled_hook('wp_crm_integration_retry_failed');
        wp_clear_scheduled_hook('wp_crm_integration_low_traffic_process');
        wp_clear_scheduled_hook('wp_crm_integration_monitor_failures');
        wp_clear_scheduled_hook('wp_crm_integration_compatibility_check');
        wp_clear_scheduled_hook('wp_crm_integration_conflict_check');
        wp_clear_scheduled_hook('wp_crm_integration_performance_cleanup');
        wp_clear_scheduled_hook('wp_crm_integration_memory_check');
    }
}

/**
 * Add custom cron schedules with proper namespacing
 */
add_filter('cron_schedules', 'wp_crm_integration_add_cron_schedules', 10, 1);

function wp_crm_integration_add_cron_schedules($schedules) {
    // Use unique names to avoid conflicts
    $schedules['wp_crm_integration_5min'] = array(
        'interval' => 300, // 5 minutes
        'display' => __('Every 5 Minutes (CRM Integration)', 'wordpress-crm-integration')
    );
    
    $schedules['wp_crm_integration_15min'] = array(
        'interval' => 900, // 15 minutes
        'display' => __('Every 15 Minutes (CRM Integration)', 'wordpress-crm-integration')
    );
    
    return $schedules;
}

/**
 * Initialize the plugin
 */
function wp_crm_integration_init() {
    return WordPressCRMIntegration::get_instance();
}

// Start the plugin
wp_crm_integration_init();