/**
 * WordPress CRM Integration Admin JavaScript
 */

(function($) {
    'use strict';
    
    var WpCrmAdmin = {
        
        /**
         * Initialize admin functionality
         */
        init: function() {
            this.bindEvents();
            this.initTabs();
        },
        
        /**
         * Bind event handlers
         */
        bindEvents: function() {
            // Connection test button
            $('#wp-crm-test-connection').on('click', this.testConnection);
            
            // Field mapping refresh
            $('#wp-crm-refresh-fields').on('click', this.refreshWordPressFields);
            
            // Real-time credential validation
            $('#crm_url, #api_key, #tenant_key').on('blur', function() {
                clearTimeout(WpCrmAdmin.validationTimeout);
                WpCrmAdmin.validationTimeout = setTimeout(function() {
                    WpCrmAdmin.validateCredentials();
                }, 500);
            });
            
            // Form validation
            $('form').on('submit', this.validateForm);
            
            // Auto-save settings
            $('input, select, textarea').on('change', this.autoSave);
            
            // Periodic connection status check
            if ($('#wp-crm-sync-status').length > 0) {
                setInterval(function() {
                    WpCrmAdmin.checkConnectionStatus();
                }, 30000); // Check every 30 seconds
            }
        },
        
        /**
         * Initialize tab functionality
         */
        initTabs: function() {
            $('.wp-crm-tabs a').on('click', function(e) {
                e.preventDefault();
                
                var target = $(this).attr('href');
                
                // Update active tab
                $('.wp-crm-tabs a').removeClass('active');
                $(this).addClass('active');
                
                // Show target content
                $('.wp-crm-tab-content').removeClass('active');
                $(target).addClass('active');
            });
        },
        
        /**
         * Test CRM connection
         */
        testConnection: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var $status = $('#wp-crm-connection-status');
            var crmUrl = $('#crm_url').val();
            var apiKey = $('#api_key').val();
            var tenantKey = $('#tenant_key').val();
            
            if (!crmUrl || !apiKey) {
                $status.removeClass('success loading').addClass('error')
                    .html('<strong>Error:</strong> Please enter both CRM URL and API Key.');
                return;
            }
            
            // Show loading state
            $button.prop('disabled', true);
            $status.removeClass('success error').addClass('loading')
                .html('<span class="spinner is-active"></span> ' + wpCrmAjax.strings.testing_connection);
            
            // Make AJAX request
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_test_connection',
                    nonce: wpCrmAjax.nonce,
                    crm_url: crmUrl,
                    api_key: apiKey,
                    tenant_key: tenantKey
                },
                success: function(response) {
                    if (response.success) {
                        var html = '<strong>✓ ' + response.data.message + '</strong>';
                        
                        if (response.data.connection_data) {
                            html += '<br><small>';
                            html += 'API Version: ' + (response.data.connection_data.api_version || 'Unknown') + ' | ';
                            html += 'Tenant: ' + (response.data.connection_data.tenant_key || 'Default');
                            html += '</small>';
                        }
                        
                        if (response.data.endpoint_tests) {
                            html += '<br><small>Endpoints: ';
                            var endpoints = [];
                            $.each(response.data.endpoint_tests, function(endpoint, test) {
                                var status = test.success ? '✓' : '✗';
                                endpoints.push(status + ' ' + endpoint);
                            });
                            html += endpoints.join(', ') + '</small>';
                        }
                        
                        $status.removeClass('loading error').addClass('success').html(html);
                        
                        // Update sync status in sidebar
                        WpCrmAdmin.updateSyncStatus('connected');
                        
                    } else {
                        var errorHtml = '<strong>✗ Connection Failed</strong><br>';
                        errorHtml += response.data.message;
                        
                        if (response.data.errors && response.data.errors.length > 0) {
                            errorHtml += '<br><small>Issues: ' + response.data.errors.join(', ') + '</small>';
                        }
                        
                        $status.removeClass('loading success').addClass('error').html(errorHtml);
                        
                        // Update sync status in sidebar
                        WpCrmAdmin.updateSyncStatus('failed');
                    }
                },
                error: function(xhr, status, error) {
                    $status.removeClass('loading success').addClass('error')
                        .html('<strong>✗ Connection Error</strong><br>' + error);
                    
                    WpCrmAdmin.updateSyncStatus('error');
                },
                complete: function() {
                    $button.prop('disabled', false);
                }
            });
        },
        
        /**
         * Validate credentials in real-time
         */
        validateCredentials: function() {
            var crmUrl = $('#crm_url').val();
            var apiKey = $('#api_key').val();
            var tenantKey = $('#tenant_key').val();
            
            if (!crmUrl || !apiKey) {
                return;
            }
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_validate_credentials',
                    nonce: wpCrmAjax.nonce,
                    crm_url: crmUrl,
                    api_key: apiKey,
                    tenant_key: tenantKey
                },
                success: function(response) {
                    if (response.success) {
                        $('#wp-crm-test-connection').prop('disabled', false);
                        WpCrmAdmin.showFieldValidation('crm_url', true);
                        WpCrmAdmin.showFieldValidation('api_key', true);
                    } else {
                        $('#wp-crm-test-connection').prop('disabled', true);
                        if (response.data.errors) {
                            response.data.errors.forEach(function(error) {
                                if (error.includes('URL')) {
                                    WpCrmAdmin.showFieldValidation('crm_url', false, error);
                                } else if (error.includes('API key')) {
                                    WpCrmAdmin.showFieldValidation('api_key', false, error);
                                }
                            });
                        }
                    }
                }
            });
        },
        
        /**
         * Show field validation feedback
         */
        showFieldValidation: function(fieldId, isValid, message) {
            var $field = $('#' + fieldId);
            var $feedback = $field.next('.wp-crm-field-feedback');
            
            if ($feedback.length === 0) {
                $feedback = $('<div class="wp-crm-field-feedback"></div>');
                $field.after($feedback);
            }
            
            $field.removeClass('valid invalid');
            $feedback.removeClass('valid invalid').empty();
            
            if (isValid) {
                $field.addClass('valid');
                $feedback.addClass('valid').text('✓');
            } else if (message) {
                $field.addClass('invalid');
                $feedback.addClass('invalid').text('✗ ' + message);
            }
        },
        
        /**
         * Update sync status in sidebar
         */
        updateSyncStatus: function(status) {
            var $syncStatus = $('#wp-crm-sync-status');
            var statusHtml = '';
            
            switch (status) {
                case 'connected':
                    statusHtml = '<p class="wp-crm-status-success">✓ Connected to CRM</p>';
                    break;
                case 'failed':
                    statusHtml = '<p class="wp-crm-status-error">✗ Connection failed</p>';
                    break;
                case 'error':
                    statusHtml = '<p class="wp-crm-status-error">✗ Connection error</p>';
                    break;
                default:
                    statusHtml = '<p class="wp-crm-status-info">? Unknown status</p>';
            }
            
            $syncStatus.html(statusHtml);
        },
        
        /**
         * Refresh WordPress fields for mapping
         */
        refreshWordPressFields: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            
            $button.prop('disabled', true).text(wpCrmAjax.strings.loading_fields);
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_get_wordpress_fields',
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        WpCrmAdmin.updateFieldMappingOptions(response.data);
                    }
                },
                complete: function() {
                    $button.prop('disabled', false).text('Refresh Fields');
                }
            });
        },
        
        /**
         * Update field mapping dropdown options
         */
        updateFieldMappingOptions: function(fields) {
            $('.wp-crm-field-mapping select').each(function() {
                var $select = $(this);
                var currentValue = $select.val();
                
                // Clear existing options except the first one
                $select.find('option:not(:first)').remove();
                
                // Add new options
                $.each(fields, function(category, categoryFields) {
                    if (categoryFields.length > 0) {
                        var $optgroup = $('<optgroup>').attr('label', category);
                        
                        $.each(categoryFields, function(index, field) {
                            $optgroup.append(
                                $('<option>').val(field.key).text(field.label)
                            );
                        });
                        
                        $select.append($optgroup);
                    }
                });
                
                // Restore previous value if it still exists
                if (currentValue && $select.find('option[value="' + currentValue + '"]').length > 0) {
                    $select.val(currentValue);
                }
            });
        },
        
        /**
         * Validate form before submission
         */
        validateForm: function(e) {
            var isValid = true;
            var errors = [];
            
            // Check required fields
            var crmUrl = $('#crm_url').val();
            var apiKey = $('#api_key').val();
            
            if (!crmUrl) {
                errors.push('CRM URL is required.');
                isValid = false;
            }
            
            if (!apiKey) {
                errors.push('API Key is required.');
                isValid = false;
            }
            
            // Validate URL format
            if (crmUrl && !WpCrmAdmin.isValidUrl(crmUrl)) {
                errors.push('Please enter a valid CRM URL.');
                isValid = false;
            }
            
            // Check if any sync is enabled
            var syncEnabled = $('input[name*="sync_enabled"]:checked').length > 0;
            if (!syncEnabled) {
                errors.push('Please enable at least one sync type.');
                isValid = false;
            }
            
            if (!isValid) {
                e.preventDefault();
                alert('Please fix the following errors:\n\n' + errors.join('\n'));
            }
            
            return isValid;
        },
        
        /**
         * Auto-save settings (debounced)
         */
        autoSave: function() {
            clearTimeout(WpCrmAdmin.autoSaveTimeout);
            WpCrmAdmin.autoSaveTimeout = setTimeout(function() {
                // Auto-save logic here if needed
                console.log('Auto-save triggered');
            }, 2000);
        },
        
        /**
         * Validate URL format
         */
        isValidUrl: function(string) {
            try {
                new URL(string);
                return true;
            } catch (_) {
                return false;
            }
        },
        
        /**
         * Check connection status periodically
         */
        checkConnectionStatus: function() {
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_get_connection_status',
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        var status = response.data.status;
                        var canConnect = response.data.can_connect;
                        
                        if (canConnect) {
                            WpCrmAdmin.updateSyncStatus('connected');
                        } else {
                            WpCrmAdmin.updateSyncStatus('failed');
                        }
                    }
                },
                error: function() {
                    WpCrmAdmin.updateSyncStatus('error');
                }
            });
        },
        
        /**
         * Show notification
         */
        showNotification: function(message, type) {
            type = type || 'info';
            
            var $notification = $('<div>')
                .addClass('notice notice-' + type + ' is-dismissible')
                .html('<p>' + message + '</p>');
            
            $('.wrap h1').after($notification);
            
            // Auto-dismiss after 5 seconds
            setTimeout(function() {
                $notification.fadeOut(function() {
                    $(this).remove();
                });
            }, 5000);
        }
    };
    
    // Initialize when document is ready
    $(document).ready(function() {
        WpCrmAdmin.init();
    });
    
    // Make WpCrmAdmin globally available
    window.WpCrmAdmin = WpCrmAdmin;
    
})(jQuery);
/**
 * Monitoring Dashboard Extensions
 */
(function($) {
    'use strict';
    
    var WpCrmMonitoring = {
        
        /**
         * Initialize monitoring functionality
         */
        init: function() {
            this.bindMonitoringEvents();
            this.initAutoRefresh();
        },
        
        /**
         * Bind monitoring-specific events
         */
        bindMonitoringEvents: function() {
            // Sync status refresh
            $('#wp-crm-sync-status-refresh').on('click', this.refreshSyncStatus);
            
            // Manual sync testing
            $('.wp-crm-test-sync').on('click', this.testManualSync);
            
            // Connection test (detailed)
            $('#wp-crm-test-connection-detailed').on('click', this.testConnectionDetailed);
            
            // Sync toggle controls
            $('.sync-control-item input[type="checkbox"]').on('change', this.toggleSyncType);
            
            // Failure threshold reset
            $('button[name="reset_failure_threshold"]').on('click', this.resetFailureThreshold);
        },
        
        /**
         * Initialize auto-refresh functionality
         */
        initAutoRefresh: function() {
            // Auto-refresh sync status every 30 seconds on monitoring tab
            if ($('.wp-crm-monitoring-overview').length > 0) {
                setInterval(function() {
                    WpCrmMonitoring.refreshSyncStatus(null, true); // Silent refresh
                }, 30000);
            }
        },
        
        /**
         * Refresh sync status
         */
        refreshSyncStatus: function(e, silent) {
            if (e) {
                e.preventDefault();
            }
            
            var $button = $('#wp-crm-sync-status-refresh');
            var originalText = $button.text();
            
            if (!silent) {
                $button.text(wpCrmAjax.strings.checking_status || 'Refreshing...').prop('disabled', true);
            }
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_get_sync_status',
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        WpCrmMonitoring.updateMonitoringDashboard(response.data);
                        
                        if (!silent) {
                            WpCrmAdmin.showNotification('Sync status refreshed successfully.', 'success');
                        }
                    } else {
                        if (!silent) {
                            WpCrmAdmin.showNotification('Failed to refresh sync status.', 'error');
                        }
                    }
                },
                error: function() {
                    if (!silent) {
                        WpCrmAdmin.showNotification('Error refreshing sync status.', 'error');
                    }
                },
                complete: function() {
                    if (!silent) {
                        $button.text(originalText).prop('disabled', false);
                    }
                }
            });
        },
        
        /**
         * Test manual sync
         */
        testManualSync: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var syncType = $button.data('sync-type');
            var originalText = $button.text();
            
            if (!syncType) {
                WpCrmAdmin.showNotification('Invalid sync type.', 'error');
                return;
            }
            
            // Update button state
            $button.addClass('testing')
                   .text('Testing...')
                   .prop('disabled', true);
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_test_manual_sync',
                    sync_type: syncType,
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        WpCrmAdmin.showNotification(response.data.message, 'success');
                        
                        // Show execution time if available
                        if (response.data.execution_time) {
                            var timeMsg = 'Execution time: ' + response.data.execution_time.toFixed(2) + ' seconds';
                            WpCrmAdmin.showNotification(timeMsg, 'info');
                        }
                        
                        // Refresh activity dashboard
                        setTimeout(function() {
                            WpCrmMonitoring.refreshSyncStatus(null, true);
                        }, 1000);
                        
                    } else {
                        WpCrmAdmin.showNotification(response.data.message, 'error');
                        
                        // Show error details if available
                        if (response.data.error_details) {
                            console.error('Sync test error details:', response.data.error_details);
                        }
                    }
                },
                error: function(xhr, status, error) {
                    WpCrmAdmin.showNotification('Sync test failed: ' + error, 'error');
                },
                complete: function() {
                    $button.removeClass('testing')
                           .text(originalText)
                           .prop('disabled', false);
                }
            });
        },
        
        /**
         * Test connection with detailed feedback
         */
        testConnectionDetailed: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var originalText = $button.text();
            
            $button.text('Testing...').prop('disabled', true);
            
            // Use the existing connection test but with enhanced feedback
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_test_connection',
                    nonce: wpCrmAjax.nonce,
                    crm_url: $('#crm_url').val() || wpCrmSettings.crm_url,
                    api_key: $('#api_key').val() || wpCrmSettings.api_key,
                    tenant_key: $('#tenant_key').val() || wpCrmSettings.tenant_key
                },
                success: function(response) {
                    if (response.success) {
                        var message = 'Connection test successful!';
                        
                        if (response.data.endpoint_tests) {
                            var endpointResults = [];
                            $.each(response.data.endpoint_tests, function(endpoint, test) {
                                var status = test.success ? '✓' : '✗';
                                endpointResults.push(status + ' ' + endpoint + ' endpoint');
                            });
                            message += '<br><small>' + endpointResults.join('<br>') + '</small>';
                        }
                        
                        WpCrmAdmin.showNotification(message, 'success');
                    } else {
                        var errorMessage = 'Connection test failed: ' + response.data.message;
                        
                        if (response.data.errors && response.data.errors.length > 0) {
                            errorMessage += '<br><small>Details: ' + response.data.errors.join(', ') + '</small>';
                        }
                        
                        WpCrmAdmin.showNotification(errorMessage, 'error');
                    }
                },
                error: function(xhr, status, error) {
                    WpCrmAdmin.showNotification('Connection test error: ' + error, 'error');
                },
                complete: function() {
                    $button.text(originalText).prop('disabled', false);
                }
            });
        },
        
        /**
         * Toggle sync type via AJAX
         */
        toggleSyncType: function(e) {
            var $checkbox = $(this);
            var syncType = $checkbox.attr('name').match(/sync_enabled\[(\w+)\]/)[1];
            var enabled = $checkbox.is(':checked');
            
            // Optimistic UI update
            var $statusIndicator = $checkbox.closest('label').find('.wp-crm-status-indicator');
            $statusIndicator.removeClass('success warning error')
                           .addClass(enabled ? 'success' : 'warning')
                           .text(enabled ? 'Active' : 'Disabled');
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_toggle_sync',
                    sync_type: syncType,
                    enabled: enabled,
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        WpCrmAdmin.showNotification(response.data.message, 'success');
                    } else {
                        // Revert checkbox state
                        $checkbox.prop('checked', !enabled);
                        $statusIndicator.removeClass('success warning error')
                                       .addClass(!enabled ? 'success' : 'warning')
                                       .text(!enabled ? 'Active' : 'Disabled');
                        
                        WpCrmAdmin.showNotification(response.data.message, 'error');
                    }
                },
                error: function() {
                    // Revert checkbox state
                    $checkbox.prop('checked', !enabled);
                    $statusIndicator.removeClass('success warning error')
                                   .addClass(!enabled ? 'success' : 'warning')
                                   .text(!enabled ? 'Active' : 'Disabled');
                    
                    WpCrmAdmin.showNotification('Failed to update sync settings.', 'error');
                }
            });
        },
        
        /**
         * Reset failure threshold
         */
        resetFailureThreshold: function(e) {
            if (!confirm('Are you sure you want to reset the failure counter? This will re-enable sync operations.')) {
                e.preventDefault();
                return false;
            }
            
            var $button = $(this);
            var originalText = $button.text();
            
            $button.text('Resetting...').prop('disabled', true);
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_reset_failure_threshold',
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        WpCrmAdmin.showNotification(response.data.message, 'success');
                        
                        // Refresh the page to update the UI
                        setTimeout(function() {
                            location.reload();
                        }, 1500);
                    } else {
                        WpCrmAdmin.showNotification(response.data.message, 'error');
                    }
                },
                error: function() {
                    WpCrmAdmin.showNotification('Failed to reset failure threshold.', 'error');
                },
                complete: function() {
                    $button.text(originalText).prop('disabled', false);
                }
            });
            
            e.preventDefault();
            return false;
        },
        
        /**
         * Update monitoring dashboard with new data
         */
        updateMonitoringDashboard: function(data) {
            // Update overall status
            if (data.overall_status) {
                var $statusIndicator = $('.wp-crm-monitoring-overview .wp-crm-status-indicator').first();
                if ($statusIndicator.length > 0) {
                    $statusIndicator.removeClass('success warning error unknown')
                                   .addClass(data.overall_status.status === 'active' ? 'success' : 
                                           (data.overall_status.status === 'disabled' ? 'error' : 'warning'))
                                   .text(data.overall_status.label);
                    
                    $statusIndicator.next('.description').text(data.overall_status.description);
                }
            }
            
            // Update statistics
            if (data.statistics) {
                $('.stat-item').each(function() {
                    var $item = $(this);
                    var $count = $item.find('.count');
                    
                    if ($item.find('span').first().text().includes('Total Operations')) {
                        $count.text(data.statistics.total_operations);
                    } else if ($item.find('span').first().text().includes('Success Rate')) {
                        $count.removeClass('success warning error')
                              .addClass(data.statistics.success_rate >= 95 ? 'success' : 
                                      (data.statistics.success_rate >= 80 ? 'warning' : 'error'))
                              .text(data.statistics.success_rate + '%');
                    } else if ($item.find('span').first().text().includes('Errors')) {
                        $count.removeClass('success error')
                              .addClass(data.statistics.error_operations > 0 ? 'error' : 'success')
                              .text(data.statistics.error_operations);
                    }
                });
            }
            
            // Update failure threshold display
            if (data.failure_check) {
                var $thresholdCount = $('.stat-item').filter(function() {
                    return $(this).find('span').first().text().includes('Current Errors');
                }).find('.count');
                
                if ($thresholdCount.length > 0) {
                    $thresholdCount.removeClass('success error')
                                   .addClass(data.failure_check.threshold_exceeded ? 'error' : 'success')
                                   .text(data.failure_check.error_count + ' / ' + data.failure_check.threshold);
                }
            }
            
            // Add timestamp
            var timestamp = new Date().toLocaleTimeString();
            $('.wp-crm-activity-filters span').text('Last updated: ' + timestamp + ' (Auto-refreshes every 30 seconds)');
        },
        
        /**
         * Format time ago
         */
        timeAgo: function(dateString) {
            var now = new Date();
            var date = new Date(dateString);
            var diffMs = now - date;
            var diffMins = Math.floor(diffMs / 60000);
            var diffHours = Math.floor(diffMins / 60);
            var diffDays = Math.floor(diffHours / 24);
            
            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return diffMins + ' minutes ago';
            if (diffHours < 24) return diffHours + ' hours ago';
            return diffDays + ' days ago';
        }
    };
    
    // Initialize monitoring when document is ready
    $(document).ready(function() {
        WpCrmMonitoring.init();
    });
    
    // Make WpCrmMonitoring globally available
    window.WpCrmMonitoring = WpCrmMonitoring;
    
})(jQuery);
/**
 * Backup and Restore Extensions
 */
(function($) {
    'use strict';
    
    var WpCrmBackup = {
        
        /**
         * Initialize backup functionality
         */
        init: function() {
            this.bindBackupEvents();
        },
        
        /**
         * Bind backup-specific events
         */
        bindBackupEvents: function() {
            // Create backup
            $('#create-backup').on('click', this.createBackup);
            
            // Restore backup
            $(document).on('click', '.restore-backup', this.restoreBackup);
            
            // Delete backup
            $(document).on('click', '.delete-backup', this.deleteBackup);
            
            // Export configuration
            $('#export-config').on('click', this.exportConfiguration);
            
            // Import configuration
            $('#import-config').on('click', this.importConfiguration);
            
            // Clear migration log
            $('#clear-migration-log').on('click', this.clearMigrationLog);
            
            // Handle file input for import
            $('#import-file').on('change', this.handleImportFile);
        },
        
        /**
         * Create backup
         */
        createBackup: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var backupName = $('#backup-name').val().trim();
            var originalText = $button.text();
            
            // Update button state
            $button.text(wpCrmAjax.strings.creating_backup || 'Creating backup...')
                   .prop('disabled', true);
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_integration_create_backup',
                    backup_name: backupName,
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        WpCrmAdmin.showNotification(
                            wpCrmAjax.strings.backup_created || 'Backup created successfully!', 
                            'success'
                        );
                        
                        // Clear the backup name input
                        $('#backup-name').val('');
                        
                        // Reload the page to show the new backup
                        setTimeout(function() {
                            location.reload();
                        }, 1500);
                        
                    } else {
                        WpCrmAdmin.showNotification(
                            (wpCrmAjax.strings.backup_failed || 'Failed to create backup:') + ' ' + response.data.message, 
                            'error'
                        );
                    }
                },
                error: function(xhr, status, error) {
                    WpCrmAdmin.showNotification(
                        (wpCrmAjax.strings.backup_failed || 'Failed to create backup:') + ' ' + error, 
                        'error'
                    );
                },
                complete: function() {
                    $button.text(originalText).prop('disabled', false);
                }
            });
        },
        
        /**
         * Restore backup
         */
        restoreBackup: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var backupId = $button.data('backup-id');
            var originalText = $button.text();
            
            // Confirm action
            if (!confirm(wpCrmAjax.strings.confirm_restore || 'Are you sure you want to restore this backup? Current settings will be overwritten.')) {
                return;
            }
            
            // Update button state
            $button.text(wpCrmAjax.strings.restoring_backup || 'Restoring...')
                   .prop('disabled', true);
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_integration_restore_backup',
                    backup_id: backupId,
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        WpCrmAdmin.showNotification(
                            wpCrmAjax.strings.backup_restored || 'Backup restored successfully!', 
                            'success'
                        );
                        
                        // Reload the page to reflect changes
                        setTimeout(function() {
                            location.reload();
                        }, 1500);
                        
                    } else {
                        WpCrmAdmin.showNotification(
                            (wpCrmAjax.strings.restore_failed || 'Failed to restore backup:') + ' ' + response.data.message, 
                            'error'
                        );
                    }
                },
                error: function(xhr, status, error) {
                    WpCrmAdmin.showNotification(
                        (wpCrmAjax.strings.restore_failed || 'Failed to restore backup:') + ' ' + error, 
                        'error'
                    );
                },
                complete: function() {
                    $button.text(originalText).prop('disabled', false);
                }
            });
        },
        
        /**
         * Delete backup
         */
        deleteBackup: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var backupId = $button.data('backup-id');
            var originalText = $button.text();
            
            // Confirm action
            if (!confirm(wpCrmAjax.strings.confirm_delete || 'Are you sure you want to delete this backup? This action cannot be undone.')) {
                return;
            }
            
            // Update button state
            $button.text(wpCrmAjax.strings.deleting_backup || 'Deleting...')
                   .prop('disabled', true);
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_integration_delete_backup',
                    backup_id: backupId,
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        WpCrmAdmin.showNotification(
                            wpCrmAjax.strings.backup_deleted || 'Backup deleted successfully!', 
                            'success'
                        );
                        
                        // Remove the backup row from the table
                        $button.closest('tr').fadeOut(function() {
                            $(this).remove();
                            
                            // Check if table is empty
                            if ($('.wp-crm-backups-table-container tbody tr').length === 0) {
                                $('.wp-crm-backups-table-container').replaceWith(
                                    '<p class="wp-crm-no-backups">No backups found. Create your first backup above.</p>'
                                );
                            }
                        });
                        
                    } else {
                        WpCrmAdmin.showNotification(
                            (wpCrmAjax.strings.delete_failed || 'Failed to delete backup:') + ' ' + response.data.message, 
                            'error'
                        );
                    }
                },
                error: function(xhr, status, error) {
                    WpCrmAdmin.showNotification(
                        (wpCrmAjax.strings.delete_failed || 'Failed to delete backup:') + ' ' + error, 
                        'error'
                    );
                },
                complete: function() {
                    $button.text(originalText).prop('disabled', false);
                }
            });
        },
        
        /**
         * Export configuration
         */
        exportConfiguration: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var originalText = $button.text();
            
            // Update button state
            $button.text(wpCrmAjax.strings.exporting_config || 'Exporting...')
                   .prop('disabled', true);
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_integration_export_config',
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        // Create and download the file
                        var dataStr = JSON.stringify(response.data.data, null, 2);
                        var dataBlob = new Blob([dataStr], {type: 'application/json'});
                        var url = URL.createObjectURL(dataBlob);
                        
                        var link = document.createElement('a');
                        link.href = url;
                        link.download = response.data.filename;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        
                        WpCrmAdmin.showNotification(
                            response.data.message || 'Configuration exported successfully!', 
                            'success'
                        );
                        
                    } else {
                        WpCrmAdmin.showNotification(
                            'Failed to export configuration: ' + response.data.message, 
                            'error'
                        );
                    }
                },
                error: function(xhr, status, error) {
                    WpCrmAdmin.showNotification(
                        'Failed to export configuration: ' + error, 
                        'error'
                    );
                },
                complete: function() {
                    $button.text(originalText).prop('disabled', false);
                }
            });
        },
        
        /**
         * Import configuration
         */
        importConfiguration: function(e) {
            e.preventDefault();
            
            // Trigger file input
            $('#import-file').click();
        },
        
        /**
         * Handle import file selection
         */
        handleImportFile: function(e) {
            var file = e.target.files[0];
            
            if (!file) {
                return;
            }
            
            if (file.type !== 'application/json') {
                WpCrmAdmin.showNotification('Please select a valid JSON file.', 'error');
                return;
            }
            
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var configData = JSON.parse(e.target.result);
                    WpCrmBackup.processImport(configData);
                } catch (error) {
                    WpCrmAdmin.showNotification('Invalid JSON file format.', 'error');
                }
            };
            reader.readAsText(file);
            
            // Clear the file input
            $(this).val('');
        },
        
        /**
         * Process configuration import
         */
        processImport: function(configData) {
            // Confirm action
            if (!confirm('Are you sure you want to import this configuration? Current settings will be overwritten.')) {
                return;
            }
            
            var $button = $('#import-config');
            var originalText = $button.text();
            
            // Update button state
            $button.text(wpCrmAjax.strings.importing_config || 'Importing...')
                   .prop('disabled', true);
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_integration_import_config',
                    config_data: JSON.stringify(configData),
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        WpCrmAdmin.showNotification(
                            wpCrmAjax.strings.import_success || 'Configuration imported successfully!', 
                            'success'
                        );
                        
                        // Reload the page to reflect changes
                        setTimeout(function() {
                            location.reload();
                        }, 1500);
                        
                    } else {
                        WpCrmAdmin.showNotification(
                            (wpCrmAjax.strings.import_failed || 'Failed to import configuration:') + ' ' + response.data.message, 
                            'error'
                        );
                    }
                },
                error: function(xhr, status, error) {
                    WpCrmAdmin.showNotification(
                        (wpCrmAjax.strings.import_failed || 'Failed to import configuration:') + ' ' + error, 
                        'error'
                    );
                },
                complete: function() {
                    $button.text(originalText).prop('disabled', false);
                }
            });
        },
        
        /**
         * Clear migration log
         */
        clearMigrationLog: function(e) {
            e.preventDefault();
            
            if (!confirm('Are you sure you want to clear the migration log? This action cannot be undone.')) {
                return;
            }
            
            var $button = $(this);
            var originalText = $button.text();
            
            $button.text('Clearing...').prop('disabled', true);
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_integration_clear_migration_log',
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        WpCrmAdmin.showNotification('Migration log cleared successfully!', 'success');
                        
                        // Remove log entries and show empty message
                        $('.wp-crm-migration-log').replaceWith(
                            '<p>No migration history available.</p>'
                        );
                        $button.hide();
                        
                    } else {
                        WpCrmAdmin.showNotification('Failed to clear migration log.', 'error');
                    }
                },
                error: function() {
                    WpCrmAdmin.showNotification('Failed to clear migration log.', 'error');
                },
                complete: function() {
                    $button.text(originalText).prop('disabled', false);
                }
            });
        }
    };
    
    // Initialize backup functionality when document is ready
    $(document).ready(function() {
        WpCrmBackup.init();
    });
    
    // Make WpCrmBackup globally available
    window.WpCrmBackup = WpCrmBackup;
    
})(jQuery);