<?php
/**
 * کلاس Admin برای رابط مدیریت
 */

if (!defined('ABSPATH')) {
    exit;
}

class WP_CRM_Admin {
    
    /**
     * نمونه افزونه اصلی
     */
    private $plugin;
    
    /**
     * سازنده
     */
    public function __construct($plugin) {
        $this->plugin = $plugin;
        $this->init();
    }
    
    /**
     * راه‌اندازی
     */
    private function init() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('wp_ajax_wp_crm_test_connection', array($this, 'ajax_test_connection'));
        add_action('wp_ajax_wp_crm_sync_user', array($this, 'ajax_sync_user'));
    }
    
    /**
     * اضافه کردن منو
     */
    public function add_admin_menu() {
        add_menu_page(
            __('CRM Integration', 'wordpress-crm-integration'),
            __('CRM Integration', 'wordpress-crm-integration'),
            'manage_options',
            'wp-crm-settings',
            array($this, 'settings_page'),
            'dashicons-networking',
            30
        );
        
        add_submenu_page(
            'wp-crm-settings',
            __('تنظیمات', 'wordpress-crm-integration'),
            __('تنظیمات', 'wordpress-crm-integration'),
            'manage_options',
            'wp-crm-settings',
            array($this, 'settings_page')
        );
        
        add_submenu_page(
            'wp-crm-settings',
            __('لاگ‌ها', 'wordpress-crm-integration'),
            __('لاگ‌ها', 'wordpress-crm-integration'),
            'manage_options',
            'wp-crm-logs',
            array($this, 'logs_page')
        );
        
        add_submenu_page(
            'wp-crm-settings',
            __('همگام‌سازی دستی', 'wordpress-crm-integration'),
            __('همگام‌سازی دستی', 'wordpress-crm-integration'),
            'manage_options',
            'wp-crm-sync',
            array($this, 'sync_page')
        );
    }
    
    /**
     * ثبت تنظیمات
     */
    public function register_settings() {
        register_setting('wp_crm_settings', 'wp_crm_settings', array($this, 'sanitize_settings'));
    }
    
    /**
     * بارگذاری اسکریپت‌ها
     */
    public function enqueue_scripts($hook) {
        if (strpos($hook, 'wp-crm') === false) {
            return;
        }
        
        wp_enqueue_script('wp-crm-admin', WP_CRM_PLUGIN_URL . 'assets/js/admin.js', array('jquery'), WP_CRM_VERSION, true);
        wp_enqueue_style('wp-crm-admin', WP_CRM_PLUGIN_URL . 'assets/css/admin.css', array(), WP_CRM_VERSION);
        
        wp_localize_script('wp-crm-admin', 'wpCrmAjax', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('wp_crm_nonce'),
            'strings' => array(
                'testing' => __('در حال تست...', 'wordpress-crm-integration'),
                'success' => __('موفقیت‌آمیز', 'wordpress-crm-integration'),
                'error' => __('خطا', 'wordpress-crm-integration'),
                'syncing' => __('در حال همگام‌سازی...', 'wordpress-crm-integration')
            )
        ));
    }
    
    /**
     * صفحه تنظیمات
     */
    public function settings_page() {
        $settings = $this->plugin->get_settings();
        
        if (isset($_POST['submit'])) {
            check_admin_referer('wp_crm_settings_nonce');
            
            $new_settings = array(
                'crm_url' => sanitize_url($_POST['crm_url']),
                'api_key' => sanitize_text_field($_POST['api_key']),
                'tenant_key' => sanitize_text_field($_POST['tenant_key']),
                'sync_enabled' => isset($_POST['sync_enabled']),
                'sync_users' => isset($_POST['sync_users']),
                'sync_woocommerce' => isset($_POST['sync_woocommerce']),
                'debug_mode' => isset($_POST['debug_mode'])
            );
            
            $this->plugin->update_settings($new_settings);
            $settings = $new_settings;
            
            echo '<div class="notice notice-success"><p>' . __('تنظیمات ذخیره شد.', 'wordpress-crm-integration') . '</p></div>';
        }
        
        ?>
        <div class="wrap">
            <h1><?php _e('تنظیمات CRM Integration', 'wordpress-crm-integration'); ?></h1>
            
            <form method="post" action="">
                <?php wp_nonce_field('wp_crm_settings_nonce'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('آدرس CRM', 'wordpress-crm-integration'); ?></th>
                        <td>
                            <input type="url" name="crm_url" value="<?php echo esc_attr($settings['crm_url']); ?>" class="regular-text" placeholder="http://localhost:3000" />
                            <p class="description"><?php _e('آدرس کامل سیستم CRM شما', 'wordpress-crm-integration'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><?php _e('کلید API', 'wordpress-crm-integration'); ?></th>
                        <td>
                            <input type="text" name="api_key" value="<?php echo esc_attr($settings['api_key']); ?>" class="regular-text" />
                            <p class="description"><?php _e('کلید API دریافتی از سیستم CRM', 'wordpress-crm-integration'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><?php _e('کلید Tenant', 'wordpress-crm-integration'); ?></th>
                        <td>
                            <input type="text" name="tenant_key" value="<?php echo esc_attr($settings['tenant_key']); ?>" class="regular-text" placeholder="rabin" />
                            <p class="description"><?php _e('شناسه tenant در سیستم multi-tenant CRM', 'wordpress-crm-integration'); ?></p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><?php _e('تست اتصال', 'wordpress-crm-integration'); ?></th>
                        <td>
                            <button type="button" id="test-connection" class="button"><?php _e('تست اتصال', 'wordpress-crm-integration'); ?></button>
                            <span id="connection-result"></span>
                        </td>
                    </tr>
                </table>
                
                <h2><?php _e('تنظیمات همگام‌سازی', 'wordpress-crm-integration'); ?></h2>
                
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('فعال‌سازی همگام‌سازی', 'wordpress-crm-integration'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="sync_enabled" value="1" <?php checked($settings['sync_enabled']); ?> />
                                <?php _e('همگام‌سازی خودکار فعال باشد', 'wordpress-crm-integration'); ?>
                            </label>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><?php _e('همگام‌سازی کاربران', 'wordpress-crm-integration'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="sync_users" value="1" <?php checked($settings['sync_users']); ?> />
                                <?php _e('کاربران جدید و به‌روزرسانی‌ها همگام‌سازی شوند', 'wordpress-crm-integration'); ?>
                            </label>
                        </td>
                    </tr>
                    
                    <?php if (class_exists('WooCommerce')): ?>
                    <tr>
                        <th scope="row"><?php _e('همگام‌سازی WooCommerce', 'wordpress-crm-integration'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="sync_woocommerce" value="1" <?php checked($settings['sync_woocommerce']); ?> />
                                <?php _e('سفارشات و مشتریان WooCommerce همگام‌سازی شوند', 'wordpress-crm-integration'); ?>
                            </label>
                        </td>
                    </tr>
                    <?php endif; ?>
                    
                    <tr>
                        <th scope="row"><?php _e('حالت Debug', 'wordpress-crm-integration'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="debug_mode" value="1" <?php checked($settings['debug_mode']); ?> />
                                <?php _e('ثبت جزئیات کامل در لاگ‌ها', 'wordpress-crm-integration'); ?>
                            </label>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
    
    /**
     * صفحه لاگ‌ها
     */
    public function logs_page() {
        $logger = new WP_CRM_Logger($this->plugin);
        $logs = $logger->get_logs(50);
        
        ?>
        <div class="wrap">
            <h1><?php _e('لاگ‌های CRM Integration', 'wordpress-crm-integration'); ?></h1>
            
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th><?php _e('زمان', 'wordpress-crm-integration'); ?></th>
                        <th><?php _e('سطح', 'wordpress-crm-integration'); ?></th>
                        <th><?php _e('پیام', 'wordpress-crm-integration'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($logs)): ?>
                        <tr>
                            <td colspan="3"><?php _e('هیچ لاگی یافت نشد.', 'wordpress-crm-integration'); ?></td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($logs as $log): ?>
                            <tr>
                                <td><?php echo esc_html($log->created_at); ?></td>
                                <td>
                                    <span class="log-level log-level-<?php echo esc_attr($log->level); ?>">
                                        <?php echo esc_html(ucfirst($log->level)); ?>
                                    </span>
                                </td>
                                <td><?php echo esc_html($log->message); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        <?php
    }
    
    /**
     * صفحه همگام‌سازی دستی
     */
    public function sync_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('همگام‌سازی دستی', 'wordpress-crm-integration'); ?></h1>
            
            <div class="card">
                <h2><?php _e('همگام‌سازی کاربران', 'wordpress-crm-integration'); ?></h2>
                <p><?php _e('همگام‌سازی تمام کاربران موجود با CRM', 'wordpress-crm-integration'); ?></p>
                <button type="button" id="sync-all-users" class="button button-primary">
                    <?php _e('شروع همگام‌سازی', 'wordpress-crm-integration'); ?>
                </button>
                <div id="sync-progress" style="display:none;">
                    <p><?php _e('در حال همگام‌سازی...', 'wordpress-crm-integration'); ?></p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%;"></div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * AJAX تست اتصال
     */
    public function ajax_test_connection() {
        check_ajax_referer('wp_crm_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('دسترسی غیرمجاز', 'wordpress-crm-integration'));
        }
        
        $api_client = new WP_CRM_API_Client($this->plugin);
        $result = $api_client->test_connection();
        
        wp_send_json($result);
    }
    
    /**
     * AJAX همگام‌سازی کاربر
     */
    public function ajax_sync_user() {
        check_ajax_referer('wp_crm_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('دسترسی غیرمجاز', 'wordpress-crm-integration'));
        }
        
        $user_id = intval($_POST['user_id']);
        
        $api_client = new WP_CRM_API_Client($this->plugin);
        $customer_data = $api_client->prepare_customer_data($user_id);
        
        if (!$customer_data) {
            wp_send_json_error(__('کاربر یافت نشد', 'wordpress-crm-integration'));
        }
        
        $result = $api_client->send_customer($customer_data);
        
        if ($result['success']) {
            wp_send_json_success(__('همگام‌سازی موفقیت‌آمیز بود', 'wordpress-crm-integration'));
        } else {
            wp_send_json_error($result['error']);
        }
    }
    
    /**
     * پاکسازی تنظیمات
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        $sanitized['crm_url'] = sanitize_url($input['crm_url']);
        $sanitized['api_key'] = sanitize_text_field($input['api_key']);
        $sanitized['tenant_key'] = sanitize_text_field($input['tenant_key']);
        $sanitized['sync_enabled'] = isset($input['sync_enabled']);
        $sanitized['sync_users'] = isset($input['sync_users']);
        $sanitized['sync_woocommerce'] = isset($input['sync_woocommerce']);
        $sanitized['debug_mode'] = isset($input['debug_mode']);
        
        return $sanitized;
    }
    
    /**
     * نمایش وضعیت صف همگام‌سازی
     */
    private function show_sync_queue_status() {
        echo '<p>' . __('صف همگام‌سازی فعال است.', 'wordpress-crm-integration') . '</p>';
    }
}