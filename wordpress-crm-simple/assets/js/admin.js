/**
 * اسکریپت مدیریت CRM Integration
 */

jQuery(document).ready(function($) {
    
    // تست اتصال
    $('#test-connection').on('click', function() {
        var $button = $(this);
        var $result = $('#connection-result');
        
        $button.prop('disabled', true).text(wpCrmAjax.strings.testing);
        $result.removeClass('success error').text('');
        
        $.ajax({
            url: wpCrmAjax.ajaxurl,
            type: 'POST',
            data: {
                action: 'wp_crm_test_connection',
                nonce: wpCrmAjax.nonce
            },
            success: function(response) {
                if (response.success) {
                    $result.addClass('success').text('✓ ' + response.message);
                } else {
                    $result.addClass('error').text('✗ ' + response.error);
                }
            },
            error: function() {
                $result.addClass('error').text('✗ خطا در ارتباط');
            },
            complete: function() {
                $button.prop('disabled', false).text('تست اتصال');
            }
        });
    });
    
    // همگام‌سازی تمام کاربران
    $('#sync-all-users').on('click', function() {
        var $button = $(this);
        var $progress = $('#sync-progress');
        var $progressFill = $('.progress-fill');
        
        if (!confirm('آیا مطمئن هستید که می‌خواهید تمام کاربران را همگام‌سازی کنید؟')) {
            return;
        }
        
        $button.prop('disabled', true);
        $progress.show();
        
        // دریافت لیست کاربران
        $.ajax({
            url: wpCrmAjax.ajaxurl,
            type: 'POST',
            data: {
                action: 'wp_crm_get_users',
                nonce: wpCrmAjax.nonce
            },
            success: function(response) {
                if (response.success && response.data.users.length > 0) {
                    syncUsers(response.data.users, 0, $progressFill);
                } else {
                    alert('هیچ کاربری برای همگام‌سازی یافت نشد.');
                    $button.prop('disabled', false);
                    $progress.hide();
                }
            },
            error: function() {
                alert('خطا در دریافت لیست کاربران');
                $button.prop('disabled', false);
                $progress.hide();
            }
        });
    });
    
    // تابع همگام‌سازی کاربران
    function syncUsers(users, index, $progressFill) {
        if (index >= users.length) {
            // تمام شد
            alert('همگام‌سازی کامل شد!');
            $('#sync-all-users').prop('disabled', false);
            $('#sync-progress').hide();
            return;
        }
        
        var user = users[index];
        var progress = ((index + 1) / users.length) * 100;
        
        $progressFill.css('width', progress + '%');
        
        $.ajax({
            url: wpCrmAjax.ajaxurl,
            type: 'POST',
            data: {
                action: 'wp_crm_sync_user',
                user_id: user.id,
                nonce: wpCrmAjax.nonce
            },
            success: function(response) {
                console.log('User ' + user.id + ' synced:', response);
            },
            error: function() {
                console.log('Failed to sync user ' + user.id);
            },
            complete: function() {
                // ادامه با کاربر بعدی
                setTimeout(function() {
                    syncUsers(users, index + 1, $progressFill);
                }, 500); // تاخیر کوتاه برای جلوگیری از فشار زیاد به سرور
            }
        });
    }
    
    // تازه‌سازی خودکار لاگ‌ها
    if ($('.wp-list-table').length && window.location.href.indexOf('wp-crm-logs') > -1) {
        setInterval(function() {
            location.reload();
        }, 30000); // هر 30 ثانیه
    }
    
    // نمایش/مخفی کردن تنظیمات پیشرفته
    $('#show-advanced-settings').on('click', function() {
        $('#advanced-settings').toggle();
        $(this).text($(this).text() === 'نمایش تنظیمات پیشرفته' ? 'مخفی کردن تنظیمات پیشرفته' : 'نمایش تنظیمات پیشرفته');
    });
    
    // اعتبارسنجی فرم
    $('form').on('submit', function() {
        var crmUrl = $('input[name="crm_url"]').val();
        var apiKey = $('input[name="api_key"]').val();
        
        if (crmUrl && !isValidUrl(crmUrl)) {
            alert('لطفاً آدرس معتبر CRM وارد کنید');
            return false;
        }
        
        if (apiKey && apiKey.length < 10) {
            alert('کلید API باید حداقل 10 کاراکتر باشد');
            return false;
        }
    });
    
    // تابع بررسی معتبر بودن URL
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // کپی کردن کلید API
    $('.copy-api-key').on('click', function() {
        var apiKey = $(this).data('key');
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(apiKey).then(function() {
                alert('کلید API کپی شد!');
            });
        } else {
            // Fallback برای مرورگرهای قدیمی
            var textArea = document.createElement('textarea');
            textArea.value = apiKey;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('کلید API کپی شد!');
        }
    });
});