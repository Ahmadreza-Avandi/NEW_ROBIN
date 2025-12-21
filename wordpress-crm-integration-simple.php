<?php
/**
 * Plugin Name: WordPress CRM Integration (Simple)
 * Description: Simple version for testing - Seamlessly sync WordPress customer data with your CRM system.
 * Version: 1.0.0
 * Author: Your Company
 * Text Domain: wordpress-crm-integration
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('WP_CRM_INTEGRATION_VERSION', '1.0.0');
define('WP_CRM_INTEGRATION_PLUGIN_FILE', __FILE__);
define('WP_CRM_INTEGRATION_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WP_CRM_INTEGRATION_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WP_CRM_INTEGRATION_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Simple Config class
 */
class WP_CRM_Integration_Config {
    private static $instance = null;
    private $settings = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function get_settings() {
        if (null === $this->settings) {
            $this->settings = get_option('wp_crm_integration_settings', array());
        }
        return $this->settings;
    }
    
    public function get($key, $default = null) {
        $settings = $this->get_settings();
        return isset($settings[$key]) ? $settings[$key] : $default;
    }
    
    public function set($key, $value) {
        $settings = $this->get_settings();
        $settings[$key] = $value;
        $this->settings = $settings;
        return update_option('wp_crm_integration_settings', $settings);
    }
}

/**
 * Simple Admin class
 */
class WP_CRM_Integration_Admin {
    private static $instance = null;
    private $config;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->config = WP_CRM_Integration_Config::get_instance();
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
    }
    
    public function add_admin_menu() {
        add_options_page(
            __('CRM Integration', 'wordpress-crm-integration'),
            __('CRM Integration', 'wordpress-crm-integration'),
            'manage_options',
            'wp-crm-integration',
            array($this, 'admin_page')
        );
    }
    
    public function register_settings() {
        register_setting('wp_crm_integration_settings', 'wp_crm_integration_settings');
    }
    
    public function admin_page() {
        if (isset($_POST['submit'])) {
            $settings = array(
                'crm_url' => sanitize_url($_POST['crm_url']),
                'api_key' => sanitize_text_field($_POST['api_key']),
                'tenant_key' => sanitize_text_field($_POST['tenant_key']),
                'sync_enabled' => isset($_POST['sync_enabled'])
            );
            
            update_option('wp_crm_integration_settings', $settings);
            echo '<div class="notice notice-success"><p>تنظیمات ذخیره شد!</p></div>';
        }
        
        $settings = get_option('wp_crm_integration_settings', array());
        ?>
        <div class="wrap">
            <h1><?php _e('CRM Integration Settings', 'wordpress-crm-integration'); ?></h1>
            
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="crm_url"><?php _e('CRM URL', 'wordpress-crm-integration'); ?></label>
                        </th>
                        <td>
                            <input type="url" id="crm_url" name="crm_url" 
                                   value="<?php echo esc_attr($settings['crm_url'] ?? ''); ?>" 
                                   class="regular-text" 
                                   placeholder="http://localhost:3000" />
                            <p class="description">آدرس سیستم CRM شما</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="api_key"><?php _e('API Key', 'wordpress-crm-integration'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="api_key" name="api_key" 
                                   value="<?php echo esc_attr($settings['api_key'] ?? ''); ?>" 
                                   class="regular-text" 
                                   placeholder="wp_crm_rabin_..." />
                            <p class="description">کلید API دریافتی از سیستم CRM</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="tenant_key"><?php _e('Tenant Key', 'wordpress-crm-integration'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="tenant_key" name="tenant_key" 
                                   value="<?php echo esc_attr($settings['tenant_key'] ?? ''); ?>" 
                                   class="regular-text" 
                                   placeholder="rabin" />
                            <p class="description">شناسه tenant شما (مثال: rabin)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="sync_enabled"><?php _e('Enable Sync', 'wordpress-crm-integration'); ?></label>
                        </th>
                        <td>
                            <input type="checkbox" id="sync_enabled" name="sync_enabled" 
                                   <?php checked($settings['sync_enabled'] ?? false); ?> />
                            <label for="sync_enabled">فعال‌سازی همگام‌سازی خودکار</label>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('ذخیره تنظیمات'); ?>
            </form>
            
            <hr>
            
            <h2>تست اتصال</h2>
            <p>
                <button type="button" id="test-connection" class="button">تست اتصال به CRM</button>
                <span id="test-result"></span>
            </p>
            
            <script>
            document.getElementById('test-connection').addEventListener('click', function() {
                var button = this;
                var result = document.getElementById('test-result');
                
                button.disabled = true;
                button.textContent = 'در حال تست...';
                result.innerHTML = '';
                
                var data = {
                    action: 'wp_crm_test_connection',
                    crm_url: document.getElementById('crm_url').value,
                    api_key: document.getElementById('api_key').value,
                    nonce: '<?php echo wp_create_nonce('wp_crm_test'); ?>'
                };
                
                fetch(ajaxurl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams(data)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        result.innerHTML = '<span style="color: green;">✅ اتصال موفق!</span>';
                    } else {
                        result.innerHTML = '<span style="color: red;">❌ خطا: ' + data.data + '</span>';
                    }
                })
                .catch(error => {
                    result.innerHTML = '<span style="color: red;">❌ خطا در اتصال</span>';
                })
                .finally(() => {
                    button.disabled = false;
                    button.textContent = 'تست اتصال به CRM';
                });
            });
            </script>
        </div>
        <?php
    }
}

/**
 * Simple Event Handler
 */
class WP_CRM_Integration_Events {
    private static $instance = null;
    private $config;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $this->config = WP_CRM_Integration_Config::get_instance();
        add_action('user_register', array($this, 'handle_user_registration'));
        add_action('wp_ajax_wp_crm_test_connection', array($this, 'test_connection'));
    }
    
    public function handle_user_registration($user_id) {
        $settings = $this->config->get_settings();
        
        if (empty($settings['sync_enabled']) || empty($settings['crm_url']) || empty($settings['api_key'])) {
            return;
        }
        
        $user = get_user_by('id', $user_id);
        if (!$user) {
            return;
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
                'wordpress_display_name' => $user->display_name
            )
        );
        
        $this->send_to_crm($customer_data, $settings);
    }
    
    public function test_connection() {
        check_ajax_referer('wp_crm_test', 'nonce');
        
        $crm_url = sanitize_url($_POST['crm_url']);
        $api_key = sanitize_text_field($_POST['api_key']);
        
        if (empty($crm_url) || empty($api_key)) {
            wp_send_json_error('URL و کلید API الزامی است');
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
            wp_send_json_error($response->get_error_message());
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code === 200) {
            wp_send_json_success('اتصال موفق');
        } else {
            wp_send_json_error('کد خطا: ' . $code);
        }
    }
    
    private function send_to_crm($customer_data, $settings) {
        $endpoint = rtrim($settings['crm_url'], '/') . '/api/integrations/wordpress/customers';
        
        $response = wp_remote_post($endpoint, array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'X-WP-API-Key' => $settings['api_key'],
                'User-Agent' => 'WordPress/' . get_bloginfo('version') . ' CRM-Integration/' . WP_CRM_INTEGRATION_VERSION
            ),
            'body' => json_encode($customer_data),
            'timeout' => 30
        ));
        
        if (is_wp_error($response)) {
            error_log('CRM Integration Error: ' . $response->get_error_message());
            return false;
        }
        
        $code = wp_remote_retrieve_response_code($response);
        if ($code === 200) {
            error_log('CRM Integration: Customer synced successfully - ' . $customer_data['email']);
            return true;
        } else {
            error_log('CRM Integration Error: HTTP ' . $code . ' - ' . wp_remote_retrieve_body($response));
            return false;
        }
    }
}

/**
 * Main plugin class
 */
class WordPressCRMIntegration {
    private static $instance = null;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        add_action('plugins_loaded', array($this, 'init'));
        add_action('init', array($this, 'load_textdomain'));
    }
    
    public function init() {
        if (is_admin()) {
            WP_CRM_Integration_Admin::get_instance();
        }
        
        WP_CRM_Integration_Events::get_instance();
    }
    
    public function load_textdomain() {
        load_plugin_textdomain(
            'wordpress-crm-integration',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages'
        );
    }
    
    public function activate() {
        // Set default options
        $default_options = array(
            'crm_url' => '',
            'api_key' => '',
            'tenant_key' => '',
            'sync_enabled' => false
        );
        
        if (!get_option('wp_crm_integration_settings')) {
            add_option('wp_crm_integration_settings', $default_options);
        }
        
        flush_rewrite_rules();
    }
    
    public function deactivate() {
        flush_rewrite_rules();
    }
}

// Initialize the plugin
WordPressCRMIntegration::get_instance();