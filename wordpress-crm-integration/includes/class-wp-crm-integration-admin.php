<?php
/**
 * Admin interface class
 *
 * @package WordPressCRMIntegration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Admin interface management class
 */
class WP_CRM_Integration_Admin {
    
    /**
     * Admin instance
     *
     * @var WP_CRM_Integration_Admin
     */
    private static $instance = null;
    
    /**
     * Plugin settings
     *
     * @var array
     */
    private $settings;
    
    /**
     * Configuration manager
     *
     * @var WP_CRM_Integration_Config
     */
    private $config;
    
    /**
     * Get admin instance
     *
     * @return WP_CRM_Integration_Admin
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
        $this->settings = $this->config->get_all_settings();
        $this->init_hooks();
    }
    
    /**
     * Initialize admin hooks
     */
    private function init_hooks() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('wp_ajax_wp_crm_test_connection', array($this, 'ajax_test_connection'));
        add_action('wp_ajax_wp_crm_validate_credentials', array($this, 'ajax_validate_credentials'));
        add_action('wp_ajax_wp_crm_get_connection_status', array($this, 'ajax_get_connection_status'));
        add_action('wp_ajax_wp_crm_get_wordpress_fields', array($this, 'ajax_get_wordpress_fields'));
        add_action('wp_ajax_wp_crm_test_manual_sync', array($this, 'ajax_test_manual_sync'));
        add_action('wp_ajax_wp_crm_reset_failure_threshold', array($this, 'ajax_reset_failure_threshold'));
        add_action('wp_ajax_wp_crm_get_sync_status', array($this, 'ajax_get_sync_status'));
        add_action('wp_ajax_wp_crm_toggle_sync', array($this, 'ajax_toggle_sync'));
        
        // Backup and restore AJAX handlers
        add_action('wp_ajax_wp_crm_integration_create_backup', array($this, 'ajax_create_backup'));
        add_action('wp_ajax_wp_crm_integration_restore_backup', array($this, 'ajax_restore_backup'));
        add_action('wp_ajax_wp_crm_integration_delete_backup', array($this, 'ajax_delete_backup'));
        add_action('wp_ajax_wp_crm_integration_export_config', array($this, 'ajax_export_config'));
        add_action('wp_ajax_wp_crm_integration_import_config', array($this, 'ajax_import_config'));
        add_action('wp_ajax_wp_crm_integration_clear_migration_log', array($this, 'ajax_clear_migration_log'));
    }
    
    /**
     * Add admin menu items
     */
    public function add_admin_menu() {
        add_options_page(
            __('CRM Integration', 'wordpress-crm-integration'),
            __('CRM Integration', 'wordpress-crm-integration'),
            'manage_options',
            'wp-crm-integration',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Register plugin settings
     */
    public function register_settings() {
        register_setting(
            'wp_crm_integration_settings_group',
            'wp_crm_integration_settings',
            array($this, 'validate_settings')
        );
        
        // Connection Settings Section
        add_settings_section(
            'wp_crm_connection_section',
            __('CRM Connection Settings', 'wordpress-crm-integration'),
            array($this, 'render_connection_section'),
            'wp-crm-integration'
        );
        
        add_settings_field(
            'crm_url',
            __('CRM URL', 'wordpress-crm-integration'),
            array($this, 'render_crm_url_field'),
            'wp-crm-integration',
            'wp_crm_connection_section'
        );
        
        add_settings_field(
            'api_key',
            __('API Key', 'wordpress-crm-integration'),
            array($this, 'render_api_key_field'),
            'wp-crm-integration',
            'wp_crm_connection_section'
        );
        
        add_settings_field(
            'tenant_key',
            __('Tenant Key', 'wordpress-crm-integration'),
            array($this, 'render_tenant_key_field'),
            'wp-crm-integration',
            'wp_crm_connection_section'
        );
        
        // Sync Settings Section
        add_settings_section(
            'wp_crm_sync_section',
            __('Synchronization Settings', 'wordpress-crm-integration'),
            array($this, 'render_sync_section'),
            'wp-crm-integration'
        );
        
        add_settings_field(
            'sync_enabled',
            __('Enable Sync', 'wordpress-crm-integration'),
            array($this, 'render_sync_enabled_field'),
            'wp-crm-integration',
            'wp_crm_sync_section'
        );
    }
    
    /**
     * Enqueue admin scripts and styles
     */
    public function enqueue_admin_scripts($hook) {
        if ('settings_page_wp-crm-integration' !== $hook) {
            return;
        }
        
        // Determine if we should use Persian/RTL version
        $is_rtl = is_rtl() || get_locale() === 'fa_IR';
        
        // Enqueue appropriate JavaScript file
        wp_enqueue_script(
            'wp-crm-integration-admin',
            WP_CRM_INTEGRATION_PLUGIN_URL . 'assets/js/' . ($is_rtl ? 'admin-fa.js' : 'admin.js'),
            array('jquery'),
            WP_CRM_INTEGRATION_VERSION,
            true
        );
        
        // Enqueue appropriate CSS file
        wp_enqueue_style(
            'wp-crm-integration-admin',
            WP_CRM_INTEGRATION_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            WP_CRM_INTEGRATION_VERSION
        );
        
        // Enqueue RTL CSS if needed
        if ($is_rtl) {
            wp_enqueue_style(
                'wp-crm-integration-admin-rtl',
                WP_CRM_INTEGRATION_PLUGIN_URL . 'assets/css/admin-rtl.css',
                array('wp-crm-integration-admin'),
                WP_CRM_INTEGRATION_VERSION
            );
        }
        
        wp_localize_script('wp-crm-integration-admin', 'wpCrmAjax', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wp_crm_integration_admin'),
            'strings' => array(
                'testing_connection' => __('Testing connection...', 'wordpress-crm-integration'),
                'connection_successful' => __('Connection successful!', 'wordpress-crm-integration'),
                'connection_failed' => __('Connection failed:', 'wordpress-crm-integration'),
                'loading_fields' => __('Loading fields...', 'wordpress-crm-integration'),
                'validating_credentials' => __('Validating credentials...', 'wordpress-crm-integration'),
                'credentials_valid' => __('Credentials are valid', 'wordpress-crm-integration'),
                'credentials_invalid' => __('Invalid credentials', 'wordpress-crm-integration'),
                'checking_status' => __('Checking connection status...', 'wordpress-crm-integration'),
                'creating_backup' => __('Creating backup...', 'wordpress-crm-integration'),
                'backup_created' => __('Backup created successfully!', 'wordpress-crm-integration'),
                'backup_failed' => __('Failed to create backup:', 'wordpress-crm-integration'),
                'restoring_backup' => __('Restoring backup...', 'wordpress-crm-integration'),
                'backup_restored' => __('Backup restored successfully!', 'wordpress-crm-integration'),
                'restore_failed' => __('Failed to restore backup:', 'wordpress-crm-integration'),
                'deleting_backup' => __('Deleting backup...', 'wordpress-crm-integration'),
                'backup_deleted' => __('Backup deleted successfully!', 'wordpress-crm-integration'),
                'delete_failed' => __('Failed to delete backup:', 'wordpress-crm-integration'),
                'confirm_restore' => __('Are you sure you want to restore this backup? Current settings will be overwritten.', 'wordpress-crm-integration'),
                'confirm_delete' => __('Are you sure you want to delete this backup? This action cannot be undone.', 'wordpress-crm-integration'),
                'exporting_config' => __('Exporting configuration...', 'wordpress-crm-integration'),
                'importing_config' => __('Importing configuration...', 'wordpress-crm-integration'),
                'import_success' => __('Configuration imported successfully!', 'wordpress-crm-integration'),
                'import_failed' => __('Failed to import configuration:', 'wordpress-crm-integration'),
            )
        ));
    }
    
    /**
     * Render main settings page
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.'));
        }
        
        // Handle form submission
        if (isset($_POST['submit']) && check_admin_referer('wp_crm_integration_settings_nonce')) {
            $this->save_settings();
        }
        
        $current_tab = isset($_GET['tab']) ? sanitize_text_field($_GET['tab']) : 'general';
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <?php settings_errors(); ?>
            
            <div class="wp-crm-tabs">
                <ul>
                    <li>
                        <a href="<?php echo admin_url('admin.php?page=wp-crm-integration&tab=general'); ?>" 
                           class="<?php echo $current_tab === 'general' ? 'active' : ''; ?>">
                            <?php _e('General Settings', 'wordpress-crm-integration'); ?>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo admin_url('admin.php?page=wp-crm-integration&tab=field-mapping'); ?>" 
                           class="<?php echo $current_tab === 'field-mapping' ? 'active' : ''; ?>">
                            <?php _e('Field Mapping', 'wordpress-crm-integration'); ?>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo admin_url('admin.php?page=wp-crm-integration&tab=advanced'); ?>" 
                           class="<?php echo $current_tab === 'advanced' ? 'active' : ''; ?>">
                            <?php _e('Advanced Settings', 'wordpress-crm-integration'); ?>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo admin_url('admin.php?page=wp-crm-integration&tab=logs'); ?>" 
                           class="<?php echo $current_tab === 'logs' ? 'active' : ''; ?>">
                            <?php _e('Sync Logs', 'wordpress-crm-integration'); ?>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo admin_url('admin.php?page=wp-crm-integration&tab=monitoring'); ?>" 
                           class="<?php echo $current_tab === 'monitoring' ? 'active' : ''; ?>">
                            <?php _e('Monitoring & Testing', 'wordpress-crm-integration'); ?>
                        </a>
                    </li>
                    <li>
                        <a href="<?php echo admin_url('admin.php?page=wp-crm-integration&tab=backup'); ?>" 
                           class="<?php echo $current_tab === 'backup' ? 'active' : ''; ?>">
                            <?php _e('Backup & Restore', 'wordpress-crm-integration'); ?>
                        </a>
                    </li>
                </ul>
            </div>
            
            <div class="wp-crm-integration-admin-container">
                <div class="wp-crm-integration-main-content">
                    <?php
                    switch ($current_tab) {
                        case 'field-mapping':
                            $this->render_field_mapping_tab();
                            break;
                        case 'advanced':
                            $this->render_advanced_tab();
                            break;
                        case 'logs':
                            $this->render_logs_tab();
                            break;
                        case 'monitoring':
                            $this->render_monitoring_tab();
                            break;
                        case 'backup':
                            $this->render_backup_tab();
                            break;
                        default:
                            $this->render_general_tab();
                            break;
                    }
                    ?>
                </div>
                
                <div class="wp-crm-integration-sidebar">
                    <?php $this->render_sidebar(); ?>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Render general settings tab
     */
    private function render_general_tab() {
        ?>
        <form method="post" action="">
            <?php
            wp_nonce_field('wp_crm_integration_settings_nonce');
            settings_fields('wp_crm_integration_settings_group');
            do_settings_sections('wp-crm-integration');
            ?>
            
            <div class="wp-crm-connection-test">
                <button type="button" id="wp-crm-test-connection" class="button button-secondary">
                    <?php _e('Test Connection', 'wordpress-crm-integration'); ?>
                </button>
                <span id="wp-crm-connection-status"></span>
            </div>
            
            <?php submit_button(); ?>
        </form>
        <?php
    }
    
    /**
     * Render field mapping tab
     */
    private function render_field_mapping_tab() {
        $field_mappings = isset($this->settings['field_mappings']) ? $this->settings['field_mappings'] : array();
        
        ?>
        <form method="post" action="">
            <?php wp_nonce_field('wp_crm_integration_field_mapping_nonce'); ?>
            
            <h2><?php _e('Field Mapping Configuration', 'wordpress-crm-integration'); ?></h2>
            <p><?php _e('Map WordPress fields to your CRM fields. Required fields are marked with an asterisk (*).', 'wordpress-crm-integration'); ?></p>
            
            <?php if (!$this->is_woocommerce_active()): ?>
                <div class="wp-crm-woocommerce-notice">
                    <p><strong><?php _e('Note:', 'wordpress-crm-integration'); ?></strong> 
                    <?php _e('WooCommerce is not active. Order and product mapping options will be limited to basic WordPress fields.', 'wordpress-crm-integration'); ?></p>
                </div>
            <?php endif; ?>
            
            <!-- Customer Field Mapping -->
            <div class="wp-crm-field-mapping-container">
                <h3><?php _e('Customer Fields', 'wordpress-crm-integration'); ?></h3>
                <?php $this->render_field_mapping_section('customer', $field_mappings); ?>
            </div>
            
            <!-- Order Field Mapping -->
            <?php if ($this->is_woocommerce_active()): ?>
                <div class="wp-crm-field-mapping-container">
                    <h3><?php _e('Order Fields', 'wordpress-crm-integration'); ?></h3>
                    <?php $this->render_field_mapping_section('order', $field_mappings); ?>
                </div>
            <?php endif; ?>
            
            <!-- Product Field Mapping -->
            <?php if ($this->is_woocommerce_active()): ?>
                <div class="wp-crm-field-mapping-container">
                    <h3><?php _e('Product Fields', 'wordpress-crm-integration'); ?></h3>
                    <?php $this->render_field_mapping_section('product', $field_mappings); ?>
                </div>
            <?php endif; ?>
            
            <div style="margin-top: 20px;">
                <button type="button" id="wp-crm-refresh-fields" class="button button-secondary">
                    <?php _e('Refresh WordPress Fields', 'wordpress-crm-integration'); ?>
                </button>
                <?php submit_button(__('Save Field Mappings', 'wordpress-crm-integration'), 'primary', 'save_field_mappings'); ?>
            </div>
        </form>
        <?php
    }
    
    /**
     * Render field mapping section
     */
    private function render_field_mapping_section($entity_type, $field_mappings) {
        $crm_fields = $this->get_crm_fields($entity_type);
        $wp_fields = $this->get_wordpress_fields_for_select();
        $current_mappings = isset($field_mappings[$entity_type]) ? $field_mappings[$entity_type] : array();
        
        foreach ($crm_fields as $crm_field => $field_config) {
            $current_value = isset($current_mappings[$crm_field]) ? $current_mappings[$crm_field] : '';
            $required = isset($field_config['required']) && $field_config['required'];
            
            ?>
            <div class="wp-crm-field-mapping-row">
                <label for="<?php echo esc_attr($entity_type . '_' . $crm_field); ?>">
                    <?php echo esc_html($field_config['label']); ?>
                    <?php if ($required): ?>
                        <span class="wp-crm-field-mapping-required">*</span>
                    <?php endif; ?>
                </label>
                
                <select name="wp_crm_integration_field_mappings[<?php echo esc_attr($entity_type); ?>][<?php echo esc_attr($crm_field); ?>]" 
                        id="<?php echo esc_attr($entity_type . '_' . $crm_field); ?>"
                        class="wp-crm-field-mapping">
                    <option value=""><?php _e('-- Select WordPress Field --', 'wordpress-crm-integration'); ?></option>
                    <?php foreach ($wp_fields as $category => $fields): ?>
                        <?php if (!empty($fields)): ?>
                            <optgroup label="<?php echo esc_attr($category); ?>">
                                <?php foreach ($fields as $field): ?>
                                    <option value="<?php echo esc_attr($field['key']); ?>" 
                                            <?php selected($current_value, $field['key']); ?>>
                                        <?php echo esc_html($field['label']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </optgroup>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </select>
                
                <?php if (isset($field_config['description'])): ?>
                    <p class="description"><?php echo esc_html($field_config['description']); ?></p>
                <?php endif; ?>
            </div>
            <?php
        }
    }
    
    /**
     * Render enhanced logs tab
     */
    private function render_logs_tab() {
        $logger = WP_CRM_Integration_Logger::get_instance();
        
        // Handle log export
        if (isset($_GET['export_logs']) && wp_verify_nonce($_GET['_wpnonce'], 'export_logs')) {
            $filters = $this->get_log_filters();
            $csv_content = $logger->export_logs_csv($filters);
            
            header('Content-Type: text/csv');
            header('Content-Disposition: attachment; filename="crm-integration-logs-' . date('Y-m-d') . '.csv"');
            echo $csv_content;
            exit;
        }
        
        // Handle log cleanup
        if (isset($_POST['cleanup_logs']) && wp_verify_nonce($_POST['_wpnonce'], 'cleanup_logs')) {
            $deleted_count = $logger->cleanup_old_logs();
            echo '<div class="notice notice-success"><p>' . 
                 sprintf(__('Cleaned up %d old log entries.', 'wordpress-crm-integration'), $deleted_count) . 
                 '</p></div>';
        }
        
        // Get filters
        $filters = $this->get_log_filters();
        $per_page = 20;
        $current_page = isset($_GET['paged']) ? max(1, intval($_GET['paged'])) : 1;
        
        // Get logs with filters
        $log_data = $logger->get_log_entries($filters, $per_page, $current_page);
        $logs = $log_data['entries'];
        $total_pages = $log_data['pages'];
        
        // Get statistics
        $stats = $logger->get_log_statistics(7);
        
        ?>
        <h2><?php _e('Sync Logs & Monitoring', 'wordpress-crm-integration'); ?></h2>
        
        <!-- Statistics Dashboard -->
        <div class="wp-crm-log-stats" style="margin-bottom: 20px;">
            <div class="postbox">
                <h3 class="hndle"><?php _e('Last 7 Days Statistics', 'wordpress-crm-integration'); ?></h3>
                <div class="inside">
                    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <div class="stat-box">
                            <h4><?php _e('Log Levels', 'wordpress-crm-integration'); ?></h4>
                            <?php foreach ($stats['level_stats'] as $level_stat): ?>
                                <div class="stat-item">
                                    <span class="wp-crm-log-level <?php echo esc_attr($level_stat->level); ?>">
                                        <?php echo esc_html(ucfirst($level_stat->level)); ?>
                                    </span>
                                    <span class="count"><?php echo esc_html($level_stat->count); ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        
                        <div class="stat-box">
                            <h4><?php _e('Entity Types', 'wordpress-crm-integration'); ?></h4>
                            <?php foreach ($stats['entity_stats'] as $entity_stat): ?>
                                <div class="stat-item">
                                    <span><?php echo esc_html(ucfirst($entity_stat->entity_type)); ?></span>
                                    <span class="count"><?php echo esc_html($entity_stat->count); ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        
                        <?php if (!empty($stats['critical_errors'])): ?>
                        <div class="stat-box">
                            <h4 style="color: #d63638;"><?php _e('Recent Critical Errors', 'wordpress-crm-integration'); ?></h4>
                            <?php foreach (array_slice($stats['critical_errors'], 0, 3) as $error): ?>
                                <div class="stat-item">
                                    <small><?php echo esc_html(date('M j H:i', strtotime($error->created_at))); ?></small><br>
                                    <span><?php echo esc_html(substr($error->message, 0, 50)) . '...'; ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Filters and Actions -->
        <div class="wp-crm-log-filters" style="background: #f9f9f9; padding: 15px; margin-bottom: 20px; border: 1px solid #ddd;">
            <form method="get" action="">
                <input type="hidden" name="page" value="wp-crm-integration">
                <input type="hidden" name="tab" value="logs">
                
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                    <select name="level">
                        <option value=""><?php _e('All Levels', 'wordpress-crm-integration'); ?></option>
                        <option value="debug" <?php selected($filters['level'], 'debug'); ?>><?php _e('Debug', 'wordpress-crm-integration'); ?></option>
                        <option value="info" <?php selected($filters['level'], 'info'); ?>><?php _e('Info', 'wordpress-crm-integration'); ?></option>
                        <option value="warning" <?php selected($filters['level'], 'warning'); ?>><?php _e('Warning', 'wordpress-crm-integration'); ?></option>
                        <option value="error" <?php selected($filters['level'], 'error'); ?>><?php _e('Error', 'wordpress-crm-integration'); ?></option>
                        <option value="critical" <?php selected($filters['level'], 'critical'); ?>><?php _e('Critical', 'wordpress-crm-integration'); ?></option>
                    </select>
                    
                    <select name="entity_type">
                        <option value=""><?php _e('All Entity Types', 'wordpress-crm-integration'); ?></option>
                        <option value="customer" <?php selected($filters['entity_type'], 'customer'); ?>><?php _e('Customer', 'wordpress-crm-integration'); ?></option>
                        <option value="order" <?php selected($filters['entity_type'], 'order'); ?>><?php _e('Order', 'wordpress-crm-integration'); ?></option>
                        <option value="product" <?php selected($filters['entity_type'], 'product'); ?>><?php _e('Product', 'wordpress-crm-integration'); ?></option>
                    </select>
                    
                    <input type="text" name="search" placeholder="<?php _e('Search logs...', 'wordpress-crm-integration'); ?>" 
                           value="<?php echo esc_attr($filters['search']); ?>" style="width: 200px;">
                    
                    <input type="date" name="date_from" value="<?php echo esc_attr($filters['date_from']); ?>">
                    <span><?php _e('to', 'wordpress-crm-integration'); ?></span>
                    <input type="date" name="date_to" value="<?php echo esc_attr($filters['date_to']); ?>">
                    
                    <button type="submit" class="button"><?php _e('Filter', 'wordpress-crm-integration'); ?></button>
                    <a href="<?php echo admin_url('admin.php?page=wp-crm-integration&tab=logs'); ?>" class="button">
                        <?php _e('Clear', 'wordpress-crm-integration'); ?>
                    </a>
                </div>
            </form>
            
            <div style="margin-top: 10px;">
                <a href="<?php echo wp_nonce_url(add_query_arg(array_merge($filters, array('export_logs' => '1'))), 'export_logs'); ?>" 
                   class="button"><?php _e('Export CSV', 'wordpress-crm-integration'); ?></a>
                
                <form method="post" style="display: inline-block; margin-left: 10px;">
                    <?php wp_nonce_field('cleanup_logs'); ?>
                    <button type="submit" name="cleanup_logs" class="button" 
                            onclick="return confirm('<?php _e('Are you sure you want to cleanup old logs?', 'wordpress-crm-integration'); ?>')">
                        <?php _e('Cleanup Old Logs', 'wordpress-crm-integration'); ?>
                    </button>
                </form>
            </div>
        </div>
        
        <!-- Logs Table -->
        <div class="wp-crm-sync-logs">
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th style="width: 140px;"><?php _e('Date', 'wordpress-crm-integration'); ?></th>
                        <th style="width: 80px;"><?php _e('Level', 'wordpress-crm-integration'); ?></th>
                        <th style="width: 120px;"><?php _e('Entity', 'wordpress-crm-integration'); ?></th>
                        <th style="width: 80px;"><?php _e('Action', 'wordpress-crm-integration'); ?></th>
                        <th><?php _e('Message', 'wordpress-crm-integration'); ?></th>
                        <th style="width: 80px;"><?php _e('User', 'wordpress-crm-integration'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($logs)): ?>
                        <tr>
                            <td colspan="6"><?php _e('No logs found matching your criteria.', 'wordpress-crm-integration'); ?></td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($logs as $log): ?>
                            <tr class="log-row" data-log-id="<?php echo esc_attr($log->id); ?>">
                                <td><?php echo esc_html(date('M j, Y H:i', strtotime($log->created_at))); ?></td>
                                <td>
                                    <span class="wp-crm-log-level <?php echo esc_attr($log->level); ?>">
                                        <?php echo esc_html(ucfirst($log->level)); ?>
                                    </span>
                                </td>
                                <td>
                                    <?php if ($log->entity_type && $log->entity_id): ?>
                                        <?php echo esc_html(ucfirst($log->entity_type) . ' #' . $log->entity_id); ?>
                                    <?php else: ?>
                                        <span class="dashicons dashicons-minus" style="color: #ccc;"></span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($log->action): ?>
                                        <?php echo esc_html(ucfirst($log->action)); ?>
                                    <?php else: ?>
                                        <span class="dashicons dashicons-minus" style="color: #ccc;"></span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <div class="log-message">
                                        <?php echo esc_html(substr($log->message, 0, 100)); ?>
                                        <?php if (strlen($log->message) > 100): ?>
                                            <span class="log-message-more" style="display: none;">
                                                <?php echo esc_html(substr($log->message, 100)); ?>
                                            </span>
                                            <a href="#" class="toggle-message" style="color: #0073aa;"><?php _e('...more', 'wordpress-crm-integration'); ?></a>
                                        <?php endif; ?>
                                    </div>
                                    
                                    <?php if ($log->context_decoded && !empty($log->context_decoded)): ?>
                                        <div class="log-context" style="display: none; margin-top: 5px; padding: 5px; background: #f0f0f0; font-size: 11px;">
                                            <strong><?php _e('Context:', 'wordpress-crm-integration'); ?></strong><br>
                                            <?php foreach ($log->context_decoded as $key => $value): ?>
                                                <?php if (!is_array($value) && !is_object($value)): ?>
                                                    <div><strong><?php echo esc_html($key); ?>:</strong> <?php echo esc_html($value); ?></div>
                                                <?php endif; ?>
                                            <?php endforeach; ?>
                                        </div>
                                        <a href="#" class="toggle-context" style="color: #0073aa; font-size: 11px;"><?php _e('Show Context', 'wordpress-crm-integration'); ?></a>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($log->user_id): ?>
                                        <?php 
                                        $user = get_user_by('id', $log->user_id);
                                        echo $user ? esc_html($user->display_name) : '#' . $log->user_id;
                                        ?>
                                    <?php else: ?>
                                        <?php _e('System', 'wordpress-crm-integration'); ?>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
            
            <?php if ($total_pages > 1): ?>
                <div class="tablenav">
                    <div class="tablenav-pages">
                        <?php
                        echo paginate_links(array(
                            'base' => add_query_arg('paged', '%#%'),
                            'format' => '',
                            'prev_text' => __('&laquo;'),
                            'next_text' => __('&raquo;'),
                            'total' => $total_pages,
                            'current' => $current_page
                        ));
                        ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            $('.toggle-message').click(function(e) {
                e.preventDefault();
                var $more = $(this).siblings('.log-message-more');
                if ($more.is(':visible')) {
                    $more.hide();
                    $(this).text('...more');
                } else {
                    $more.show();
                    $(this).text('less');
                }
            });
            
            $('.toggle-context').click(function(e) {
                e.preventDefault();
                var $context = $(this).siblings('.log-context');
                if ($context.is(':visible')) {
                    $context.hide();
                    $(this).text('Show Context');
                } else {
                    $context.show();
                    $(this).text('Hide Context');
                }
            });
        });
        </script>
        <?php
    }
    
    /**
     * Get log filters from request
     */
    private function get_log_filters() {
        return array(
            'level' => isset($_GET['level']) ? sanitize_text_field($_GET['level']) : '',
            'entity_type' => isset($_GET['entity_type']) ? sanitize_text_field($_GET['entity_type']) : '',
            'action' => isset($_GET['action']) ? sanitize_text_field($_GET['action']) : '',
            'search' => isset($_GET['search']) ? sanitize_text_field($_GET['search']) : '',
            'date_from' => isset($_GET['date_from']) ? sanitize_text_field($_GET['date_from']) : '',
            'date_to' => isset($_GET['date_to']) ? sanitize_text_field($_GET['date_to']) : ''
        );
    }
    
    /**
     * Render advanced settings tab
     */
    private function render_advanced_tab() {
        $settings = get_option('wp_crm_integration_settings', array());
        $retry_handler = WP_CRM_Integration_Retry_Handler::get_instance();
        
        // Handle settings update
        if (isset($_POST['save_advanced_settings']) && wp_verify_nonce($_POST['_wpnonce'], 'save_advanced_settings')) {
            $retry_settings = array(
                'max_attempts' => max(1, min(10, intval($_POST['max_attempts']))),
                'base_delay' => max(1, min(60, intval($_POST['base_delay']))),
                'max_delay' => max(60, min(3600, intval($_POST['max_delay']))),
                'backoff_multiplier' => max(1.1, min(5.0, floatval($_POST['backoff_multiplier']))),
                'jitter_enabled' => isset($_POST['jitter_enabled']),
                'failure_threshold' => max(1, min(100, intval($_POST['failure_threshold'])))
            );
            
            $queue_settings = array(
                'batch_size' => max(1, min(100, intval($_POST['batch_size']))),
                'process_interval' => max(60, min(3600, intval($_POST['process_interval'])))
            );
            
            $log_settings = array(
                'log_level' => sanitize_text_field($_POST['log_level']),
                'log_retention_days' => max(1, min(365, intval($_POST['log_retention_days'])))
            );
            
            $settings['retry_settings'] = array_merge(
                isset($settings['retry_settings']) ? $settings['retry_settings'] : array(),
                $retry_settings
            );
            
            $settings['queue_settings'] = array_merge(
                isset($settings['queue_settings']) ? $settings['queue_settings'] : array(),
                $queue_settings
            );
            
            $settings['log_settings'] = array_merge(
                isset($settings['log_settings']) ? $settings['log_settings'] : array(),
                $log_settings
            );
            
            update_option('wp_crm_integration_settings', $settings);
            
            echo '<div class="notice notice-success"><p>' . 
                 __('Advanced settings saved successfully.', 'wordpress-crm-integration') . 
                 '</p></div>';
        }
        
        // Get current settings
        $retry_settings = isset($settings['retry_settings']) ? $settings['retry_settings'] : array();
        $queue_settings = isset($settings['queue_settings']) ? $settings['queue_settings'] : array();
        $log_settings = isset($settings['log_settings']) ? $settings['log_settings'] : array();
        
        // Get retry statistics
        $retry_stats = $retry_handler->get_retry_statistics(7);
        
        ?>
        <h2><?php _e('Advanced Settings', 'wordpress-crm-integration'); ?></h2>
        
        <!-- Retry Statistics -->
        <div class="postbox" style="margin-bottom: 20px;">
            <h3 class="hndle"><?php _e('Retry Statistics (Last 7 Days)', 'wordpress-crm-integration'); ?></h3>
            <div class="inside">
                <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                    <div class="stat-box">
                        <h4><?php _e('Retry Operations', 'wordpress-crm-integration'); ?></h4>
                        <div class="stat-item">
                            <span><?php _e('Total Operations', 'wordpress-crm-integration'); ?></span>
                            <span class="count"><?php echo esc_html($retry_stats['total_retry_operations']); ?></span>
                        </div>
                        <div class="stat-item">
                            <span><?php _e('Successful After Retry', 'wordpress-crm-integration'); ?></span>
                            <span class="count"><?php echo esc_html($retry_stats['successful_after_retry']); ?></span>
                        </div>
                        <div class="stat-item">
                            <span><?php _e('Failed After All Retries', 'wordpress-crm-integration'); ?></span>
                            <span class="count"><?php echo esc_html($retry_stats['failed_after_all_retries']); ?></span>
                        </div>
                        <div class="stat-item">
                            <span><?php _e('Average Attempts', 'wordpress-crm-integration'); ?></span>
                            <span class="count"><?php echo esc_html($retry_stats['average_attempts']); ?></span>
                        </div>
                    </div>
                    
                    <?php if (!empty($retry_stats['most_common_errors'])): ?>
                    <div class="stat-box">
                        <h4><?php _e('Most Common Errors', 'wordpress-crm-integration'); ?></h4>
                        <?php foreach ($retry_stats['most_common_errors'] as $error => $count): ?>
                            <div class="stat-item">
                                <span><?php echo esc_html(substr($error, 0, 30)) . '...'; ?></span>
                                <span class="count"><?php echo esc_html($count); ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        
        <form method="post" action="">
            <?php wp_nonce_field('save_advanced_settings'); ?>
            
            <!-- Retry Settings -->
            <div class="postbox">
                <h3 class="hndle"><?php _e('Retry & Error Handling Settings', 'wordpress-crm-integration'); ?></h3>
                <div class="inside">
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="max_attempts"><?php _e('Maximum Retry Attempts', 'wordpress-crm-integration'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="max_attempts" name="max_attempts" 
                                       value="<?php echo esc_attr(isset($retry_settings['max_attempts']) ? $retry_settings['max_attempts'] : 5); ?>" 
                                       min="1" max="10" class="small-text">
                                <p class="description"><?php _e('Number of times to retry failed API requests (1-10)', 'wordpress-crm-integration'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="base_delay"><?php _e('Base Delay (seconds)', 'wordpress-crm-integration'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="base_delay" name="base_delay" 
                                       value="<?php echo esc_attr(isset($retry_settings['base_delay']) ? $retry_settings['base_delay'] : 5); ?>" 
                                       min="1" max="60" class="small-text">
                                <p class="description"><?php _e('Initial delay before first retry (1-60 seconds)', 'wordpress-crm-integration'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="max_delay"><?php _e('Maximum Delay (seconds)', 'wordpress-crm-integration'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="max_delay" name="max_delay" 
                                       value="<?php echo esc_attr(isset($retry_settings['max_delay']) ? $retry_settings['max_delay'] : 300); ?>" 
                                       min="60" max="3600" class="small-text">
                                <p class="description"><?php _e('Maximum delay between retries (60-3600 seconds)', 'wordpress-crm-integration'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="backoff_multiplier"><?php _e('Backoff Multiplier', 'wordpress-crm-integration'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="backoff_multiplier" name="backoff_multiplier" 
                                       value="<?php echo esc_attr(isset($retry_settings['backoff_multiplier']) ? $retry_settings['backoff_multiplier'] : 2); ?>" 
                                       min="1.1" max="5" step="0.1" class="small-text">
                                <p class="description"><?php _e('Multiplier for exponential backoff (1.1-5.0)', 'wordpress-crm-integration'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="jitter_enabled"><?php _e('Enable Jitter', 'wordpress-crm-integration'); ?></label>
                            </th>
                            <td>
                                <input type="checkbox" id="jitter_enabled" name="jitter_enabled" 
                                       <?php checked(isset($retry_settings['jitter_enabled']) ? $retry_settings['jitter_enabled'] : true); ?>>
                                <p class="description"><?php _e('Add random jitter to prevent thundering herd problems', 'wordpress-crm-integration'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="failure_threshold"><?php _e('Failure Threshold', 'wordpress-crm-integration'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="failure_threshold" name="failure_threshold" 
                                       value="<?php echo esc_attr(isset($retry_settings['failure_threshold']) ? $retry_settings['failure_threshold'] : 10); ?>" 
                                       min="1" max="100" class="small-text">
                                <p class="description"><?php _e('Number of errors per hour before disabling sync (1-100)', 'wordpress-crm-integration'); ?></p>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <!-- Queue Settings -->
            <div class="postbox">
                <h3 class="hndle"><?php _e('Queue Processing Settings', 'wordpress-crm-integration'); ?></h3>
                <div class="inside">
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="batch_size"><?php _e('Batch Size', 'wordpress-crm-integration'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="batch_size" name="batch_size" 
                                       value="<?php echo esc_attr(isset($queue_settings['batch_size']) ? $queue_settings['batch_size'] : 10); ?>" 
                                       min="1" max="100" class="small-text">
                                <p class="description"><?php _e('Number of items to process in each queue batch (1-100)', 'wordpress-crm-integration'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="process_interval"><?php _e('Process Interval (seconds)', 'wordpress-crm-integration'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="process_interval" name="process_interval" 
                                       value="<?php echo esc_attr(isset($queue_settings['process_interval']) ? $queue_settings['process_interval'] : 300); ?>" 
                                       min="60" max="3600" class="small-text">
                                <p class="description"><?php _e('How often to process the queue (60-3600 seconds)', 'wordpress-crm-integration'); ?></p>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <!-- Logging Settings -->
            <div class="postbox">
                <h3 class="hndle"><?php _e('Logging Settings', 'wordpress-crm-integration'); ?></h3>
                <div class="inside">
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="log_level"><?php _e('Log Level', 'wordpress-crm-integration'); ?></label>
                            </th>
                            <td>
                                <select id="log_level" name="log_level">
                                    <option value="debug" <?php selected(isset($log_settings['log_level']) ? $log_settings['log_level'] : 'info', 'debug'); ?>><?php _e('Debug', 'wordpress-crm-integration'); ?></option>
                                    <option value="info" <?php selected(isset($log_settings['log_level']) ? $log_settings['log_level'] : 'info', 'info'); ?>><?php _e('Info', 'wordpress-crm-integration'); ?></option>
                                    <option value="warning" <?php selected(isset($log_settings['log_level']) ? $log_settings['log_level'] : 'info', 'warning'); ?>><?php _e('Warning', 'wordpress-crm-integration'); ?></option>
                                    <option value="error" <?php selected(isset($log_settings['log_level']) ? $log_settings['log_level'] : 'info', 'error'); ?>><?php _e('Error', 'wordpress-crm-integration'); ?></option>
                                    <option value="critical" <?php selected(isset($log_settings['log_level']) ? $log_settings['log_level'] : 'info', 'critical'); ?>><?php _e('Critical', 'wordpress-crm-integration'); ?></option>
                                </select>
                                <p class="description"><?php _e('Minimum log level to record', 'wordpress-crm-integration'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="log_retention_days"><?php _e('Log Retention (days)', 'wordpress-crm-integration'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="log_retention_days" name="log_retention_days" 
                                       value="<?php echo esc_attr(isset($log_settings['log_retention_days']) ? $log_settings['log_retention_days'] : 30); ?>" 
                                       min="1" max="365" class="small-text">
                                <p class="description"><?php _e('Number of days to keep log entries (1-365)', 'wordpress-crm-integration'); ?></p>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <p class="submit">
                <input type="submit" name="save_advanced_settings" class="button-primary" 
                       value="<?php _e('Save Advanced Settings', 'wordpress-crm-integration'); ?>">
            </p>
        </form>
        <?php
    }
    
    /**
     * Render monitoring and testing tab
     */
    private function render_monitoring_tab() {
        $logger = WP_CRM_Integration_Logger::get_instance();
        $retry_handler = WP_CRM_Integration_Retry_Handler::get_instance();
        
        // Get sync status and statistics
        $sync_stats = $logger->get_log_statistics(24); // Last 24 hours
        $failure_check = $retry_handler->check_failure_threshold();
        $sync_enabled = isset($this->settings['sync_enabled']) ? $this->settings['sync_enabled'] : array();
        
        // Handle manual sync disable/enable
        if (isset($_POST['toggle_sync_status']) && wp_verify_nonce($_POST['_wpnonce'], 'toggle_sync_status')) {
            $this->handle_sync_toggle();
        }
        
        // Handle failure threshold reset
        if (isset($_POST['reset_failure_threshold']) && wp_verify_nonce($_POST['_wpnonce'], 'reset_failure_threshold')) {
            $retry_handler->reset_failure_counters();
            echo '<div class="notice notice-success"><p>' . 
                 __('Failure counters have been reset. Sync operations will resume automatically.', 'wordpress-crm-integration') . 
                 '</p></div>';
        }
        
        // Handle manual sync testing
        if (isset($_POST['test_manual_sync']) && wp_verify_nonce($_POST['_wpnonce'], 'test_manual_sync')) {
            $this->handle_manual_sync_test();
        }
        
        ?>
        <h2><?php _e('Sync Monitoring & Testing Dashboard', 'wordpress-crm-integration'); ?></h2>
        
        <!-- Sync Status Overview -->
        <div class="wp-crm-monitoring-overview" style="margin-bottom: 20px;">
            <div class="postbox">
                <h3 class="hndle"><?php _e('Sync Status Overview', 'wordpress-crm-integration'); ?></h3>
                <div class="inside">
                    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <!-- Overall Status -->
                        <div class="stat-box">
                            <h4><?php _e('Overall Status', 'wordpress-crm-integration'); ?></h4>
                            <?php
                            $overall_status = $this->get_overall_sync_status($failure_check, $sync_enabled);
                            $status_class = $overall_status['status'] === 'active' ? 'success' : 
                                          ($overall_status['status'] === 'disabled' ? 'error' : 'warning');
                            ?>
                            <div class="stat-item">
                                <span class="wp-crm-status-indicator <?php echo esc_attr($status_class); ?>">
                                    <?php echo esc_html($overall_status['label']); ?>
                                </span>
                                <p class="description"><?php echo esc_html($overall_status['description']); ?></p>
                            </div>
                        </div>
                        
                        <!-- Recent Activity -->
                        <div class="stat-box">
                            <h4><?php _e('Last 24 Hours', 'wordpress-crm-integration'); ?></h4>
                            <?php
                            $total_operations = 0;
                            $error_operations = 0;
                            foreach ($sync_stats['level_stats'] as $level_stat) {
                                $total_operations += $level_stat->count;
                                if (in_array($level_stat->level, array('error', 'critical'))) {
                                    $error_operations += $level_stat->count;
                                }
                            }
                            $success_rate = $total_operations > 0 ? round((($total_operations - $error_operations) / $total_operations) * 100, 1) : 0;
                            ?>
                            <div class="stat-item">
                                <span><?php _e('Total Operations', 'wordpress-crm-integration'); ?></span>
                                <span class="count"><?php echo esc_html($total_operations); ?></span>
                            </div>
                            <div class="stat-item">
                                <span><?php _e('Success Rate', 'wordpress-crm-integration'); ?></span>
                                <span class="count <?php echo $success_rate >= 95 ? 'success' : ($success_rate >= 80 ? 'warning' : 'error'); ?>">
                                    <?php echo esc_html($success_rate); ?>%
                                </span>
                            </div>
                            <div class="stat-item">
                                <span><?php _e('Errors', 'wordpress-crm-integration'); ?></span>
                                <span class="count <?php echo $error_operations > 0 ? 'error' : 'success'; ?>">
                                    <?php echo esc_html($error_operations); ?>
                                </span>
                            </div>
                        </div>
                        
                        <!-- Failure Threshold Status -->
                        <div class="stat-box">
                            <h4><?php _e('Failure Threshold', 'wordpress-crm-integration'); ?></h4>
                            <div class="stat-item">
                                <span><?php _e('Current Errors (1 hour)', 'wordpress-crm-integration'); ?></span>
                                <span class="count <?php echo $failure_check['threshold_exceeded'] ? 'error' : 'success'; ?>">
                                    <?php echo esc_html($failure_check['error_count']); ?> / <?php echo esc_html($failure_check['threshold']); ?>
                                </span>
                            </div>
                            <?php if ($failure_check['threshold_exceeded']): ?>
                                <div class="stat-item">
                                    <span class="wp-crm-status-indicator error">
                                        <?php _e('Threshold Exceeded', 'wordpress-crm-integration'); ?>
                                    </span>
                                    <form method="post" style="margin-top: 10px;">
                                        <?php wp_nonce_field('reset_failure_threshold'); ?>
                                        <button type="submit" name="reset_failure_threshold" class="button button-secondary">
                                            <?php _e('Reset Failure Counter', 'wordpress-crm-integration'); ?>
                                        </button>
                                    </form>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Sync Activity Dashboard -->
        <div class="wp-crm-sync-activity" style="margin-bottom: 20px;">
            <div class="postbox">
                <h3 class="hndle"><?php _e('Recent Sync Activity', 'wordpress-crm-integration'); ?></h3>
                <div class="inside">
                    <?php $this->render_sync_activity_dashboard(); ?>
                </div>
            </div>
        </div>
        
        <!-- Manual Sync Testing -->
        <div class="wp-crm-manual-testing" style="margin-bottom: 20px;">
            <div class="postbox">
                <h3 class="hndle"><?php _e('Manual Sync Testing', 'wordpress-crm-integration'); ?></h3>
                <div class="inside">
                    <?php $this->render_manual_sync_testing(); ?>
                </div>
            </div>
        </div>
        
        <!-- Sync Controls -->
        <div class="wp-crm-sync-controls" style="margin-bottom: 20px;">
            <div class="postbox">
                <h3 class="hndle"><?php _e('Sync Controls', 'wordpress-crm-integration'); ?></h3>
                <div class="inside">
                    <?php $this->render_sync_controls($sync_enabled, $failure_check); ?>
                </div>
            </div>
        </div>
        
        <!-- Performance Monitoring -->
        <div class="wp-crm-performance-monitoring">
            <div class="postbox">
                <h3 class="hndle"><?php _e('Performance Monitoring', 'wordpress-crm-integration'); ?></h3>
                <div class="inside">
                    <?php $this->render_performance_monitoring(); ?>
                </div>
            </div>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            // Auto-refresh sync status every 30 seconds
            setInterval(function() {
                $('#wp-crm-sync-status-refresh').trigger('click');
            }, 30000);
            
            // Handle sync status refresh
            $('#wp-crm-sync-status-refresh').click(function(e) {
                e.preventDefault();
                var $button = $(this);
                var originalText = $button.text();
                
                $button.text('<?php _e('Refreshing...', 'wordpress-crm-integration'); ?>').prop('disabled', true);
                
                $.post(ajaxurl, {
                    action: 'wp_crm_get_sync_status',
                    nonce: wpCrmAjax.nonce
                }, function(response) {
                    if (response.success) {
                        location.reload(); // Simple refresh for now
                    }
                }).always(function() {
                    $button.text(originalText).prop('disabled', false);
                });
            });
            
            // Handle manual sync testing
            $('.wp-crm-test-sync').click(function(e) {
                e.preventDefault();
                var $button = $(this);
                var syncType = $button.data('sync-type');
                var originalText = $button.text();
                
                $button.text('<?php _e('Testing...', 'wordpress-crm-integration'); ?>').prop('disabled', true);
                
                $.post(ajaxurl, {
                    action: 'wp_crm_test_manual_sync',
                    sync_type: syncType,
                    nonce: wpCrmAjax.nonce
                }, function(response) {
                    var resultClass = response.success ? 'notice-success' : 'notice-error';
                    var resultHtml = '<div class="notice ' + resultClass + ' is-dismissible"><p>' + response.data.message + '</p></div>';
                    
                    $button.closest('.postbox').find('.inside').prepend(resultHtml);
                    
                    // Auto-dismiss after 5 seconds
                    setTimeout(function() {
                        $('.notice.is-dismissible').fadeOut();
                    }, 5000);
                }).always(function() {
                    $button.text(originalText).prop('disabled', false);
                });
            });
        });
        </script>
        <?php
    }
    
    /**
     * Render sync activity dashboard
     */
    private function render_sync_activity_dashboard() {
        $logger = WP_CRM_Integration_Logger::get_instance();
        
        // Get recent sync operations (last 50)
        $recent_logs = $logger->get_log_entries(array(), 50, 1);
        
        ?>
        <div class="wp-crm-activity-filters" style="margin-bottom: 15px;">
            <button type="button" id="wp-crm-sync-status-refresh" class="button button-secondary">
                <?php _e('Refresh Status', 'wordpress-crm-integration'); ?>
            </button>
            <span style="margin-left: 10px; color: #666;">
                <?php _e('Auto-refreshes every 30 seconds', 'wordpress-crm-integration'); ?>
            </span>
        </div>
        
        <div class="wp-crm-activity-table">
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th style="width: 120px;"><?php _e('Time', 'wordpress-crm-integration'); ?></th>
                        <th style="width: 80px;"><?php _e('Level', 'wordpress-crm-integration'); ?></th>
                        <th style="width: 100px;"><?php _e('Entity', 'wordpress-crm-integration'); ?></th>
                        <th style="width: 80px;"><?php _e('Action', 'wordpress-crm-integration'); ?></th>
                        <th><?php _e('Message', 'wordpress-crm-integration'); ?></th>
                        <th style="width: 100px;"><?php _e('Status', 'wordpress-crm-integration'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($recent_logs['entries'])): ?>
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 20px;">
                                <?php _e('No recent sync activity found.', 'wordpress-crm-integration'); ?>
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach (array_slice($recent_logs['entries'], 0, 20) as $log): ?>
                            <tr class="log-row <?php echo esc_attr($log->level); ?>">
                                <td>
                                    <span title="<?php echo esc_attr($log->created_at); ?>">
                                        <?php echo esc_html(human_time_diff(strtotime($log->created_at), current_time('timestamp'))); ?> ago
                                    </span>
                                </td>
                                <td>
                                    <span class="wp-crm-log-level <?php echo esc_attr($log->level); ?>">
                                        <?php echo esc_html(ucfirst($log->level)); ?>
                                    </span>
                                </td>
                                <td>
                                    <?php if ($log->entity_type && $log->entity_id): ?>
                                        <span class="wp-crm-entity-badge">
                                            <?php echo esc_html(ucfirst($log->entity_type)); ?>
                                            <small>#<?php echo esc_html($log->entity_id); ?></small>
                                        </span>
                                    <?php else: ?>
                                        <span class="dashicons dashicons-minus" style="color: #ccc;"></span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if ($log->action): ?>
                                        <span class="wp-crm-action-badge">
                                            <?php echo esc_html(ucfirst($log->action)); ?>
                                        </span>
                                    <?php else: ?>
                                        <span class="dashicons dashicons-minus" style="color: #ccc;"></span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <div class="log-message-preview">
                                        <?php echo esc_html(substr($log->message, 0, 80)); ?>
                                        <?php if (strlen($log->message) > 80): ?>
                                            <span class="log-message-more">...</span>
                                        <?php endif; ?>
                                    </div>
                                </td>
                                <td>
                                    <?php
                                    $status_class = 'unknown';
                                    $status_text = __('Unknown', 'wordpress-crm-integration');
                                    
                                    if ($log->level === 'error' || $log->level === 'critical') {
                                        $status_class = 'error';
                                        $status_text = __('Failed', 'wordpress-crm-integration');
                                    } elseif ($log->level === 'warning') {
                                        $status_class = 'warning';
                                        $status_text = __('Warning', 'wordpress-crm-integration');
                                    } elseif ($log->level === 'info' || $log->level === 'debug') {
                                        $status_class = 'success';
                                        $status_text = __('Success', 'wordpress-crm-integration');
                                    }
                                    ?>
                                    <span class="wp-crm-status-indicator <?php echo esc_attr($status_class); ?>">
                                        <?php echo esc_html($status_text); ?>
                                    </span>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
            
            <?php if (count($recent_logs['entries']) > 20): ?>
                <p style="text-align: center; margin-top: 15px;">
                    <a href="<?php echo admin_url('admin.php?page=wp-crm-integration&tab=logs'); ?>" class="button">
                        <?php _e('View All Logs', 'wordpress-crm-integration'); ?>
                    </a>
                </p>
            <?php endif; ?>
        </div>
        <?php
    }
    
    /**
     * Render manual sync testing section
     */
    private function render_manual_sync_testing() {
        $sync_enabled = isset($this->settings['sync_enabled']) ? $this->settings['sync_enabled'] : array();
        $has_credentials = !empty($this->settings['crm_url']) && !empty($this->settings['api_key']);
        
        ?>
        <div class="wp-crm-manual-testing-controls">
            <?php if (!$has_credentials): ?>
                <div class="notice notice-warning inline">
                    <p><?php _e('Please configure CRM credentials before testing sync operations.', 'wordpress-crm-integration'); ?></p>
                </div>
            <?php else: ?>
                <p><?php _e('Test individual sync operations with sample data to verify your configuration.', 'wordpress-crm-integration'); ?></p>
                
                <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px;">
                    <!-- Customer Sync Test -->
                    <div class="wp-crm-test-section">
                        <h4><?php _e('Customer Sync Test', 'wordpress-crm-integration'); ?></h4>
                        <p class="description">
                            <?php _e('Test customer data synchronization with sample user data.', 'wordpress-crm-integration'); ?>
                        </p>
                        <button type="button" 
                                class="button button-secondary wp-crm-test-sync" 
                                data-sync-type="customer"
                                <?php echo !isset($sync_enabled['customers']) || !$sync_enabled['customers'] ? 'disabled' : ''; ?>>
                            <?php _e('Test Customer Sync', 'wordpress-crm-integration'); ?>
                        </button>
                        <?php if (!isset($sync_enabled['customers']) || !$sync_enabled['customers']): ?>
                            <p class="description" style="color: #d63638;">
                                <?php _e('Customer sync is disabled', 'wordpress-crm-integration'); ?>
                            </p>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Order Sync Test -->
                    <?php if ($this->is_woocommerce_active()): ?>
                        <div class="wp-crm-test-section">
                            <h4><?php _e('Order Sync Test', 'wordpress-crm-integration'); ?></h4>
                            <p class="description">
                                <?php _e('Test WooCommerce order synchronization with sample order data.', 'wordpress-crm-integration'); ?>
                            </p>
                            <button type="button" 
                                    class="button button-secondary wp-crm-test-sync" 
                                    data-sync-type="order"
                                    <?php echo !isset($sync_enabled['orders']) || !$sync_enabled['orders'] ? 'disabled' : ''; ?>>
                                <?php _e('Test Order Sync', 'wordpress-crm-integration'); ?>
                            </button>
                            <?php if (!isset($sync_enabled['orders']) || !$sync_enabled['orders']): ?>
                                <p class="description" style="color: #d63638;">
                                    <?php _e('Order sync is disabled', 'wordpress-crm-integration'); ?>
                                </p>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                    
                    <!-- Product Sync Test -->
                    <?php if ($this->is_woocommerce_active()): ?>
                        <div class="wp-crm-test-section">
                            <h4><?php _e('Product Sync Test', 'wordpress-crm-integration'); ?></h4>
                            <p class="description">
                                <?php _e('Test product synchronization with sample product data.', 'wordpress-crm-integration'); ?>
                            </p>
                            <button type="button" 
                                    class="button button-secondary wp-crm-test-sync" 
                                    data-sync-type="product"
                                    <?php echo !isset($sync_enabled['products']) || !$sync_enabled['products'] ? 'disabled' : ''; ?>>
                                <?php _e('Test Product Sync', 'wordpress-crm-integration'); ?>
                            </button>
                            <?php if (!isset($sync_enabled['products']) || !$sync_enabled['products']): ?>
                                <p class="description" style="color: #d63638;">
                                    <?php _e('Product sync is disabled', 'wordpress-crm-integration'); ?>
                                </p>
                            <?php endif; ?>
                        </div>
                    <?php endif; ?>
                    
                    <!-- Connection Test -->
                    <div class="wp-crm-test-section">
                        <h4><?php _e('Connection Test', 'wordpress-crm-integration'); ?></h4>
                        <p class="description">
                            <?php _e('Test basic connectivity and authentication with your CRM system.', 'wordpress-crm-integration'); ?>
                        </p>
                        <button type="button" id="wp-crm-test-connection-detailed" class="button button-secondary">
                            <?php _e('Test Connection', 'wordpress-crm-integration'); ?>
                        </button>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }
    
    /**
     * Render sync controls section
     */
    private function render_sync_controls($sync_enabled, $failure_check) {
        ?>
        <div class="wp-crm-sync-controls-section">
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <!-- Sync Toggle Controls -->
                <div class="control-section">
                    <h4><?php _e('Sync Status Control', 'wordpress-crm-integration'); ?></h4>
                    <form method="post">
                        <?php wp_nonce_field('toggle_sync_status'); ?>
                        
                        <?php foreach (array('customers', 'orders', 'products') as $sync_type): ?>
                            <?php
                            $is_enabled = isset($sync_enabled[$sync_type]) && $sync_enabled[$sync_type];
                            $is_available = ($sync_type === 'customers') || 
                                          (($sync_type === 'orders' || $sync_type === 'products') && $this->is_woocommerce_active());
                            ?>
                            <div class="sync-control-item" style="margin-bottom: 10px;">
                                <label style="display: flex; align-items: center; gap: 10px;">
                                    <input type="checkbox" 
                                           name="sync_enabled[<?php echo esc_attr($sync_type); ?>]" 
                                           value="1" 
                                           <?php checked($is_enabled); ?>
                                           <?php echo !$is_available ? 'disabled' : ''; ?>>
                                    <span><?php echo esc_html(ucfirst($sync_type)); ?> Sync</span>
                                    
                                    <?php if ($is_enabled): ?>
                                        <span class="wp-crm-status-indicator success">Active</span>
                                    <?php elseif (!$is_available): ?>
                                        <span class="wp-crm-status-indicator error">Unavailable</span>
                                    <?php else: ?>
                                        <span class="wp-crm-status-indicator warning">Disabled</span>
                                    <?php endif; ?>
                                </label>
                                
                                <?php if (!$is_available && ($sync_type === 'orders' || $sync_type === 'products')): ?>
                                    <p class="description" style="margin-left: 30px; color: #d63638;">
                                        <?php _e('WooCommerce is required for this sync type', 'wordpress-crm-integration'); ?>
                                    </p>
                                <?php endif; ?>
                            </div>
                        <?php endforeach; ?>
                        
                        <p class="submit" style="margin-top: 15px;">
                            <input type="submit" name="toggle_sync_status" class="button-primary" 
                                   value="<?php _e('Update Sync Settings', 'wordpress-crm-integration'); ?>">
                        </p>
                    </form>
                </div>
                
                <!-- Emergency Controls -->
                <div class="control-section">
                    <h4><?php _e('Emergency Controls', 'wordpress-crm-integration'); ?></h4>
                    
                    <?php if ($failure_check['threshold_exceeded']): ?>
                        <div class="notice notice-error inline">
                            <p>
                                <strong><?php _e('Sync Disabled Due to Errors', 'wordpress-crm-integration'); ?></strong><br>
                                <?php printf(
                                    __('Too many errors detected (%d in the last hour). Sync has been automatically disabled.', 'wordpress-crm-integration'),
                                    $failure_check['error_count']
                                ); ?>
                            </p>
                        </div>
                        
                        <form method="post" style="margin-top: 10px;">
                            <?php wp_nonce_field('reset_failure_threshold'); ?>
                            <button type="submit" name="reset_failure_threshold" class="button button-secondary">
                                <?php _e('Reset Error Counter & Re-enable Sync', 'wordpress-crm-integration'); ?>
                            </button>
                        </form>
                    <?php else: ?>
                        <p class="description">
                            <?php _e('No emergency actions needed. Sync is operating normally.', 'wordpress-crm-integration'); ?>
                        </p>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Get overall sync status
     */
    private function get_overall_sync_status($failure_check, $sync_enabled) {
        $has_credentials = !empty($this->settings['crm_url']) && !empty($this->settings['api_key']);
        
        if (!$has_credentials) {
            return array(
                'status' => 'not_configured',
                'label' => __('Not Configured', 'wordpress-crm-integration'),
                'description' => __('CRM credentials not configured', 'wordpress-crm-integration')
            );
        }
        
        if ($failure_check['threshold_exceeded']) {
            return array(
                'status' => 'disabled',
                'label' => __('Disabled (Errors)', 'wordpress-crm-integration'),
                'description' => __('Sync disabled due to error threshold exceeded', 'wordpress-crm-integration')
            );
        }
        
        $active_syncs = array_filter($sync_enabled);
        if (empty($active_syncs)) {
            return array(
                'status' => 'inactive',
                'label' => __('Inactive', 'wordpress-crm-integration'),
                'description' => __('No sync types are enabled', 'wordpress-crm-integration')
            );
        }
        
        return array(
            'status' => 'active',
            'label' => __('Active', 'wordpress-crm-integration'),
            'description' => sprintf(__('%d sync type(s) active', 'wordpress-crm-integration'), count($active_syncs))
        );
    }
    
    /**
     * Handle sync toggle
     */
    private function handle_sync_toggle() {
        $sync_enabled = isset($_POST['sync_enabled']) ? $_POST['sync_enabled'] : array();
        
        // Validate sync types
        $valid_sync_types = array('customers', 'orders', 'products');
        $validated_sync = array();
        
        foreach ($valid_sync_types as $sync_type) {
            $validated_sync[$sync_type] = isset($sync_enabled[$sync_type]) && $sync_enabled[$sync_type] === '1';
        }
        
        // Update settings
        $this->config->set('sync_enabled', $validated_sync);
        $this->settings = $this->config->get_all_settings();
        
        $logger = WP_CRM_Integration_Logger::get_instance();
        $logger->info('Sync settings updated via monitoring dashboard', array(
            'sync_enabled' => $validated_sync,
            'updated_by_user' => get_current_user_id()
        ));
        
        echo '<div class="notice notice-success"><p>' . 
             __('Sync settings updated successfully.', 'wordpress-crm-integration') . 
             '</p></div>';
    }
    
    /**
     * Handle manual sync test
     */
    private function handle_manual_sync_test() {
        $sync_type = isset($_POST['sync_type']) ? sanitize_text_field($_POST['sync_type']) : '';
        
        if (!in_array($sync_type, array('customer', 'order', 'product'))) {
            echo '<div class="notice notice-error"><p>' . 
                 __('Invalid sync type specified.', 'wordpress-crm-integration') . 
                 '</p></div>';
            return;
        }
        
        // Generate sample data and test sync
        $sample_data = $this->generate_sample_sync_data($sync_type);
        
        if (!$sample_data) {
            echo '<div class="notice notice-error"><p>' . 
                 __('Failed to generate sample data for testing.', 'wordpress-crm-integration') . 
                 '</p></div>';
            return;
        }
        
        // Perform test sync
        require_once WP_CRM_INTEGRATION_PLUGIN_DIR . 'includes/class-wp-crm-integration-api-client.php';
        
        $api_client = new WP_CRM_Integration_API_Client(
            $this->settings['crm_url'],
            $this->settings['api_key'],
            isset($this->settings['tenant_key']) ? $this->settings['tenant_key'] : ''
        );
        
        $result = $api_client->send_data($sync_type . 's', $sample_data);
        
        if ($result['success']) {
            echo '<div class="notice notice-success"><p>' . 
                 sprintf(__('%s sync test completed successfully.', 'wordpress-crm-integration'), ucfirst($sync_type)) . 
                 '</p></div>';
        } else {
            echo '<div class="notice notice-error"><p>' . 
                 sprintf(__('%s sync test failed: %s', 'wordpress-crm-integration'), ucfirst($sync_type), $result['message']) . 
                 '</p></div>';
        }
    }
    
    /**
     * Generate sample sync data for testing
     */
    private function generate_sample_sync_data($sync_type) {
        switch ($sync_type) {
            case 'customer':
                return array(
                    'source' => 'wordpress',
                    'wordpress_user_id' => 999999,
                    'email' => 'test@example.com',
                    'first_name' => 'Test',
                    'last_name' => 'User',
                    'phone' => '+1234567890',
                    'company_name' => 'Test Company',
                    'address' => '123 Test Street',
                    'city' => 'Test City',
                    'state' => 'Test State',
                    'country' => 'Test Country',
                    'postal_code' => '12345',
                    'registration_date' => current_time('mysql'),
                    'metadata' => array(
                        'test_sync' => true,
                        'generated_at' => current_time('mysql')
                    )
                );
                
            case 'order':
                return array(
                    'source' => 'wordpress',
                    'wordpress_order_id' => 999999,
                    'customer_email' => 'test@example.com',
                    'total_amount' => 99.99,
                    'currency' => 'USD',
                    'status' => 'completed',
                    'order_date' => current_time('mysql'),
                    'billing_info' => array(
                        'first_name' => 'Test',
                        'last_name' => 'User',
                        'address' => '123 Test Street',
                        'city' => 'Test City',
                        'state' => 'Test State',
                        'country' => 'Test Country',
                        'postal_code' => '12345'
                    ),
                    'line_items' => array(
                        array(
                            'product_name' => 'Test Product',
                            'quantity' => 1,
                            'unit_price' => 99.99,
                            'total_price' => 99.99,
                            'sku' => 'TEST-SKU-001'
                        )
                    ),
                    'metadata' => array(
                        'test_sync' => true,
                        'generated_at' => current_time('mysql')
                    )
                );
                
            case 'product':
                return array(
                    'source' => 'wordpress',
                    'wordpress_product_id' => 999999,
                    'name' => 'Test Product',
                    'description' => 'This is a test product for sync testing.',
                    'sku' => 'TEST-SKU-001',
                    'price' => 99.99,
                    'currency' => 'USD',
                    'category' => 'Test Category',
                    'status' => 'active',
                    'metadata' => array(
                        'test_sync' => true,
                        'generated_at' => current_time('mysql')
                    )
                );
                
            default:
                return null;
        }
        
        $fields = array();
        
        switch ($entity_type) {
            case 'customer':
                $fields = array(
                    'email' => array(
                        'label' => __('Email Address', 'wordpress-crm-integration'),
                        'required' => true,
                        'description' => __('Customer email address (required)', 'wordpress-crm-integration')
                    ),
                    'first_name' => array(
                        'label' => __('First Name', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'last_name' => array(
                        'label' => __('Last Name', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'phone' => array(
                        'label' => __('Phone Number', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'company_name' => array(
                        'label' => __('Company Name', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'address' => array(
                        'label' => __('Address', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'city' => array(
                        'label' => __('City', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'state' => array(
                        'label' => __('State/Province', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'country' => array(
                        'label' => __('Country', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'postal_code' => array(
                        'label' => __('Postal Code', 'wordpress-crm-integration'),
                        'required' => false
                    )
                );
                break;
                
            case 'order':
                $fields = array(
                    'customer_email' => array(
                        'label' => __('Customer Email', 'wordpress-crm-integration'),
                        'required' => true
                    ),
                    'total_amount' => array(
                        'label' => __('Total Amount', 'wordpress-crm-integration'),
                        'required' => true
                    ),
                    'currency' => array(
                        'label' => __('Currency', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'status' => array(
                        'label' => __('Order Status', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'order_date' => array(
                        'label' => __('Order Date', 'wordpress-crm-integration'),
                        'required' => false
                    )
                );
                break;
                
            case 'product':
                $fields = array(
                    'name' => array(
                        'label' => __('Product Name', 'wordpress-crm-integration'),
                        'required' => true
                    ),
                    'description' => array(
                        'label' => __('Description', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'sku' => array(
                        'label' => __('SKU', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'price' => array(
                        'label' => __('Price', 'wordpress-crm-integration'),
                        'required' => false
                    ),
                    'category' => array(
                        'label' => __('Category', 'wordpress-crm-integration'),
                        'required' => false
                    )
                );
                break;
        }
        
        return apply_filters('wp_crm_integration_crm_fields', $fields, $entity_type);
    }
    
    /**
     * Get WordPress fields for select dropdown
     */
    private function get_wordpress_fields_for_select() {
        require_once WP_CRM_INTEGRATION_PLUGIN_DIR . 'includes/class-wp-crm-integration-field-mapper.php';
        
        $field_mapper = new WP_CRM_Integration_Field_Mapper();
        return $field_mapper->get_available_wordpress_fields();
    }
    
    /**
     * Render connection settings section
     */
    public function render_connection_section() {
        echo '<p>' . __('Configure your CRM connection settings below. Make sure to test the connection before enabling synchronization.', 'wordpress-crm-integration') . '</p>';
    }
    
    /**
     * Render sync settings section
     */
    public function render_sync_section() {
        echo '<p>' . __('Choose which data types to synchronize with your CRM system.', 'wordpress-crm-integration') . '</p>';
    }
    
    /**
     * Render CRM URL field
     */
    public function render_crm_url_field() {
        $value = isset($this->settings['crm_url']) ? $this->settings['crm_url'] : '';
        ?>
        <input type="url" 
               id="crm_url" 
               name="wp_crm_integration_settings[crm_url]" 
               value="<?php echo esc_attr($value); ?>" 
               class="regular-text" 
               placeholder="https://your-crm-domain.com" />
        <p class="description">
            <?php _e('Enter the base URL of your CRM system (e.g., https://your-crm-domain.com)', 'wordpress-crm-integration'); ?>
        </p>
        <?php
    }
    
    /**
     * Render API key field
     */
    public function render_api_key_field() {
        $value = isset($this->settings['api_key']) ? $this->settings['api_key'] : '';
        ?>
        <input type="password" 
               id="api_key" 
               name="wp_crm_integration_settings[api_key]" 
               value="<?php echo esc_attr($value); ?>" 
               class="regular-text" 
               placeholder="<?php _e('Enter your API key', 'wordpress-crm-integration'); ?>" />
        <p class="description">
            <?php _e('Your CRM API key for authentication', 'wordpress-crm-integration'); ?>
        </p>
        <?php
    }
    
    /**
     * Render tenant key field
     */
    public function render_tenant_key_field() {
        $value = isset($this->settings['tenant_key']) ? $this->settings['tenant_key'] : '';
        ?>
        <input type="text" 
               id="tenant_key" 
               name="wp_crm_integration_settings[tenant_key]" 
               value="<?php echo esc_attr($value); ?>" 
               class="regular-text" 
               placeholder="<?php _e('Optional tenant key', 'wordpress-crm-integration'); ?>" />
        <p class="description">
            <?php _e('Optional: Tenant key for multi-tenant CRM systems', 'wordpress-crm-integration'); ?>
        </p>
        <?php
    }
    
    /**
     * Render sync enabled field
     */
    public function render_sync_enabled_field() {
        $sync_enabled = isset($this->settings['sync_enabled']) ? $this->settings['sync_enabled'] : array();
        
        $sync_types = array(
            'customers' => __('Customer Data', 'wordpress-crm-integration'),
            'orders' => __('WooCommerce Orders', 'wordpress-crm-integration'),
            'products' => __('Products', 'wordpress-crm-integration')
        );
        
        foreach ($sync_types as $type => $label) {
            $checked = isset($sync_enabled[$type]) && $sync_enabled[$type];
            $disabled = ($type === 'orders' || $type === 'products') && !$this->is_woocommerce_active() ? 'disabled' : '';
            ?>
            <label>
                <input type="checkbox" 
                       name="wp_crm_integration_settings[sync_enabled][<?php echo esc_attr($type); ?>]" 
                       value="1" 
                       <?php checked($checked); ?>
                       <?php echo $disabled; ?> />
                <?php echo esc_html($label); ?>
                <?php if ($disabled): ?>
                    <em><?php _e('(WooCommerce required)', 'wordpress-crm-integration'); ?></em>
                <?php endif; ?>
            </label><br>
            <?php
        }
    }
    
    /**
     * Render admin sidebar
     */
    private function render_sidebar() {
        ?>
        <div class="wp-crm-integration-sidebar-box">
            <h3><?php _e('Sync Status', 'wordpress-crm-integration'); ?></h3>
            <div id="wp-crm-sync-status">
                <?php $this->render_sync_status(); ?>
            </div>
        </div>
        
        <div class="wp-crm-integration-sidebar-box">
            <h3><?php _e('System Information', 'wordpress-crm-integration'); ?></h3>
            <ul>
                <li><strong><?php _e('WordPress Version:', 'wordpress-crm-integration'); ?></strong> <?php echo get_bloginfo('version'); ?></li>
                <li><strong><?php _e('PHP Version:', 'wordpress-crm-integration'); ?></strong> <?php echo PHP_VERSION; ?></li>
                <li><strong><?php _e('WooCommerce:', 'wordpress-crm-integration'); ?></strong> 
                    <?php echo $this->is_woocommerce_active() ? __('Active', 'wordpress-crm-integration') : __('Not Active', 'wordpress-crm-integration'); ?>
                </li>
                <li><strong><?php _e('Plugin Version:', 'wordpress-crm-integration'); ?></strong> <?php echo WP_CRM_INTEGRATION_VERSION; ?></li>
            </ul>
        </div>
        
        <div class="wp-crm-integration-sidebar-box">
            <h3><?php _e('Quick Actions', 'wordpress-crm-integration'); ?></h3>
            <p>
                <a href="<?php echo admin_url('admin.php?page=wp-crm-integration&tab=field-mapping'); ?>" class="button button-secondary">
                    <?php _e('Configure Field Mapping', 'wordpress-crm-integration'); ?>
                </a>
            </p>
            <p>
                <a href="<?php echo admin_url('admin.php?page=wp-crm-integration&tab=logs'); ?>" class="button button-secondary">
                    <?php _e('View Sync Logs', 'wordpress-crm-integration'); ?>
                </a>
            </p>
        </div>
        <?php
    }
    
    /**
     * Render sync status
     */
    private function render_sync_status() {
        $sync_enabled = isset($this->settings['sync_enabled']) ? $this->settings['sync_enabled'] : array();
        $has_credentials = !empty($this->settings['crm_url']) && !empty($this->settings['api_key']);
        
        if (!$has_credentials) {
            echo '<p class="wp-crm-status-warning">' . __('Please configure CRM credentials first.', 'wordpress-crm-integration') . '</p>';
            return;
        }
        
        $active_syncs = array_filter($sync_enabled);
        if (empty($active_syncs)) {
            echo '<p class="wp-crm-status-info">' . __('No sync types enabled.', 'wordpress-crm-integration') . '</p>';
        } else {
            echo '<p class="wp-crm-status-success">' . sprintf(__('%d sync type(s) active', 'wordpress-crm-integration'), count($active_syncs)) . '</p>';
        }
    }
    
    /**
     * Validate settings
     */
    public function validate_settings($input) {
        $validated = array();
        
        // Validate CRM URL
        if (!empty($input['crm_url'])) {
            $validated['crm_url'] = esc_url_raw($input['crm_url']);
            if (!$validated['crm_url']) {
                add_settings_error(
                    'wp_crm_integration_settings',
                    'invalid_crm_url',
                    __('Please enter a valid CRM URL.', 'wordpress-crm-integration')
                );
            }
        }
        
        // Validate API key
        if (!empty($input['api_key'])) {
            $validated['api_key'] = sanitize_text_field($input['api_key']);
        }
        
        // Validate tenant key
        if (!empty($input['tenant_key'])) {
            $validated['tenant_key'] = sanitize_text_field($input['tenant_key']);
        }
        
        // Validate sync settings
        if (isset($input['sync_enabled']) && is_array($input['sync_enabled'])) {
            $validated['sync_enabled'] = array();
            foreach ($input['sync_enabled'] as $type => $enabled) {
                if (in_array($type, array('customers', 'orders', 'products'))) {
                    $validated['sync_enabled'][$type] = (bool) $enabled;
                }
            }
        }
        
        // Preserve other settings
        $current_settings = get_option('wp_crm_integration_settings', array());
        $validated = array_merge($current_settings, $validated);
        
        return $validated;
    }
    
    /**
     * Save settings
     */
    private function save_settings() {
        // Handle field mapping save
        if (isset($_POST['save_field_mappings']) && check_admin_referer('wp_crm_integration_field_mapping_nonce')) {
            $this->save_field_mappings();
            return;
        }
        
        // Handle general settings save
        if (!isset($_POST['wp_crm_integration_settings'])) {
            return;
        }
        
        $settings = $this->validate_settings($_POST['wp_crm_integration_settings']);
        
        if ($this->config->update_settings($settings)) {
            $this->settings = $this->config->get_all_settings();
            add_settings_error(
                'wp_crm_integration_settings',
                'settings_saved',
                __('Settings saved successfully.', 'wordpress-crm-integration'),
                'updated'
            );
        } else {
            add_settings_error(
                'wp_crm_integration_settings',
                'settings_save_failed',
                __('Failed to save settings. Please check your configuration.', 'wordpress-crm-integration'),
                'error'
            );
        }
    }
    
    /**
     * Save field mappings
     */
    private function save_field_mappings() {
        if (!isset($_POST['wp_crm_integration_field_mappings'])) {
            return;
        }
        
        $field_mappings = $_POST['wp_crm_integration_field_mappings'];
        $validated_mappings = array();
        
        // Validate field mappings
        foreach ($field_mappings as $entity_type => $mappings) {
            if (!in_array($entity_type, array('customer', 'order', 'product'))) {
                continue;
            }
            
            $validated_mappings[$entity_type] = array();
            
            foreach ($mappings as $crm_field => $wp_field) {
                $crm_field = sanitize_text_field($crm_field);
                $wp_field = sanitize_text_field($wp_field);
                
                if (!empty($wp_field)) {
                    $validated_mappings[$entity_type][$crm_field] = $wp_field;
                }
            }
        }
        
        // Update settings
        $this->config->set('field_mappings', $validated_mappings);
        $this->settings = $this->config->get_all_settings();
        
        // Validate required fields
        $validation_errors = $this->validate_field_mappings($validated_mappings);
        
        if (empty($validation_errors)) {
            add_settings_error(
                'wp_crm_integration_settings',
                'field_mappings_saved',
                __('Field mappings saved successfully.', 'wordpress-crm-integration'),
                'updated'
            );
        } else {
            foreach ($validation_errors as $error) {
                add_settings_error(
                    'wp_crm_integration_settings',
                    'field_mapping_error',
                    $error,
                    'error'
                );
            }
        }
    }
    
    /**
     * Validate field mappings
     */
    private function validate_field_mappings($field_mappings) {
        $errors = array();
        
        // Check required customer fields
        if (isset($field_mappings['customer'])) {
            if (empty($field_mappings['customer']['email'])) {
                $errors[] = __('Customer email field mapping is required.', 'wordpress-crm-integration');
            }
        }
        
        // Check required order fields if WooCommerce is active and orders are enabled
        if ($this->is_woocommerce_active() && 
            isset($this->settings['sync_enabled']['orders']) && 
            $this->settings['sync_enabled']['orders']) {
            
            if (isset($field_mappings['order'])) {
                if (empty($field_mappings['order']['customer_email'])) {
                    $errors[] = __('Order customer email field mapping is required.', 'wordpress-crm-integration');
                }
                if (empty($field_mappings['order']['total_amount'])) {
                    $errors[] = __('Order total amount field mapping is required.', 'wordpress-crm-integration');
                }
            }
        }
        
        // Check required product fields if WooCommerce is active and products are enabled
        if ($this->is_woocommerce_active() && 
            isset($this->settings['sync_enabled']['products']) && 
            $this->settings['sync_enabled']['products']) {
            
            if (isset($field_mappings['product'])) {
                if (empty($field_mappings['product']['name'])) {
                    $errors[] = __('Product name field mapping is required.', 'wordpress-crm-integration');
                }
            }
        }
        
        return $errors;
    }
    
    /**
     * AJAX handler for connection testing
     */
    public function ajax_test_connection() {
        check_ajax_referer('wp_crm_integration_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions'));
        }
        
        $crm_url = sanitize_text_field($_POST['crm_url']);
        $api_key = sanitize_text_field($_POST['api_key']);
        $tenant_key = isset($_POST['tenant_key']) ? sanitize_text_field($_POST['tenant_key']) : '';
        
        if (empty($crm_url) || empty($api_key)) {
            wp_send_json_error(array(
                'message' => __('CRM URL and API Key are required.', 'wordpress-crm-integration'),
                'error_code' => 'MISSING_CREDENTIALS'
            ));
        }
        
        // Test connection using API client
        require_once WP_CRM_INTEGRATION_PLUGIN_DIR . 'includes/class-wp-crm-integration-api-client.php';
        
        $api_client = new WP_CRM_Integration_API_Client($crm_url, $api_key, $tenant_key);
        
        // Get comprehensive connection status
        $status = $api_client->get_connection_status();
        
        if ($status['can_connect']) {
            // Test individual endpoints
            $endpoint_tests = array();
            foreach (array('customers', 'orders', 'products') as $endpoint_type) {
                $endpoint_tests[$endpoint_type] = $api_client->test_endpoint($endpoint_type);
            }
            
            wp_send_json_success(array(
                'message' => $status['message'],
                'connection_data' => isset($status['connection_data']) ? $status['connection_data'] : array(),
                'endpoint_tests' => $endpoint_tests,
                'last_tested' => $status['last_tested']
            ));
        } else {
            wp_send_json_error(array(
                'message' => $status['message'],
                'error_code' => isset($status['error_code']) ? $status['error_code'] : 'CONNECTION_FAILED',
                'errors' => isset($status['errors']) ? $status['errors'] : array(),
                'last_tested' => isset($status['last_tested']) ? $status['last_tested'] : current_time('mysql')
            ));
        }
    }
    
    /**
     * AJAX handler for credential validation
     */
    public function ajax_validate_credentials() {
        check_ajax_referer('wp_crm_integration_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions'));
        }
        
        $crm_url = sanitize_text_field($_POST['crm_url']);
        $api_key = sanitize_text_field($_POST['api_key']);
        $tenant_key = isset($_POST['tenant_key']) ? sanitize_text_field($_POST['tenant_key']) : '';
        
        require_once WP_CRM_INTEGRATION_PLUGIN_DIR . 'includes/class-wp-crm-integration-api-client.php';
        
        $api_client = new WP_CRM_Integration_API_Client($crm_url, $api_key, $tenant_key);
        $validation = $api_client->validate_credentials();
        
        if ($validation['valid']) {
            wp_send_json_success(array(
                'message' => __('Credentials are valid', 'wordpress-crm-integration'),
                'valid' => true
            ));
        } else {
            wp_send_json_error(array(
                'message' => __('Invalid credentials', 'wordpress-crm-integration'),
                'errors' => $validation['errors'],
                'valid' => false
            ));
        }
    }
    
    /**
     * AJAX handler for getting connection status
     */
    public function ajax_get_connection_status() {
        check_ajax_referer('wp_crm_integration_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions'));
        }
        
        $settings = $this->config->get_all_settings();
        
        if (empty($settings['crm_url']) || empty($settings['api_key'])) {
            wp_send_json_error(array(
                'message' => __('Please configure CRM credentials first', 'wordpress-crm-integration'),
                'status' => 'not_configured'
            ));
        }
        
        require_once WP_CRM_INTEGRATION_PLUGIN_DIR . 'includes/class-wp-crm-integration-api-client.php';
        
        $api_client = new WP_CRM_Integration_API_Client(
            $settings['crm_url'],
            $settings['api_key'],
            isset($settings['tenant_key']) ? $settings['tenant_key'] : ''
        );
        
        $status = $api_client->get_connection_status();
        
        wp_send_json_success($status);
    }
    
    /**
     * AJAX handler for getting WordPress fields
     */
    public function ajax_get_wordpress_fields() {
        check_ajax_referer('wp_crm_integration_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions'));
        }
        
        require_once WP_CRM_INTEGRATION_PLUGIN_DIR . 'includes/class-wp-crm-integration-field-mapper.php';
        
        $field_mapper = new WP_CRM_Integration_Field_Mapper();
        $fields = $field_mapper->get_available_wordpress_fields();
        
        wp_send_json_success($fields);
    }
    
    /**
     * AJAX handler for manual sync testing
     */
    public function ajax_test_manual_sync() {
        check_ajax_referer('wp_crm_integration_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions'));
        }
        
        $sync_type = isset($_POST['sync_type']) ? sanitize_text_field($_POST['sync_type']) : '';
        
        if (!in_array($sync_type, array('customer', 'order', 'product'))) {
            wp_send_json_error(array(
                'message' => __('Invalid sync type specified.', 'wordpress-crm-integration')
            ));
        }
        
        // Check if sync type is enabled
        $sync_enabled = isset($this->settings['sync_enabled']) ? $this->settings['sync_enabled'] : array();
        $sync_key = $sync_type . 's';
        
        if (!isset($sync_enabled[$sync_key]) || !$sync_enabled[$sync_key]) {
            wp_send_json_error(array(
                'message' => sprintf(__('%s sync is not enabled.', 'wordpress-crm-integration'), ucfirst($sync_type))
            ));
        }
        
        // Generate sample data
        $sample_data = $this->generate_sample_sync_data($sync_type);
        
        if (!$sample_data) {
            wp_send_json_error(array(
                'message' => __('Failed to generate sample data for testing.', 'wordpress-crm-integration')
            ));
        }
        
        // Perform test sync
        require_once WP_CRM_INTEGRATION_PLUGIN_DIR . 'includes/class-wp-crm-integration-api-client.php';
        
        $api_client = new WP_CRM_Integration_API_Client(
            $this->settings['crm_url'],
            $this->settings['api_key'],
            isset($this->settings['tenant_key']) ? $this->settings['tenant_key'] : ''
        );
        
        $start_time = microtime(true);
        $result = $api_client->send_data($sync_type . 's', $sample_data);
        $execution_time = microtime(true) - $start_time;
        
        // Log the test
        $logger = WP_CRM_Integration_Logger::get_instance();
        $logger->info("Manual sync test performed", array(
            'sync_type' => $sync_type,
            'result' => $result,
            'execution_time' => $execution_time,
            'user_id' => get_current_user_id()
        ), $sync_type, 999999, 'manual_test');
        
        if ($result['success']) {
            wp_send_json_success(array(
                'message' => sprintf(
                    __('%s sync test completed successfully in %.2f seconds.', 'wordpress-crm-integration'), 
                    ucfirst($sync_type), 
                    $execution_time
                ),
                'execution_time' => $execution_time,
                'result' => $result
            ));
        } else {
            wp_send_json_error(array(
                'message' => sprintf(
                    __('%s sync test failed: %s', 'wordpress-crm-integration'), 
                    ucfirst($sync_type), 
                    $result['message']
                ),
                'execution_time' => $execution_time,
                'error_details' => $result
            ));
        }
    }
    
    /**
     * AJAX handler for resetting failure threshold
     */
    public function ajax_reset_failure_threshold() {
        check_ajax_referer('wp_crm_integration_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions'));
        }
        
        $retry_handler = WP_CRM_Integration_Retry_Handler::get_instance();
        $result = $retry_handler->reset_failure_counters();
        
        if ($result) {
            wp_send_json_success(array(
                'message' => __('Failure counters have been reset. Sync operations will resume automatically.', 'wordpress-crm-integration')
            ));
        } else {
            wp_send_json_error(array(
                'message' => __('Failed to reset failure counters. Please try again.', 'wordpress-crm-integration')
            ));
        }
    }
    
    /**
     * AJAX handler for getting sync status
     */
    public function ajax_get_sync_status() {
        check_ajax_referer('wp_crm_integration_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions'));
        }
        
        $logger = WP_CRM_Integration_Logger::get_instance();
        $retry_handler = WP_CRM_Integration_Retry_Handler::get_instance();
        
        // Get current statistics
        $sync_stats = $logger->get_log_statistics(24);
        $failure_check = $retry_handler->check_failure_threshold();
        $sync_enabled = isset($this->settings['sync_enabled']) ? $this->settings['sync_enabled'] : array();
        
        // Calculate metrics
        $total_operations = 0;
        $error_operations = 0;
        foreach ($sync_stats['level_stats'] as $level_stat) {
            $total_operations += $level_stat->count;
            if (in_array($level_stat->level, array('error', 'critical'))) {
                $error_operations += $level_stat->count;
            }
        }
        
        $success_rate = $total_operations > 0 ? round((($total_operations - $error_operations) / $total_operations) * 100, 1) : 0;
        $overall_status = $this->get_overall_sync_status($failure_check, $sync_enabled);
        
        wp_send_json_success(array(
            'overall_status' => $overall_status,
            'statistics' => array(
                'total_operations' => $total_operations,
                'error_operations' => $error_operations,
                'success_rate' => $success_rate
            ),
            'failure_check' => $failure_check,
            'sync_enabled' => $sync_enabled,
            'last_updated' => current_time('mysql')
        ));
    }
    
    /**
     * AJAX handler for toggling sync status
     */
    public function ajax_toggle_sync() {
        check_ajax_referer('wp_crm_integration_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions'));
        }
        
        $sync_type = isset($_POST['sync_type']) ? sanitize_text_field($_POST['sync_type']) : '';
        $enabled = isset($_POST['enabled']) ? (bool) $_POST['enabled'] : false;
        
        if (!in_array($sync_type, array('customers', 'orders', 'products'))) {
            wp_send_json_error(array(
                'message' => __('Invalid sync type specified.', 'wordpress-crm-integration')
            ));
        }
        
        // Update sync settings
        $sync_enabled = isset($this->settings['sync_enabled']) ? $this->settings['sync_enabled'] : array();
        $sync_enabled[$sync_type] = $enabled;
        
        $this->config->set('sync_enabled', $sync_enabled);
        $this->settings = $this->config->get_all_settings();
        
        // Log the change
        $logger = WP_CRM_Integration_Logger::get_instance();
        $logger->info("Sync status toggled via AJAX", array(
            'sync_type' => $sync_type,
            'enabled' => $enabled,
            'user_id' => get_current_user_id()
        ));
        
        wp_send_json_success(array(
            'message' => sprintf(
                __('%s sync has been %s.', 'wordpress-crm-integration'),
                ucfirst($sync_type),
                $enabled ? __('enabled', 'wordpress-crm-integration') : __('disabled', 'wordpress-crm-integration')
            ),
            'sync_type' => $sync_type,
            'enabled' => $enabled
        ));
    }
    
    /**
     * Render backup and restore tab
     */
    private function render_backup_tab() {
        $migration = WP_CRM_Integration_Migration::get_instance();
        $backups = $migration->get_backups();
        
        ?>
        <div class="wp-crm-backup-container">
            <h2><?php _e('Configuration Backup & Restore', 'wordpress-crm-integration'); ?></h2>
            <p><?php _e('Create backups of your plugin configuration and restore them when needed. Backups are automatically created before plugin updates.', 'wordpress-crm-integration'); ?></p>
            
            <!-- Create Backup Section -->
            <div class="wp-crm-backup-section">
                <h3><?php _e('Create New Backup', 'wordpress-crm-integration'); ?></h3>
                <div class="wp-crm-backup-create">
                    <input type="text" id="backup-name" placeholder="<?php esc_attr_e('Optional backup name', 'wordpress-crm-integration'); ?>" />
                    <button type="button" id="create-backup" class="button button-primary">
                        <?php _e('Create Backup', 'wordpress-crm-integration'); ?>
                    </button>
                </div>
                <p class="description">
                    <?php _e('If no name is provided, a timestamp will be used automatically.', 'wordpress-crm-integration'); ?>
                </p>
            </div>
            
            <!-- Export/Import Section -->
            <div class="wp-crm-backup-section">
                <h3><?php _e('Export & Import Configuration', 'wordpress-crm-integration'); ?></h3>
                <div class="wp-crm-export-import">
                    <button type="button" id="export-config" class="button button-secondary">
                        <?php _e('Export Configuration', 'wordpress-crm-integration'); ?>
                    </button>
                    
                    <div class="wp-crm-import-section">
                        <input type="file" id="import-file" accept=".json" style="display: none;" />
                        <button type="button" id="import-config" class="button button-secondary">
                            <?php _e('Import Configuration', 'wordpress-crm-integration'); ?>
                        </button>
                    </div>
                </div>
                <p class="description">
                    <?php _e('Export your configuration to a JSON file or import from a previously exported file.', 'wordpress-crm-integration'); ?>
                </p>
            </div>
            
            <!-- Existing Backups Section -->
            <div class="wp-crm-backup-section">
                <h3><?php _e('Existing Backups', 'wordpress-crm-integration'); ?></h3>
                
                <?php if (empty($backups)): ?>
                    <p class="wp-crm-no-backups">
                        <?php _e('No backups found. Create your first backup above.', 'wordpress-crm-integration'); ?>
                    </p>
                <?php else: ?>
                    <div class="wp-crm-backups-table-container">
                        <table class="wp-list-table widefat fixed striped">
                            <thead>
                                <tr>
                                    <th><?php _e('Backup Name', 'wordpress-crm-integration'); ?></th>
                                    <th><?php _e('Created', 'wordpress-crm-integration'); ?></th>
                                    <th><?php _e('Plugin Version', 'wordpress-crm-integration'); ?></th>
                                    <th><?php _e('Type', 'wordpress-crm-integration'); ?></th>
                                    <th><?php _e('Settings Count', 'wordpress-crm-integration'); ?></th>
                                    <th><?php _e('Actions', 'wordpress-crm-integration'); ?></th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($backups as $backup): ?>
                                    <tr>
                                        <td>
                                            <strong><?php echo esc_html($backup['id']); ?></strong>
                                            <?php if (isset($backup['user_login'])): ?>
                                                <br><small><?php printf(__('by %s', 'wordpress-crm-integration'), esc_html($backup['user_login'])); ?></small>
                                            <?php endif; ?>
                                        </td>
                                        <td>
                                            <?php echo esc_html(date_i18n(get_option('date_format') . ' ' . get_option('time_format'), strtotime($backup['created_at']))); ?>
                                        </td>
                                        <td><?php echo esc_html($backup['plugin_version']); ?></td>
                                        <td>
                                            <span class="wp-crm-backup-type wp-crm-backup-type-<?php echo esc_attr($backup['backup_type']); ?>">
                                                <?php echo esc_html(ucfirst($backup['backup_type'])); ?>
                                            </span>
                                        </td>
                                        <td><?php echo esc_html($backup['settings_count']); ?></td>
                                        <td>
                                            <button type="button" 
                                                    class="button button-small restore-backup" 
                                                    data-backup-id="<?php echo esc_attr($backup['id']); ?>">
                                                <?php _e('Restore', 'wordpress-crm-integration'); ?>
                                            </button>
                                            <button type="button" 
                                                    class="button button-small button-link-delete delete-backup" 
                                                    data-backup-id="<?php echo esc_attr($backup['id']); ?>">
                                                <?php _e('Delete', 'wordpress-crm-integration'); ?>
                                            </button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
            
            <!-- Migration Log Section -->
            <div class="wp-crm-backup-section">
                <h3><?php _e('Migration History', 'wordpress-crm-integration'); ?></h3>
                <?php
                $migration_log = $migration->get_migration_log();
                if (empty($migration_log)):
                ?>
                    <p><?php _e('No migration history available.', 'wordpress-crm-integration'); ?></p>
                <?php else: ?>
                    <div class="wp-crm-migration-log">
                        <?php foreach (array_slice(array_reverse($migration_log), 0, 10) as $entry): ?>
                            <div class="wp-crm-migration-entry wp-crm-migration-<?php echo esc_attr($entry['level']); ?>">
                                <div class="wp-crm-migration-header">
                                    <span class="wp-crm-migration-time">
                                        <?php echo esc_html(date_i18n(get_option('date_format') . ' ' . get_option('time_format'), $entry['timestamp'])); ?>
                                    </span>
                                    <span class="wp-crm-migration-level"><?php echo esc_html(strtoupper($entry['level'])); ?></span>
                                </div>
                                <div class="wp-crm-migration-message">
                                    <?php echo esc_html($entry['message']); ?>
                                    <?php if (isset($entry['version_from']) && isset($entry['version_to'])): ?>
                                        <small>(<?php printf(__('from %s to %s', 'wordpress-crm-integration'), $entry['version_from'], $entry['version_to']); ?>)</small>
                                    <?php endif; ?>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    
                    <button type="button" id="clear-migration-log" class="button button-secondary">
                        <?php _e('Clear Migration Log', 'wordpress-crm-integration'); ?>
                    </button>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }
    
    /**
     * AJAX handler for creating backup
     */
    public function ajax_create_backup() {
        check_ajax_referer('wp_crm_integration_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array(
                'message' => __('Insufficient permissions', 'wordpress-crm-integration')
            ));
        }
        
        $backup_name = sanitize_text_field($_POST['backup_name'] ?? '');
        $migration = WP_CRM_Integration_Migration::get_instance();
        $backup_id = $migration->create_backup($backup_name);
        
        if ($backup_id) {
            wp_send_json_success(array(
                'backup_id' => $backup_id,
                'message' => __('Backup created successfully', 'wordpress-crm-integration')
            ));
        } else {
            wp_send_json_error(array(
                'message' => __('Failed to create backup', 'wordpress-crm-integration')
            ));
        }
    }
    
    /**
     * AJAX handler for restoring backup
     */
    public function ajax_restore_backup() {
        check_ajax_referer('wp_crm_integration_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array(
                'message' => __('Insufficient permissions', 'wordpress-crm-integration')
            ));
        }
        
        $backup_id = sanitize_text_field($_POST['backup_id'] ?? '');
        
        if (empty($backup_id)) {
            wp_send_json_error(array(
                'message' => __('Invalid backup ID', 'wordpress-crm-integration')
            ));
        }
        
        $migration = WP_CRM_Integration_Migration::get_instance();
        $result = $migration->restore_backup($backup_id);
        
        if ($result) {
            wp_send_json_success(array(
                'message' => __('Backup restored successfully', 'wordpress-crm-integration')
            ));
        } else {
            wp_send_json_error(array(
                'message' => __('Failed to restore backup', 'wordpress-crm-integration')
            ));
        }
    }
    
    /**
     * AJAX handler for deleting backup
     */
    public function ajax_delete_backup() {
        check_ajax_referer('wp_crm_integration_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array(
                'message' => __('Insufficient permissions', 'wordpress-crm-integration')
            ));
        }
        
        $backup_id = sanitize_text_field($_POST['backup_id'] ?? '');
        
        if (empty($backup_id)) {
            wp_send_json_error(array(
                'message' => __('Invalid backup ID', 'wordpress-crm-integration')
            ));
        }
        
        $migration = WP_CRM_Integration_Migration::get_instance();
        $result = $migration->delete_backup($backup_id);
        
        if ($result) {
            wp_send_json_success(array(
                'message' => __('Backup deleted successfully', 'wordpress-crm-integration')
            ));
        } else {
            wp_send_json_error(array(
                'message' => __('Failed to delete backup', 'wordpress-crm-integration')
            ));
        }
    }
    
    /**
     * AJAX handler for exporting configuration
     */
    public function ajax_export_config() {
        check_ajax_referer('wp_crm_integration_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array(
                'message' => __('Insufficient permissions', 'wordpress-crm-integration')
            ));
        }
        
        $migration = WP_CRM_Integration_Migration::get_instance();
        $export_data = $migration->export_configuration();
        
        if ($export_data) {
            wp_send_json_success(array(
                'data' => $export_data,
                'filename' => 'wp-crm-integration-config-' . date('Y-m-d-H-i-s') . '.json',
                'message' => __('Configuration exported successfully', 'wordpress-crm-integration')
            ));
        } else {
            wp_send_json_error(array(
                'message' => __('Failed to export configuration', 'wordpress-crm-integration')
            ));
        }
    }
    
    /**
     * AJAX handler for importing configuration
     */
    public function ajax_import_config() {
        check_ajax_referer('wp_crm_integration_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array(
                'message' => __('Insufficient permissions', 'wordpress-crm-integration')
            ));
        }
        
        if (!isset($_POST['config_data'])) {
            wp_send_json_error(array(
                'message' => __('No configuration data provided', 'wordpress-crm-integration')
            ));
        }
        
        $config_data = json_decode(stripslashes($_POST['config_data']), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error(array(
                'message' => __('Invalid JSON data', 'wordpress-crm-integration')
            ));
        }
        
        $migration = WP_CRM_Integration_Migration::get_instance();
        $result = $migration->import_configuration($config_data);
        
        if ($result) {
            wp_send_json_success(array(
                'message' => __('Configuration imported successfully', 'wordpress-crm-integration')
            ));
        } else {
            wp_send_json_error(array(
                'message' => __('Failed to import configuration', 'wordpress-crm-integration')
            ));
        }
    }
    
    /**
     * AJAX handler for clearing migration log
     */
    public function ajax_clear_migration_log() {
        check_ajax_referer('wp_crm_integration_admin', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array(
                'message' => __('Insufficient permissions', 'wordpress-crm-integration')
            ));
        }
        
        $migration = WP_CRM_Integration_Migration::get_instance();
        $result = $migration->clear_migration_log();
        
        if ($result) {
            wp_send_json_success(array(
                'message' => __('Migration log cleared successfully', 'wordpress-crm-integration')
            ));
        } else {
            wp_send_json_error(array(
                'message' => __('Failed to clear migration log', 'wordpress-crm-integration')
            ));
        }
    }
    
    /**
     * Check if WooCommerce is active
     */
    private function is_woocommerce_active() {
        return class_exists('WooCommerce');
    }
    
    /**
     * Render performance monitoring section
     */
    private function render_performance_monitoring() {
        // Check if performance optimizer class exists
        if (!class_exists('WP_CRM_Integration_Performance_Optimizer')) {
            echo '<p>' . __('Performance optimizer not available.', 'wordpress-crm-integration') . '</p>';
            return;
        }
        
        $optimizer = WP_CRM_Integration_Performance_Optimizer::get_instance();
        $performance_stats = $optimizer->get_performance_statistics();
        $recommendations = $optimizer->get_recommendations();
        
        // Handle manual cleanup
        if (isset($_POST['run_performance_cleanup']) && wp_verify_nonce($_POST['_wpnonce'], 'run_performance_cleanup')) {
            $cleanup_results = $optimizer->run_scheduled_cleanup();
            echo '<div class="notice notice-success"><p>' . 
                 __('Performance cleanup completed successfully.', 'wordpress-crm-integration') . 
                 '</p></div>';
        }
        
        // Handle database optimization
        if (isset($_POST['optimize_database']) && wp_verify_nonce($_POST['_wpnonce'], 'optimize_database')) {
            $optimize_results = $optimizer->optimize_database_tables();
            echo '<div class="notice notice-success"><p>' . 
                 sprintf(__('Database optimization completed. %d tables optimized.', 'wordpress-crm-integration'), 
                         count($optimize_results['tables_optimized'])) . 
                 '</p></div>';
        }
        
        ?>
        <div class="wp-crm-performance-section">
            <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                <!-- Memory Usage -->
                <div class="stat-box">
                    <h4><?php _e('Memory Usage', 'wordpress-crm-integration'); ?></h4>
                    <?php $memory = $performance_stats['memory']; ?>
                    <div class="stat-item">
                        <span><?php _e('Current Usage', 'wordpress-crm-integration'); ?></span>
                        <span class="count <?php echo $memory['usage_percentage'] > 80 ? 'error' : ($memory['usage_percentage'] > 60 ? 'warning' : 'success'); ?>">
                            <?php echo esc_html($memory['current_mb']); ?> MB (<?php echo esc_html($memory['usage_percentage']); ?>%)
                        </span>
                    </div>
                    <div class="stat-item">
                        <span><?php _e('Peak Usage', 'wordpress-crm-integration'); ?></span>
                        <span class="count"><?php echo esc_html($memory['peak_mb']); ?> MB</span>
                    </div>
                    <div class="stat-item">
                        <span><?php _e('Memory Limit', 'wordpress-crm-integration'); ?></span>
                        <span class="count"><?php echo esc_html($memory['limit_mb']); ?> MB</span>
                    </div>
                    <div class="stat-item">
                        <span><?php _e('Available', 'wordpress-crm-integration'); ?></span>
                        <span class="count success"><?php echo esc_html($memory['available_mb']); ?> MB</span>
                    </div>
                </div>
                
                <!-- Database Statistics -->
                <div class="stat-box">
                    <h4><?php _e('Database Tables', 'wordpress-crm-integration'); ?></h4>
                    <?php foreach ($performance_stats['database'] as $table_name => $table_stats): ?>
                        <?php if (isset($table_stats['exists']) && $table_stats['exists']): ?>
                            <div class="stat-item">
                                <span><?php echo esc_html(ucfirst(str_replace('_', ' ', $table_name))); ?></span>
                                <span class="count">
                                    <?php echo esc_html(number_format($table_stats['row_count'])); ?> rows
                                    (<?php echo esc_html($table_stats['total_size_mb']); ?> MB)
                                </span>
                            </div>
                        <?php endif; ?>
                    <?php endforeach; ?>
                </div>
                
                <!-- PHP Info -->
                <div class="stat-box">
                    <h4><?php _e('System Info', 'wordpress-crm-integration'); ?></h4>
                    <div class="stat-item">
                        <span><?php _e('PHP Version', 'wordpress-crm-integration'); ?></span>
                        <span class="count"><?php echo esc_html($performance_stats['php_info']['version']); ?></span>
                    </div>
                    <div class="stat-item">
                        <span><?php _e('Max Execution Time', 'wordpress-crm-integration'); ?></span>
                        <span class="count"><?php echo esc_html($performance_stats['php_info']['max_execution_time']); ?>s</span>
                    </div>
                    <div class="stat-item">
                        <span><?php _e('WordPress Version', 'wordpress-crm-integration'); ?></span>
                        <span class="count"><?php echo esc_html($performance_stats['wordpress_info']['version']); ?></span>
                    </div>
                </div>
            </div>
            
            <!-- Recommendations -->
            <?php if (!empty($recommendations)): ?>
            <div style="margin-top: 20px;">
                <h4><?php _e('Recommendations', 'wordpress-crm-integration'); ?></h4>
                <?php foreach ($recommendations as $rec): ?>
                    <div class="notice notice-<?php echo $rec['type'] === 'warning' ? 'warning' : 'info'; ?> inline" style="margin: 5px 0;">
                        <p>
                            <strong><?php echo esc_html(ucfirst($rec['category'])); ?>:</strong>
                            <?php echo esc_html($rec['message']); ?>
                            <?php if (isset($rec['current_value'])): ?>
                                <br><small><?php _e('Current:', 'wordpress-crm-integration'); ?> <?php echo esc_html($rec['current_value']); ?></small>
                            <?php endif; ?>
                        </p>
                    </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
            
            <!-- Actions -->
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <form method="post" style="display: inline;">
                    <?php wp_nonce_field('run_performance_cleanup'); ?>
                    <button type="submit" name="run_performance_cleanup" class="button button-secondary">
                        <?php _e('Run Cleanup Now', 'wordpress-crm-integration'); ?>
                    </button>
                </form>
                
                <form method="post" style="display: inline;">
                    <?php wp_nonce_field('optimize_database'); ?>
                    <button type="submit" name="optimize_database" class="button button-secondary">
                        <?php _e('Optimize Database', 'wordpress-crm-integration'); ?>
                    </button>
                </form>
            </div>
        </div>
        <?php
    }
}