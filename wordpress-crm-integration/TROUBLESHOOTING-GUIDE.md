# WordPress CRM Integration - Troubleshooting Guide

## Overview

This guide helps you diagnose and resolve common issues with the WordPress CRM Integration plugin. Follow the troubleshooting steps in order for the best results.

## Quick Diagnostic Checklist

Before diving into specific issues, run through this quick checklist:

- [ ] Plugin is activated and up to date
- [ ] WordPress version is 5.0 or higher
- [ ] PHP version is 7.4 or higher
- [ ] CRM system is accessible and running
- [ ] API key is valid and has proper permissions
- [ ] SSL certificate is valid (if using HTTPS)
- [ ] No conflicting plugins are active
- [ ] WordPress debug logging is enabled

## Connection Issues

### Problem: "Connection Failed" Error

**Symptoms:**
- Cannot connect to CRM system
- Test connection button shows failure
- Error message: "Connection timeout" or "Connection refused"

**Diagnostic Steps:**

1. **Check CRM URL Format**
   ```
   ✓ Correct: https://crm.yourcompany.com
   ✗ Incorrect: https://crm.yourcompany.com/
   ✗ Incorrect: crm.yourcompany.com
   ```

2. **Verify Network Connectivity**
   ```bash
   # Test from server command line
   curl -I https://your-crm-url.com/api/integrations/wordpress/test
   ```

3. **Check Firewall Settings**
   - Ensure WordPress server can reach CRM server
   - Check for IP restrictions on CRM system
   - Verify ports 80/443 are open

4. **SSL Certificate Issues**
   ```php
   // Temporarily disable SSL verification for testing
   add_filter('wp_crm_http_args', function($args) {
       $args['sslverify'] = false;
       return $args;
   });
   ```

**Solutions:**

1. **Update CRM URL**: Remove trailing slashes and ensure proper protocol
2. **Contact Network Administrator**: Check firewall and routing rules
3. **Update SSL Certificate**: Ensure valid certificate on CRM server
4. **Check DNS Resolution**: Verify domain resolves correctly

### Problem: "Invalid API Key" Error

**Symptoms:**
- HTTP 401 Unauthorized responses
- "Authentication failed" messages
- API key rejected by CRM system

**Diagnostic Steps:**

1. **Verify API Key Format**
   ```
   ✓ Correct: wp_integration_abc123def456
   ✗ Incorrect: abc123def456 (missing prefix)
   ✗ Incorrect: wp_integration_abc123def456  (trailing space)
   ```

2. **Check API Key Permissions**
   - Verify key has WordPress integration permissions
   - Check key expiration date
   - Confirm key is active in CRM system

3. **Test API Key Manually**
   ```bash
   curl -H "Authorization: Bearer your-api-key" \
        https://your-crm-url.com/api/integrations/wordpress/test
   ```

**Solutions:**

1. **Regenerate API Key**: Create new key in CRM system
2. **Update Permissions**: Ensure key has required permissions
3. **Check Key Storage**: Verify key is saved correctly in WordPress

## Data Synchronization Issues

### Problem: Data Not Syncing

**Symptoms:**
- No data appearing in CRM system
- Sync logs show no activity
- Events not triggering synchronization

**Diagnostic Steps:**

1. **Check Sync Settings**
   - Verify sync options are enabled
   - Confirm field mappings are configured
   - Check event triggers are active

2. **Review WordPress Hooks**
   ```php
   // Add debug logging to check if hooks are firing
   add_action('user_register', function($user_id) {
       error_log('User registered: ' . $user_id);
   });
   
   add_action('woocommerce_new_order', function($order_id) {
       error_log('New order created: ' . $order_id);
   });
   ```

3. **Check Queue Status**
   - Navigate to plugin monitoring page
   - Review queue processing status
   - Check for stuck or failed jobs

**Solutions:**

1. **Enable Debug Logging**
   ```php
   // Add to wp-config.php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_CRM_DEBUG', true);
   ```

2. **Manual Sync Test**
   - Use plugin's manual sync feature
   - Check logs for detailed error messages
   - Verify data format and field mappings

3. **Clear and Restart Queue**
   - Clear stuck queue items
   - Restart cron processing
   - Check WordPress cron functionality

### Problem: Partial Data Syncing

**Symptoms:**
- Some fields missing in CRM
- Incomplete customer records
- Order data partially synchronized

**Diagnostic Steps:**

1. **Review Field Mappings**
   - Check all required fields are mapped
   - Verify WordPress field names are correct
   - Confirm data exists in WordPress

2. **Check Data Validation**
   ```php
   // Debug field mapping
   add_filter('wp_crm_customer_data', function($data) {
       error_log('Customer data: ' . print_r($data, true));
       return $data;
   });
   ```

3. **Validate CRM Schema**
   - Ensure CRM accepts all mapped fields
   - Check for field type mismatches
   - Verify required field constraints

**Solutions:**

1. **Update Field Mappings**: Correct any incorrect field assignments
2. **Add Missing Fields**: Map all required CRM fields
3. **Data Type Conversion**: Ensure data types match CRM expectations

## Performance Issues

### Problem: Slow Synchronization

**Symptoms:**
- Long delays in data sync
- Timeouts during large operations
- Poor website performance during sync

**Diagnostic Steps:**

1. **Check Batch Sizes**
   - Review current batch size settings
   - Monitor processing times
   - Check memory usage

2. **Analyze Network Latency**
   ```bash
   # Test API response times
   time curl https://your-crm-url.com/api/integrations/wordpress/test
   ```

3. **Review Server Resources**
   - Check PHP memory limits
   - Monitor CPU usage during sync
   - Verify database performance

**Solutions:**

1. **Optimize Batch Settings**
   ```php
   // Reduce batch size for better performance
   add_filter('wp_crm_batch_size', function($size) {
       return 10; // Smaller batches
   });
   ```

2. **Enable Queue Processing**
   - Use asynchronous processing
   - Configure appropriate cron intervals
   - Implement proper error handling

3. **Increase Resource Limits**
   ```php
   // Increase PHP limits
   ini_set('memory_limit', '256M');
   ini_set('max_execution_time', 300);
   ```

### Problem: Memory Errors

**Symptoms:**
- "Fatal error: Allowed memory size exhausted"
- Plugin crashes during large syncs
- WordPress becomes unresponsive

**Solutions:**

1. **Increase Memory Limit**
   ```php
   // In wp-config.php
   define('WP_MEMORY_LIMIT', '256M');
   
   // In .htaccess
   php_value memory_limit 256M
   ```

2. **Optimize Data Processing**
   ```php
   // Process data in smaller chunks
   add_filter('wp_crm_chunk_size', function($size) {
       return 5; // Very small chunks for memory-constrained servers
   });
   ```

## Plugin Conflicts

### Problem: Plugin Not Working After Activation

**Symptoms:**
- White screen of death
- Plugin admin pages not loading
- JavaScript errors in browser console

**Diagnostic Steps:**

1. **Check for Plugin Conflicts**
   - Deactivate all other plugins
   - Test CRM integration functionality
   - Reactivate plugins one by one

2. **Review Error Logs**
   ```bash
   # Check WordPress error log
   tail -f /path/to/wordpress/wp-content/debug.log
   
   # Check server error log
   tail -f /var/log/apache2/error.log
   ```

3. **Test Theme Compatibility**
   - Switch to default WordPress theme
   - Test plugin functionality
   - Check for theme-specific conflicts

**Solutions:**

1. **Identify Conflicting Plugin**: Isolate and resolve conflicts
2. **Update Plugins**: Ensure all plugins are current versions
3. **Contact Support**: Report compatibility issues

### Problem: JavaScript Errors in Admin

**Symptoms:**
- Admin interface not working properly
- AJAX requests failing
- Console shows JavaScript errors

**Diagnostic Steps:**

1. **Check Browser Console**
   - Open developer tools
   - Look for JavaScript errors
   - Note specific error messages

2. **Test Different Browsers**
   - Try Chrome, Firefox, Safari
   - Check for browser-specific issues
   - Test with disabled extensions

**Solutions:**

1. **Clear Browser Cache**: Force refresh admin pages
2. **Update WordPress**: Ensure latest WordPress version
3. **Check Plugin Assets**: Verify CSS/JS files are loading

## WooCommerce Integration Issues

### Problem: Orders Not Syncing

**Symptoms:**
- New orders not appearing in CRM
- Order status changes not syncing
- WooCommerce hooks not firing

**Diagnostic Steps:**

1. **Verify WooCommerce Version**
   - Check compatibility with current WooCommerce version
   - Review WooCommerce changelog for hook changes

2. **Test Order Creation**
   ```php
   // Debug WooCommerce hooks
   add_action('woocommerce_new_order', function($order_id) {
       error_log('WooCommerce new order hook fired: ' . $order_id);
   }, 5);
   ```

3. **Check Order Status Mapping**
   - Verify order status field mapping
   - Check for custom order statuses

**Solutions:**

1. **Update Hook Priorities**: Ensure proper hook execution order
2. **Map Custom Statuses**: Add custom order status mappings
3. **Test with Default WooCommerce**: Isolate custom modifications

## API Response Errors

### Problem: HTTP Error Codes

**Common Error Codes and Solutions:**

#### 400 Bad Request
- **Cause**: Invalid data format or missing required fields
- **Solution**: Check field mappings and data validation
- **Debug**: Log request payload and review CRM requirements

#### 401 Unauthorized
- **Cause**: Invalid or expired API key
- **Solution**: Regenerate API key and update plugin settings
- **Debug**: Verify API key format and permissions

#### 403 Forbidden
- **Cause**: API key lacks required permissions
- **Solution**: Update API key permissions in CRM system
- **Debug**: Check CRM user role and access controls

#### 404 Not Found
- **Cause**: Incorrect API endpoint URL
- **Solution**: Verify CRM URL and endpoint paths
- **Debug**: Check CRM API documentation for correct endpoints

#### 429 Too Many Requests
- **Cause**: Rate limiting by CRM system
- **Solution**: Implement proper backoff and retry logic
- **Debug**: Review API rate limits and adjust batch sizes

#### 500 Internal Server Error
- **Cause**: CRM system error or database issues
- **Solution**: Contact CRM administrator
- **Debug**: Check CRM system logs and status

## Debugging Tools and Techniques

### Enable Debug Logging

```php
// Add to wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
define('WP_CRM_DEBUG', true);
```

### Custom Debug Functions

```php
// Add debug logging function
function wp_crm_debug_log($message, $data = null) {
    if (defined('WP_CRM_DEBUG') && WP_CRM_DEBUG) {
        $log_message = '[WP-CRM] ' . $message;
        if ($data) {
            $log_message .= ': ' . print_r($data, true);
        }
        error_log($log_message);
    }
}

// Use in plugin code
wp_crm_debug_log('API Request', $request_data);
wp_crm_debug_log('API Response', $response_data);
```

### Network Debugging

```bash
# Test API connectivity
curl -v -H "Authorization: Bearer your-api-key" \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}' \
     https://your-crm-url.com/api/integrations/wordpress/customers

# Check DNS resolution
nslookup your-crm-domain.com

# Test SSL certificate
openssl s_client -connect your-crm-domain.com:443
```

## Getting Additional Help

### Before Contacting Support

1. **Gather Information**:
   - WordPress version
   - Plugin version
   - PHP version
   - Error messages (exact text)
   - Steps to reproduce the issue

2. **Check Logs**:
   - WordPress debug log
   - Server error log
   - Plugin-specific logs

3. **Test in Isolation**:
   - Disable other plugins
   - Switch to default theme
   - Test on staging site

### Support Resources

- **Plugin Documentation**: Review all documentation files
- **WordPress Forums**: Search for similar issues
- **CRM System Support**: Contact CRM administrator for API issues
- **Developer Resources**: Check WordPress and WooCommerce documentation

### Providing Debug Information

When requesting support, include:

```
WordPress Version: 6.0
Plugin Version: 1.0.0
PHP Version: 8.0
WooCommerce Version: 6.5.0 (if applicable)

Error Message:
[Exact error message here]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Error occurs]

Debug Log Excerpt:
[Relevant log entries]

Configuration:
- CRM URL: [URL without sensitive info]
- Sync Options: [Enabled options]
- Field Mappings: [Brief description]
```

This troubleshooting guide should help resolve most common issues. For complex problems, don't hesitate to seek additional support with detailed information about your specific setup and error conditions.