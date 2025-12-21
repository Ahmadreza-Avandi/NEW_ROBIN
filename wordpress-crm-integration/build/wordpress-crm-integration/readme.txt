=== WordPress CRM Integration ===
Contributors: yourcompany
Tags: crm, integration, woocommerce, customer-data, sync
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Seamlessly sync WordPress customer data, orders, and products with your CRM system.

== Description ==

WordPress CRM Integration provides a seamless connection between your WordPress website and your CRM system. The plugin automatically synchronizes customer data, WooCommerce orders, and product information with flexible field mapping and robust error handling.

**Key Features:**

* **Automatic Data Sync**: Real-time synchronization of customer registrations and WooCommerce orders
* **Flexible Field Mapping**: Configure which WordPress fields map to your CRM fields
* **WooCommerce Support**: Full integration with WooCommerce for order and product data
* **Robust Error Handling**: Comprehensive logging and retry mechanisms
* **Queue Management**: Asynchronous processing to prevent website slowdowns
* **Admin Dashboard**: Monitor sync status and troubleshoot issues
* **Multi-tenant Support**: Works with multi-tenant CRM systems

**Supported Data Types:**

* Customer information (registration data, billing details)
* WooCommerce orders and line items
* Product information and categories
* Custom field mappings

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/wordpress-crm-integration` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Use the Settings->CRM Integration screen to configure the plugin
4. Enter your CRM API credentials and configure field mappings
5. Test the connection and enable synchronization

== Frequently Asked Questions ==

= Does this work with WooCommerce? =

Yes! The plugin includes full WooCommerce integration for syncing orders, customer data, and products.

= What happens if the CRM is temporarily unavailable? =

The plugin includes a queue system that will retry failed requests with exponential backoff. Data is safely stored until it can be synchronized.

= Can I customize which fields are synchronized? =

Absolutely. The plugin includes a flexible field mapping interface where you can configure exactly which WordPress fields map to your CRM fields.

== Changelog ==

= 1.0.0 =
* Initial release
* Customer data synchronization
* WooCommerce order integration
* Field mapping interface
* Queue management system
* Admin dashboard and monitoring