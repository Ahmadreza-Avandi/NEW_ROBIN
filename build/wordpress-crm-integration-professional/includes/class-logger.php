<?php
/**
 * کلاس Logger برای ثبت لاگ‌ها
 */

if (!defined('ABSPATH')) {
    exit;
}

class WP_CRM_Logger {
    
    /**
     * نمونه افزونه اصلی
     */
    private $plugin;
    
    /**
     * سازنده
     */
    public function __construct($plugin) {
        $this->plugin = $plugin;
    }
    
    /**
     * ثبت لاگ خطا
     */
    public function error($message, $context = array()) {
        $this->log($message, 'error', $context);
    }
    
    /**
     * ثبت لاگ هشدار
     */
    public function warning($message, $context = array()) {
        $this->log($message, 'warning', $context);
    }
    
    /**
     * ثبت لاگ اطلاعات
     */
    public function info($message, $context = array()) {
        $this->log($message, 'info', $context);
    }
    
    /**
     * ثبت لاگ debug
     */
    public function debug($message, $context = array()) {
        if (WP_CRM_DEBUG) {
            $this->log($message, 'debug', $context);
        }
    }
    
    /**
     * ثبت لاگ
     */
    private function log($message, $level = 'info', $context = array()) {
        // ثبت در error_log اگر debug فعال باشد
        if (WP_CRM_DEBUG) {
            $log_message = "[WP CRM - $level] $message";
            if (!empty($context)) {
                $log_message .= ' | Context: ' . json_encode($context);
            }
            error_log($log_message);
        }
        
        // ثبت در دیتابیس
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
     * دریافت لاگ‌ها
     */
    public function get_logs($limit = 100, $level = null) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'crm_sync_log';
        
        $where = '';
        if ($level) {
            $where = $wpdb->prepare(' WHERE level = %s', $level);
        }
        
        $sql = "SELECT * FROM $table_name $where ORDER BY created_at DESC LIMIT %d";
        
        return $wpdb->get_results($wpdb->prepare($sql, $limit));
    }
    
    /**
     * پاک کردن لاگ‌های قدیمی
     */
    public function cleanup_old_logs($days = 30) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'crm_sync_log';
        
        $sql = "DELETE FROM $table_name WHERE created_at < DATE_SUB(NOW(), INTERVAL %d DAY)";
        
        return $wpdb->query($wpdb->prepare($sql, $days));
    }
}