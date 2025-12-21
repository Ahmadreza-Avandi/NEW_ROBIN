# WordPress CRM Integration - Configuration Examples

## Overview

This document provides practical configuration examples for different WordPress setups and use cases. Use these examples as templates for your specific requirements.

## Basic WordPress Site (No E-commerce)

### Scenario
- Standard WordPress blog/website
- User registration enabled
- Contact forms collect user data
- No WooCommerce

### Configuration

#### Connection Settings
```
CRM URL: https://crm.yourcompany.com
API Key: wp_blog_integration_abc123
Tenant Key: blog-site-main
```

#### Field Mapping
```
Customer Fields:
- Email: user_email
- First Name: first_name
- Last Name: last_name
- Phone: user_meta_phone
- Company: user_meta_company
- Website: user_url
```

#### Sync Options
```
✓ Customer Data Sync
✗ Order Data Sync (not applicable)
✗ Product Data Sync (not applicable)

Triggers:
✓ User Registration
✗ Order Creation (not applicable)
```

#### Sample Field Mapping Code
```php
// Custom user meta fields for enhanced data collection
add_action('user_register', 'add_custom_user_fields');
function add_custom_user_fields($user_id) {
    if (isset($_POST['phone'])) {
        update_user_meta($user_id, 'phone', sanitize_text_field($_POST['phone']));
    }
    if (isset($_POST['company'])) {
        update_user_meta($user_id, 'company', sanitize_text_field($_POST['company']));
    }
}
```

## WooCommerce E-commerce Site

### Scenario
- WordPress with WooCommerce
- Online store selling physical products
- Customer accounts and guest checkout
- Order management required

### Configuration

#### Connection Settings
```
CRM URL: https://crm.yourstore.com
API Key: wp_woo_integration_def456
Tenant Key: ecommerce-store-main
```

#### Field Mapping
```
Customer Fields:
- Email: billing_email
- First Name: billing_first_name
- Last Name: billing_last_name
- Phone: billing_phone
- Company: billing_company
- Address: billing_address_1
- City: billing_city
- State: billing_state
- Country: billing_country
- Postal Code: billing_postcode

Order Fields:
- Order ID: order_id
- Total Amount: order_total
- Currency: order_currency
- Status: order_status
- Order Date: date_created
- Payment Method: payment_method

Product Fields:
- Product Name: product_name
- Description: product_description
- SKU: product_sku
- Price: regular_price
- Category: product_categories
- Stock Status: stock_status
```

#### Sync Options
```
✓ Customer Data Sync
✓ Order Data Sync
✓ Product Data Sync

Triggers:
✓ User Registration
✓ Order Creation
✓ Order Status Change
✓ Product Updates

Advanced Settings:
- Retry Attempts: 5
- Retry Delay: 60 seconds
- Batch Size: 20
- Queue Processing: Enabled
```

## Multi-site WordPress Network

### Scenario
- WordPress Multisite network
- Multiple sub-sites with different purposes
- Centralized CRM for all sites
- Site-specific tenant keys

### Configuration

#### Site 1: Main Corporate Site
```
CRM URL: https://crm.company.com
API Key: wp_multisite_main_ghi789
Tenant Key: corporate-main-site
```

#### Site 2: E-commerce Store
```
CRM URL: https://crm.company.com
API Key: wp_multisite_store_jkl012
Tenant Key: ecommerce-store-site
```

#### Site 3: Support Portal
```
CRM URL: https://crm.company.com
API Key: wp_multisite_support_mno345
Tenant Key: support-portal-site
```

#### Network-wide Settings
```php
// Network admin configuration
define('WP_CRM_NETWORK_MODE', true);
define('WP_CRM_MASTER_URL', 'https://crm.company.com');

// Site-specific configurations in wp-config.php
switch (get_current_blog_id()) {
    case 1: // Main site
        define('WP_CRM_TENANT_KEY', 'corporate-main-site');
        break;
    case 2: // Store site
        define('WP_CRM_TENANT_KEY', 'ecommerce-store-site');
        break;
    case 3: // Support site
        define('WP_CRM_TENANT_KEY', 'support-portal-site');
        break;
}
```

## High-Traffic E-commerce Site

### Scenario
- Large WooCommerce store
- High order volume (1000+ orders/day)
- Performance optimization required
- Advanced error handling

### Configuration

#### Connection Settings
```
CRM URL: https://crm-api.bigstore.com
API Key: wp_enterprise_pqr678
Tenant Key: enterprise-store-prod
```

#### Performance Optimization
```
Advanced Settings:
- Retry Attempts: 3
- Retry Delay: 30 seconds
- Batch Size: 50
- Queue Processing: Enabled
- Cron Frequency: Every 5 minutes
- Max Queue Size: 1000
- Timeout: 30 seconds
- Memory Limit: 256M
```

#### Custom Hooks for Performance
```php
// Optimize for high-volume processing
add_filter('wp_crm_batch_size', function($size) {
    return 100; // Larger batches for better performance
});

add_filter('wp_crm_queue_priority', function($priority, $data_type) {
    // Prioritize orders over products
    if ($data_type === 'order') {
        return 1;
    } elseif ($data_type === 'customer') {
        return 2;
    }
    return 3;
}, 10, 2);

// Custom error handling for high-volume sites
add_action('wp_crm_sync_failed', function($error, $data) {
    // Log to external monitoring service
    error_log("CRM Sync Failed: " . $error->getMessage());
    
    // Send alert for critical failures
    if ($error->getCode() >= 500) {
        wp_mail('admin@bigstore.com', 'CRM Sync Critical Error', $error->getMessage());
    }
}, 10, 2);
```

## Development and Staging Environment

### Scenario
- Development/staging WordPress site
- Testing CRM integration
- Debug mode enabled
- Separate CRM environment

### Configuration

#### Connection Settings
```
CRM URL: https://crm-staging.yourcompany.com
API Key: wp_dev_staging_stu901
Tenant Key: dev-staging-test
```

#### Debug Configuration
```php
// Enable debug mode in wp-config.php
define('WP_CRM_DEBUG', true);
define('WP_CRM_LOG_LEVEL', 'debug');

// Development-specific settings
add_filter('wp_crm_config', function($config) {
    if (WP_DEBUG) {
        $config['timeout'] = 60; // Longer timeout for debugging
        $config['retry_attempts'] = 1; // Fewer retries in dev
        $config['log_requests'] = true; // Log all requests
        $config['validate_ssl'] = false; // Allow self-signed certs
    }
    return $config;
});
```

#### Testing Hooks
```php
// Add test data generation
add_action('wp_crm_test_mode', function() {
    // Generate test customer
    $test_customer = array(
        'email' => 'test@example.com',
        'first_name' => 'Test',
        'last_name' => 'Customer',
        'phone' => '+1234567890'
    );
    
    // Send to CRM
    WP_CRM_Integration_API_Client::send_customer_data($test_customer);
});
```

## Custom Field Mapping Examples

### Advanced Customer Fields
```php
// Custom field mapping for B2B customers
add_filter('wp_crm_customer_fields', function($fields, $user_id) {
    // Add custom B2B fields
    $fields['tax_id'] = get_user_meta($user_id, 'tax_identification', true);
    $fields['industry'] = get_user_meta($user_id, 'company_industry', true);
    $fields['employee_count'] = get_user_meta($user_id, 'employee_count', true);
    $fields['annual_revenue'] = get_user_meta($user_id, 'annual_revenue', true);
    
    return $fields;
}, 10, 2);
```

### WooCommerce Custom Order Fields
```php
// Add custom order fields
add_filter('wp_crm_order_fields', function($fields, $order) {
    // Add shipping information
    $fields['shipping_method'] = $order->get_shipping_method();
    $fields['delivery_date'] = $order->get_meta('delivery_date');
    $fields['special_instructions'] = $order->get_customer_note();
    
    // Add order source tracking
    $fields['utm_source'] = $order->get_meta('utm_source');
    $fields['utm_campaign'] = $order->get_meta('utm_campaign');
    
    return $fields;
}, 10, 2);
```

### Product Metadata Mapping
```php
// Enhanced product data
add_filter('wp_crm_product_fields', function($fields, $product) {
    // Add product attributes
    $fields['weight'] = $product->get_weight();
    $fields['dimensions'] = array(
        'length' => $product->get_length(),
        'width' => $product->get_width(),
        'height' => $product->get_height()
    );
    
    // Add custom attributes
    $fields['brand'] = $product->get_attribute('brand');
    $fields['material'] = $product->get_attribute('material');
    $fields['warranty'] = $product->get_meta('warranty_period');
    
    return $fields;
}, 10, 2);
```

## Error Handling Examples

### Custom Error Logging
```php
// Enhanced error logging
add_action('wp_crm_log_error', function($error, $context) {
    // Log to custom file
    $log_entry = array(
        'timestamp' => current_time('mysql'),
        'error' => $error,
        'context' => $context,
        'user_id' => get_current_user_id(),
        'site_url' => get_site_url()
    );
    
    file_put_contents(
        WP_CONTENT_DIR . '/crm-integration-errors.log',
        json_encode($log_entry) . "\n",
        FILE_APPEND | LOCK_EX
    );
}, 10, 2);
```

### Retry Logic Customization
```php
// Custom retry logic
add_filter('wp_crm_retry_logic', function($should_retry, $attempt, $error) {
    // Don't retry authentication errors
    if ($error->getCode() === 401) {
        return false;
    }
    
    // Retry server errors up to 5 times
    if ($error->getCode() >= 500 && $attempt < 5) {
        return true;
    }
    
    // Custom backoff for rate limiting
    if ($error->getCode() === 429) {
        sleep(pow(2, $attempt)); // Exponential backoff
        return $attempt < 3;
    }
    
    return false;
}, 10, 3);
```

## Monitoring and Alerts

### Performance Monitoring
```php
// Monitor sync performance
add_action('wp_crm_sync_complete', function($data_type, $duration, $success_count, $error_count) {
    // Log performance metrics
    $metrics = array(
        'type' => $data_type,
        'duration' => $duration,
        'success' => $success_count,
        'errors' => $error_count,
        'timestamp' => time()
    );
    
    // Send to monitoring service
    wp_remote_post('https://monitoring.yourcompany.com/metrics', array(
        'body' => json_encode($metrics),
        'headers' => array('Content-Type' => 'application/json')
    ));
}, 10, 4);
```

### Alert Configuration
```php
// Set up alerts for critical issues
add_action('wp_crm_critical_error', function($error) {
    // Send email alert
    $subject = 'CRM Integration Critical Error';
    $message = "Critical error in CRM integration:\n\n" . $error->getMessage();
    wp_mail('admin@yourcompany.com', $subject, $message);
    
    // Send Slack notification
    wp_remote_post('https://hooks.slack.com/your-webhook-url', array(
        'body' => json_encode(array(
            'text' => 'CRM Integration Alert: ' . $error->getMessage()
        ))
    ));
});
```

## Security Best Practices

### API Key Management
```php
// Secure API key storage
define('WP_CRM_API_KEY', 'your-secure-api-key-here');

// Rotate API keys programmatically
add_action('wp_crm_rotate_api_key', function() {
    $new_key = wp_generate_password(32, false);
    update_option('wp_crm_api_key', $new_key);
    
    // Notify CRM system of key change
    wp_remote_post(get_option('wp_crm_url') . '/api/rotate-key', array(
        'body' => array('new_key' => $new_key),
        'headers' => array('Authorization' => 'Bearer ' . get_option('wp_crm_api_key'))
    ));
});
```

### Data Encryption
```php
// Encrypt sensitive data before transmission
add_filter('wp_crm_encrypt_data', function($data) {
    $key = get_option('wp_crm_encryption_key');
    return openssl_encrypt(json_encode($data), 'AES-256-CBC', $key, 0, $iv);
});
```

These examples provide a comprehensive foundation for configuring the WordPress CRM Integration plugin across various scenarios and requirements.