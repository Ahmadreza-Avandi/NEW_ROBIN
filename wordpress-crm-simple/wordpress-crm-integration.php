<?php
/**
 * Plugin Name: WordPress CRM Integration - Professional
 * Plugin URI: https://github.com/rabin-crm/wordpress-integration
 * Description: اتصال حرفه‌ای WordPress به سیستم CRM با پشتیبانی کامل از Multi-Tenant و WooCommerce
 * Version: 2.0.0
 * Author: Rabin CRM Team
 * Author URI: https://rabin-crm.com
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

// جلوگیری از دسترسی مستقیم
if (!defined('ABSPATH')) {
    exit('Direct access denied.');
}

// تعریف ثوابت افزونه
define('WP_CRM_VERSION', '2.0.0');
define('WP_CRM_PLUGIN_FILE', __FILE__);
define('WP_CRM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WP_CRM_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WP_CRM_PLUGIN_BASENAME', plugin_basename(__FILE__));
define('WP_CRM_DEBUG', defined('WP_DEBUG') && WP_DEBUG);

/**
 * کلاس اصلی افزونه
 */
class WP_CRM_Integration {
    
    /**
     * نمونه واحد کلاس
     */
    private static $instance = null;
    
    /**
     * تنظیمات افزونه
     */
    private $settings = array();
    
    /**
     * وضعیت فعال بودن
     */
    private $is_active = false;
    
    /**
     * دریافت نمونه واحد
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * سازنده کلاس
     */
    private function __construct() {
        $this->init();
    }
    
    /**
     * راه‌اندازی افزونه
     */
    private function init() {
        // بررسی سازگاری
        if (!$this->check_requirements()) {
            return;
        }
        
        // بارگذاری تنظیمات
        $this->load_settings();
        
        // ثبت هوک‌ها
        $this->register_hooks();
        
        // بارگذاری کلاس‌ها
        $this->load_classes();
        
        // راه‌اندازی رابط مدیریت
        if (is_admin()) {
            $this->init_admin();
        }
        
        // راه‌اندازی event handlers
        $this->init_event_handlers();
        
        $this->is_active = true;
        $this->log('Plugin initialized successfully');
    }
    
    /**
     * بررسی نیازمندی‌ها
     */
    private function check_requirements() {
        $errors = array();
        
        // بررسی نسخه PHP
        if (version_compare(PHP_VERSION, '7.4', '<')) {
            $errors[] = sprintf('PHP نسخه 7.4 یا بالاتر مورد نیاز است. نسخه فعلی: %s', PHP_VERSION);
        }
        
        // بررسی نسخه WordPress
        global $wp_version;
        if (version_compare($wp_version, '5.0', '<')) {
            $errors[] = sprintf('WordPress نسخه 5.0 یا بالاتر مورد نیاز است. نسخه فعلی: %s', $wp_version);
        }
        
        // بررسی افزونه‌های مورد نیاز PHP
        $required_extensions = array('curl', 'json', 'mbstring');
        foreach ($required_extensions as $ext) {
            if (!extension_loaded($ext)) {
                $errors[] = sprintf('افزونه PHP مورد نیاز نصب نیست: %s', $ext);
            }
        }
        
        if (!empty($errors)) {
            add_action('admin_notices', function() use ($errors) {
                echo '<div class="notice notice-error"><p>';
                echo '<strong>WordPress CRM Integration:</strong><br>';
                echo implode('<br>', array_map('esc_html', $errors));
                echo '</p></div>';
            });
            return false;
        }
        
        return true;
    }
    
    /**
     * بارگذاری تنظیمات
     */
    private function load_settings() {
        $default_settings = array(
            'crm_url' => '',
            'api_key' => '',
            'tenant_key' => '',
            'sync_enabled' => false,
            'sync_users' => true,
            'sync_woocommerce' => true,
            'debug_mode' => false,
            'customer_field_mapping' => array(),
            'product_field_mapping' => array(),
            'order_field_mapping' => array()
        );
        
        $saved_settings = get_option('wp_crm_settings', array());
        $this->settings = wp_parse_args($saved_settings, $default_settings);
    }
    
    /**
     * ثبت هوک‌های WordPress
     */
    private function register_hooks() {
        // هوک‌های فعال‌سازی و غیرفعال‌سازی
        register_activation_hook(WP_CRM_PLUGIN_FILE, array($this, 'activate'));
        register_deactivation_hook(WP_CRM_PLUGIN_FILE, array($this, 'deactivate'));
        
        // بارگذاری زبان
        add_action('plugins_loaded', array($this, 'load_textdomain'));
        
        // اضافه کردن لینک تنظیمات
        add_filter('plugin_action_links_' . WP_CRM_PLUGIN_BASENAME, array($this, 'add_settings_link'));
    }
    
    /**
     * بارگذاری کلاس‌ها
     */
    private function load_classes() {
        // کلاس API Client
        require_once WP_CRM_PLUGIN_DIR . 'includes/class-api-client.php';
        
        // کلاس Logger
        require_once WP_CRM_PLUGIN_DIR . 'includes/class-logger.php';
        
        // کلاس Admin
        require_once WP_CRM_PLUGIN_DIR . 'includes/class-admin.php';
        
        // کلاس Event Handler
        require_once WP_CRM_PLUGIN_DIR . 'includes/class-event-handler.php';
    }
    
    /**
     * راه‌اندازی رابط مدیریت
     */
    private function init_admin() {
        if (class_exists('WP_CRM_Admin')) {
            new WP_CRM_Admin($this);
        }
    }
    
    /**
     * راه‌اندازی event handlers
     */
    private function init_event_handlers() {
        if ($this->get_setting('sync_enabled') && class_exists('WP_CRM_Event_Handler')) {
            new WP_CRM_Event_Handler($this);
        }
    }
    
    /**
     * فعال‌سازی افزونه
     */
    public function activate() {
        // ایجاد جداول دیتابیس
        $this->create_tables();
        
        // تنظیم تنظیمات پیش‌فرض
        if (!get_option('wp_crm_settings')) {
            update_option('wp_crm_settings', $this->settings);
        }
        
        // ثبت نسخه
        update_option('wp_crm_version', WP_CRM_VERSION);
        
        $this->log('Plugin activated');
    }
    
    /**
     * غیرفعال‌سازی افزونه
     */
    public function deactivate() {
        // پاک کردن cron jobs
        wp_clear_scheduled_hook('wp_crm_process_queue');
        
        $this->log('Plugin deactivated');
    }
    
    /**
     * ایجاد جداول دیتابیس
     */
    private function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // جدول صف همگام‌سازی
        $table_name = $wpdb->prefix . 'crm_sync_queue';
        
        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            entity_type varchar(50) NOT NULL,
            entity_id bigint(20) NOT NULL,
            action varchar(50) NOT NULL,
            data longtext NOT NULL,
            status varchar(20) DEFAULT 'pending',
            attempts int(11) DEFAULT 0,
            error_message text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY status (status),
            KEY entity_type (entity_type),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // جدول لاگ
        $log_table = $wpdb->prefix . 'crm_sync_log';
        
        $log_sql = "CREATE TABLE IF NOT EXISTS $log_table (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            level varchar(20) NOT NULL DEFAULT 'info',
            message text NOT NULL,
            context longtext,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY level (level),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        dbDelta($log_sql);
    }
    
    /**
     * بارگذاری فایل‌های زبان
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'wordpress-crm-integration',
            false,
            dirname(WP_CRM_PLUGIN_BASENAME) . '/languages'
        );
    }
    
    /**
     * اضافه کردن لینک تنظیمات
     */
    public function add_settings_link($links) {
        $settings_link = '<a href="' . admin_url('admin.php?page=wp-crm-settings') . '">' . __('تنظیمات', 'wordpress-crm-integration') . '</a>';
        array_unshift($links, $settings_link);
        return $links;
    }
    
    /**
     * دریافت تنظیم
     */
    public function get_setting($key, $default = null) {
        return isset($this->settings[$key]) ? $this->settings[$key] : $default;
    }
    
    /**
     * ذخیره تنظیم
     */
    public function update_setting($key, $value) {
        $this->settings[$key] = $value;
        return update_option('wp_crm_settings', $this->settings);
    }
    
    /**
     * ذخیره چندین تنظیم
     */
    public function update_settings($new_settings) {
        $this->settings = array_merge($this->settings, $new_settings);
        return update_option('wp_crm_settings', $this->settings);
    }
    
    /**
     * ثبت لاگ
     */
    public function log($message, $level = 'info', $context = array()) {
        if (WP_CRM_DEBUG) {
            error_log('[WP CRM] ' . $message);
        }
        
        // ذخیره در دیتابیس
        global $wpdb;
        $table_name = $wpdb->prefix . 'crm_sync_log';
        
        $wpdb->insert(
            $table_name,
            array(
                'level' => $level,
                'message' => $message,
                'context' => json_encode($context),
                'created_at' => current_time('mysql')
            ),
            array('%s', '%s', '%s', '%s')
        );
    }
    
    /**
     * بررسی وضعیت فعال بودن
     */
    public function is_active() {
        return $this->is_active;
    }
    
    /**
     * دریافت تمام تنظیمات
     */
    public function get_settings() {
        return $this->settings;
    }
}

// راه‌اندازی افزونه
function wp_crm_integration_init() {
    return WP_CRM_Integration::get_instance();
}

// شروع افزونه
add_action('plugins_loaded', 'wp_crm_integration_init', 10);

// تابع کمکی برای دسترسی به نمونه اصلی
function wp_crm() {
    return WP_CRM_Integration::get_instance();
}