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
define('WP_CRM_PLUGIN_BASENAME', plugin_b