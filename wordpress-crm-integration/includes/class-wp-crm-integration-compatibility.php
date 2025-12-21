<?php
/**
 * Compatibility checker for WordPress CRM Integration
 *
 * @package WordPressCRMIntegration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Compatibility checker class
 */
class WP_CRM_Integration_Compatibility {
    
    /**
     * Instance of this class
     *
     * @var WP_CRM_Integration_Compatibility
     */
    private static $instance = null;
    
    /**
     * Compatibility warnings
     *
     * @var array
     */
    private $warnings = array();
    
    /**
     * Get instance
     *
     * @return WP_CRM_Integration_Compatibility
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->check_compatibility();
    }
    
    /**
     * Check compatibility
     */
    private function check_compatibility() {
        // Check PHP version
        if (version_compare(PHP_VERSION, '7.4', '<')) {
            $this->warnings[] = array(
                'type' => 'error',
                'message' => sprintf(
                    __('PHP version %s is required. Current version: %s', 'wordpress-crm-integration'),
                    '7.4',
                    PHP_VERSION
                )
            );
        }
        
        // Check WordPress version
        global $wp_version;
        if (version_compare($wp_version, '5.0', '<')) {
            $this->warnings[] = array(
                'type' => 'error',
                'message' => sprintf(
                    __('WordPress version %s is required. Current version: %s', 'wordpress-crm-integration'),
                    '5.0',
                    $wp_version
                )
            );
        }
        
        // Check required PHP extensions
        $required_extensions = array('curl', 'json', 'mbstring');
        foreach ($required_extensions as $extension) {
            if (!extension_loaded($extension)) {
                $this->warnings[] = array(
                    'type' => 'error',
                    'message' => sprintf(
                        __('PHP extension %s is required but not installed.', 'wordpress-crm-integration'),
                        $extension
                    )
                );
            }
        }
        
        // Check memory limit
        $memory_limit_str = ini_get('memory_limit');
        $memory_limit = $this->convert_hr_to_bytes($memory_limit_str);
        $required_memory = 64 * 1024 * 1024; // 64MB
        
        if ($memory_limit > 0 && $memory_limit < $required_memory) {
            $this->warnings[] = array(
                'type' => 'warning',
                'message' => sprintf(
                    __('Memory limit is %s. Recommended: 64MB or higher.', 'wordpress-crm-integration'),
                    $this->format_bytes($memory_limit)
                )
            );
        }
    }
    
    /**
     * Convert human readable bytes to bytes
     *
     * @param string $value
     * @return int
     */
    private function convert_hr_to_bytes($value) {
        $value = trim($value);
        $last = strtolower($value[strlen($value) - 1]);
        $value = (int) $value;
        
        switch ($last) {
            case 'g':
                $value *= 1024;
            case 'm':
                $value *= 1024;
            case 'k':
                $value *= 1024;
        }
        
        return $value;
    }
    
    /**
     * Format bytes to human readable format
     *
     * @param int $bytes
     * @return string
     */
    private function format_bytes($bytes) {
        $units = array('B', 'KB', 'MB', 'GB');
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
    
    /**
     * Check if plugin can run safely
     *
     * @return bool
     */
    public function can_run_safely() {
        foreach ($this->warnings as $warning) {
            if ($warning['type'] === 'error') {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Get warnings by type
     *
     * @param string $type
     * @return array
     */
    public function get_warnings($type = '') {
        if (empty($type)) {
            return $this->warnings;
        }
        
        return array_filter($this->warnings, function($warning) use ($type) {
            return $warning['type'] === $type;
        });
    }
}