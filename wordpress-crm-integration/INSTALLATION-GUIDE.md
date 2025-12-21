# WordPress CRM Integration Plugin - Installation Guide

## Overview

The WordPress CRM Integration plugin enables seamless synchronization of customer data, orders, and products between your WordPress website and your CRM system. This guide will walk you through the complete installation and configuration process.

## System Requirements

### WordPress Requirements
- WordPress 5.0 or higher
- PHP 7.4 or higher
- MySQL 5.6 or higher (or MariaDB equivalent)
- SSL certificate (recommended for secure API communication)

### CRM System Requirements
- Next.js CRM system with WordPress integration endpoints
- Valid API key for authentication
- Network connectivity between WordPress and CRM servers

### Optional Requirements
- WooCommerce plugin (for e-commerce data synchronization)
- WordPress Multisite support (plugin is multisite compatible)

## Installation Steps

### Step 1: Download the Plugin

1. Download the latest plugin ZIP file: `wordpress-crm-integration-v1.0.0.zip`
2. Verify the file integrity (optional but recommended)

### Step 2: Upload and Install

#### Method 1: WordPress Admin Dashboard (Recommended)

1. Log in to your WordPress admin dashboard
2. Navigate to **Plugins > Add New**
3. Click **Upload Plugin** button
4. Choose the downloaded ZIP file
5. Click **Install Now**
6. After installation completes, click **Activate Plugin**

#### Method 2: FTP Upload

1. Extract the ZIP file to get the `wordpress-crm-integration` folder
2. Upload the folder to `/wp-content/plugins/` directory via FTP
3. Log in to WordPress admin dashboard
4. Navigate to **Plugins > Installed Plugins**
5. Find "WordPress CRM Integration" and click **Activate**

#### Method 3: WP-CLI (Advanced Users)

```bash
# Upload and install
wp plugin install /path/to/wordpress-crm-integration-v1.0.0.zip

# Activate the plugin
wp plugin activate wordpress-crm-integration
```

### Step 3: Verify Installation

1. After activation, you should see a success message
2. Check that **Settings > CRM Integration** appears in your admin menu
3. Verify no error messages appear in the WordPress admin

## Initial Configuration

### Step 1: Access Plugin Settings

1. Navigate to **Settings > CRM Integration** in your WordPress admin
2. You'll see the main configuration page with several tabs:
   - **Connection Settings**
   - **Field Mapping**
   - **Sync Options**
   - **Monitoring**
   - **Logs**

### Step 2: Configure Connection Settings

1. **CRM URL**: Enter your CRM system's base URL
   ```
   Example: https://your-crm-domain.com
   ```

2. **API Key**: Enter the API key provided by your CRM administrator
   ```
   Example: wp_integration_abc123def456ghi789
   ```

3. **Tenant Key** (if applicable): Enter your tenant identifier for multi-tenant CRM systems
   ```
   Example: company-abc-123
   ```

4. Click **Test Connection** to verify the settings
   - ✅ Success: "Connection successful! CRM system is reachable."
   - ❌ Error: Check URL, API key, and network connectivity

### Step 3: Configure Field Mapping

The field mapping section allows you to map WordPress fields to your CRM fields.

#### Customer Field Mapping

| CRM Field | WordPress Field Options |
|-----------|------------------------|
| Email | User Email, Billing Email |
| First Name | User First Name, Billing First Name |
| Last Name | User Last Name, Billing Last Name |
| Phone | User Meta: phone, Billing Phone |
| Company | User Meta: company, Billing Company |
| Address | Billing Address 1 |
| City | Billing City |
| State | Billing State |
| Country | Billing Country |
| Postal Code | Billing Postcode |

#### Order Field Mapping (WooCommerce Required)

| CRM Field | WordPress Field Options |
|-----------|------------------------|
| Order ID | WooCommerce Order ID |
| Total Amount | Order Total |
| Currency | Order Currency |
| Status | Order Status |
| Order Date | Order Date Created |

#### Product Field Mapping (WooCommerce Required)

| CRM Field | WordPress Field Options |
|-----------|------------------------|
| Product Name | Product Title |
| Description | Product Description |
| SKU | Product SKU |
| Price | Product Price |
| Category | Product Categories |

### Step 4: Configure Sync Options

1. **Enable Synchronization**:
   - ☑️ Customer Data Sync
   - ☑️ Order Data Sync (requires WooCommerce)
   - ☑️ Product Data Sync (requires WooCommerce)

2. **Sync Triggers**:
   - ☑️ User Registration
   - ☑️ Order Creation
   - ☑️ Order Status Change
   - ☑️ Product Updates

3. **Advanced Options**:
   - **Retry Attempts**: 3 (recommended)
   - **Retry Delay**: 30 seconds
   - **Batch Size**: 10 items
   - **Queue Processing**: Enable

### Step 5: Test the Integration

1. **Manual Test**:
   - Go to **Monitoring** tab
   - Click **Test Customer Sync**
   - Verify the test completes successfully

2. **Live Test**:
   - Create a test user registration
   - Check the **Logs** tab for sync activity
   - Verify data appears in your CRM system

## Post-Installation Checklist

- [ ] Plugin activated successfully
- [ ] Connection test passes
- [ ] Field mappings configured
- [ ] Sync options enabled
- [ ] Test sync completed successfully
- [ ] Error logs are empty
- [ ] CRM system receives test data

## Security Considerations

### API Key Security
- Store API keys securely
- Use HTTPS for all communications
- Rotate API keys regularly
- Limit API key permissions to necessary operations only

### Data Privacy
- Ensure compliance with GDPR, CCPA, and other privacy regulations
- Configure appropriate data retention policies
- Implement proper user consent mechanisms
- Document data processing activities

### Network Security
- Use SSL/TLS encryption for API communications
- Implement proper firewall rules
- Monitor for suspicious API activity
- Regular security audits

## Performance Optimization

### Recommended Settings
- Enable queue processing for high-traffic sites
- Set appropriate batch sizes (10-50 items)
- Configure retry limits to prevent infinite loops
- Use caching where appropriate

### Monitoring
- Regularly check sync logs
- Monitor API response times
- Set up alerts for failed syncs
- Review error patterns

## Troubleshooting Common Issues

See the [Troubleshooting Guide](TROUBLESHOOTING-GUIDE.md) for detailed solutions to common problems.

## Support and Updates

### Getting Help
- Check the troubleshooting guide first
- Review plugin logs for error details
- Contact your CRM administrator for API issues
- Submit support tickets with detailed error information

### Plugin Updates
- Updates preserve all configuration settings
- Backup your site before major updates
- Test updates in staging environment first
- Review changelog for breaking changes

## Next Steps

After successful installation:

1. **Configure Advanced Features**:
   - Set up automated backups
   - Configure monitoring alerts
   - Implement data validation rules

2. **Train Your Team**:
   - Document your specific field mappings
   - Create user guides for your organization
   - Set up monitoring procedures

3. **Monitor and Maintain**:
   - Regular log reviews
   - Performance monitoring
   - Security updates
   - Data quality checks

For detailed configuration examples and advanced features, see the [Configuration Examples](CONFIGURATION-EXAMPLES.md) document.