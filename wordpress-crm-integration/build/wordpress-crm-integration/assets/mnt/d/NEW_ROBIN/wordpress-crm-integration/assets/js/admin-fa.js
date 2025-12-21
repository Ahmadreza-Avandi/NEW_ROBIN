/**
 * WordPress CRM Integration Admin JavaScript - Persian Version
 */

(function($) {
    'use strict';
    
    var WpCrmAdmin = {
        
        // Persian messages
        messages: {
            testing_connection: 'در حال تست اتصال...',
            connection_successful: 'اتصال موفقیت‌آمیز!',
            connection_failed: 'اتصال ناموفق:',
            loading_fields: 'در حال بارگذاری فیلدها...',
            validating_credentials: 'در حال اعتبارسنجی مدارک...',
            credentials_valid: 'مدارک معتبر هستند',
            credentials_invalid: 'مدارک نامعتبر',
            checking_status: 'در حال بررسی وضعیت اتصال...',
            error_network: 'خطای شبکه. لطفاً دوباره تلاش کنید.',
            error_missing_fields: 'لطفاً آدرس CRM و کلید API را وارد کنید.',
            success_settings_saved: 'تنظیمات با موفقیت ذخیره شد.',
            error_invalid_url: 'لطفاً یک آدرس معتبر وارد کنید.',
            error_invalid_api_key: 'لطفاً یک کلید API معتبر وارد کنید.',
            confirm_test_sync: 'آیا مطمئن هستید که می‌خواهید همگام‌سازی تستی انجام دهید؟',
            test_sync_success: 'همگام‌سازی تستی با موفقیت انجام شد.',
            test_sync_failed: 'همگام‌سازی تستی ناموفق بود.'
        },
        
        /**
         * Initialize admin functionality
         */
        init: function() {
            this.bindEvents();
            this.initTabs();
            this.initRTL();
        },
        
        /**
         * Initialize RTL support
         */
        initRTL: function() {
            // Add RTL class to body if not already present
            if (!$('body').hasClass('rtl')) {
                $('.wp-crm-integration-admin-container').addClass('rtl-support');
            }
            
            // Fix select2 RTL if present
            if ($.fn.select2) {
                $('.wp-crm-field-mapping').select2({
                    dir: 'rtl',
                    language: {
                        noResults: function() {
                            return 'نتیجه‌ای یافت نشد';
                        },
                        searching: function() {
                            return 'در حال جستجو...';
                        }
                    }
                });
            }
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
            
            // Manual sync test buttons
            $('.wp-crm-test-sync').on('click', this.testManualSync);
            
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
                    .html('<strong>خطا:</strong> ' + WpCrmAdmin.messages.error_missing_fields);
                return;
            }
            
            // Show loading state
            $button.prop('disabled', true).text(WpCrmAdmin.messages.testing_connection);
            $status.removeClass('success error').addClass('loading')
                .html('<span class="wp-crm-spinner"></span> ' + WpCrmAdmin.messages.testing_connection);
            
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
                        var html = '<strong>✓ ' + WpCrmAdmin.messages.connection_successful + '</strong>';
                        
                        if (response.data && response.data.connection_data) {
                            html += '<br><small>';
                            html += 'نسخه API: ' + (response.data.connection_data.api_version || 'نامشخص') + ' | ';
                            html += 'مستاجر: ' + (response.data.connection_data.tenant_key || 'پیش‌فرض');
                            html += '</small>';
                        }
                        
                        $status.removeClass('loading error').addClass('success').html(html);
                        WpCrmAdmin.showFieldValidation('crm_url', true);
                        WpCrmAdmin.showFieldValidation('api_key', true);
                        
                    } else {
                        var errorHtml = '<strong>✗ ' + WpCrmAdmin.messages.connection_failed + '</strong><br>';
                        errorHtml += response.data ? response.data.message || response.data : 'خطای نامشخص';
                        
                        $status.removeClass('loading success').addClass('error').html(errorHtml);
                        WpCrmAdmin.showFieldValidation('crm_url', false);
                        WpCrmAdmin.showFieldValidation('api_key', false);
                    }
                },
                error: function(xhr, status, error) {
                    $status.removeClass('loading success').addClass('error')
                        .html('<strong>✗ خطای اتصال</strong><br>' + WpCrmAdmin.messages.error_network);
                },
                complete: function() {
                    $button.prop('disabled', false).text('تست اتصال');
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
                        if (response.data && response.data.errors) {
                            response.data.errors.forEach(function(error) {
                                if (error.includes('URL')) {
                                    WpCrmAdmin.showFieldValidation('crm_url', false, error);
                                } else if (error.includes('API')) {
                                    WpCrmAdmin.showFieldValidation('api_key', false, error);
                                }
                            });
                        }
                    }
                }
            });
        },
        
        /**
         * Show field validation status
         */
        showFieldValidation: function(fieldId, isValid, message) {
            var $field = $('#' + fieldId);
            var $validation = $field.siblings('.wp-crm-field-validation');
            
            if ($validation.length === 0) {
                $validation = $('<div class="wp-crm-field-validation"></div>');
                $field.after($validation);
            }
            
            $validation.removeClass('valid invalid').addClass(isValid ? 'valid' : 'invalid');
            
            if (message) {
                $validation.text(message);
            } else {
                $validation.text(isValid ? '✓ معتبر' : '✗ نامعتبر');
            }
        },
        
        /**
         * Refresh WordPress fields
         */
        refreshWordPressFields: function(e) {
            e.preventDefault();
            
            var $button = $(this);
            $button.prop('disabled', true).text('در حال به‌روزرسانی...');
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_get_wordpress_fields',
                    nonce: wpCrmAjax.nonce
                },
                success: function(response) {
                    if (response.success) {
                        // Update field mapping dropdowns
                        $('.wp-crm-field-mapping').each(function() {
                            var $select = $(this);
                            var currentValue = $select.val();
                            
                            $select.empty().append('<option value="">-- انتخاب فیلد وردپرس --</option>');
                            
                            $.each(response.data.fields, function(category, fields) {
                                if (fields.length > 0) {
                                    var $optgroup = $('<optgroup label="' + category + '"></optgroup>');
                                    $.each(fields, function(index, field) {
                                        $optgroup.append('<option value="' + field.key + '">' + field.label + '</option>');
                                    });
                                    $select.append($optgroup);
                                }
                            });
                            
                            $select.val(currentValue);
                        });
                        
                        WpCrmAdmin.showNotice('فیلدهای وردپرس با موفقیت به‌روزرسانی شدند.', 'success');
                    } else {
                        WpCrmAdmin.showNotice('خطا در به‌روزرسانی فیلدها: ' + response.data, 'error');
                    }
                },
                error: function() {
                    WpCrmAdmin.showNotice('خطای شبکه در به‌روزرسانی فیلدها.', 'error');
                },
                complete: function() {
                    $button.prop('disabled', false).text('به‌روزرسانی فیلدهای وردپرس');
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
            
            if (!confirm(WpCrmAdmin.messages.confirm_test_sync)) {
                return;
            }
            
            $button.prop('disabled', true).text('در حال تست...');
            
            $.ajax({
                url: wpCrmAjax.ajaxurl,
                type: 'POST',
                data: {
                    action: 'wp_crm_test_manual_sync',
                    nonce: wpCrmAjax.nonce,
                    sync_type: syncType
                },
                success: function(response) {
                    if (response.success) {
                        WpCrmAdmin.showNotice(WpCrmAdmin.messages.test_sync_success, 'success');
                    } else {
                        WpCrmAdmin.showNotice(WpCrmAdmin.messages.test_sync_failed + ': ' + response.data, 'error');
                    }
                },
                error: function() {
                    WpCrmAdmin.showNotice(WpCrmAdmin.messages.error_network, 'error');
                },
                complete: function() {
                    var originalText = $button.data('original-text') || 'تست همگام‌سازی';
                    $button.prop('disabled', false).text(originalText);
                }
            });
        },
        
        /**
         * Form validation
         */
        validateForm: function(e) {
            var isValid = true;
            var errors = [];
            
            // Check required fields
            var crmUrl = $('#crm_url').val();
            var apiKey = $('#api_key').val();
            
            if (!crmUrl) {
                errors.push('آدرس CRM الزامی است.');
                WpCrmAdmin.showFieldValidation('crm_url', false);
                isValid = false;
            }
            
            if (!apiKey) {
                errors.push('کلید API الزامی است.');
                WpCrmAdmin.showFieldValidation('api_key', false);
                isValid = false;
            }
            
            // Validate URL format
            if (crmUrl && !WpCrmAdmin.isValidUrl(crmUrl)) {
                errors.push('فرمت آدرس CRM نامعتبر است.');
                WpCrmAdmin.showFieldValidation('crm_url', false, 'فرمت آدرس نامعتبر');
                isValid = false;
            }
            
            if (!isValid) {
                WpCrmAdmin.showNotice('خطاهای زیر را برطرف کنید:\n' + errors.join('\n'), 'error');
                e.preventDefault();
            }
            
            return isValid;
        },
        
        /**
         * Check if URL is valid
         */
        isValidUrl: function(url) {
            try {
                new URL(url);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        /**
         * Show admin notice
         */
        showNotice: function(message, type) {
            type = type || 'info';
            
            var $notice = $('<div class="notice notice-' + type + ' is-dismissible"><p>' + message + '</p></div>');
            $('.wp-crm-integration-admin-container').prepend($notice);
            
            // Auto-dismiss after 5 seconds
            setTimeout(function() {
                $notice.fadeOut(function() {
                    $(this).remove();
                });
            }, 5000);
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
                    if (response.success && response.data) {
                        WpCrmAdmin.updateSyncStatus(response.data.status);
                    }
                }
            });
        },
        
        /**
         * Update sync status display
         */
        updateSyncStatus: function(status) {
            var $statusElement = $('#wp-crm-sync-status');
            if ($statusElement.length === 0) return;
            
            var statusText = '';
            var statusClass = '';
            
            switch (status) {
                case 'connected':
                    statusText = '✓ متصل';
                    statusClass = 'success';
                    break;
                case 'disconnected':
                    statusText = '✗ قطع شده';
                    statusClass = 'error';
                    break;
                case 'failed':
                    statusText = '⚠ خطا در اتصال';
                    statusClass = 'warning';
                    break;
                default:
                    statusText = '? نامشخص';
                    statusClass = 'info';
            }
            
            $statusElement.removeClass('success error warning info').addClass(statusClass).text(statusText);
        }
    };
    
    // Initialize when document is ready
    $(document).ready(function() {
        WpCrmAdmin.init();
    });
    
})(jQuery);