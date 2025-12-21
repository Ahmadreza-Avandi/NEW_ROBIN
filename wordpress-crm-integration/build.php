<?php
/**
 * WordPress CRM Integration Plugin Build Script
 * 
 * This script creates a deployment-ready ZIP package of the plugin
 * excluding development files and tests.
 */

class WP_CRM_Integration_Builder {
    
    private $plugin_dir;
    private $build_dir;
    private $version;
    private $plugin_slug = 'wordpress-crm-integration';
    
    public function __construct() {
        $this->plugin_dir = __DIR__;
        $this->build_dir = $this->plugin_dir . '/build';
        $this->version = $this->get_plugin_version();
    }
    
    /**
     * Main build process
     */
    public function build() {
        echo "Building WordPress CRM Integration Plugin v{$this->version}\n";
        echo "==========================================\n\n";
        
        // Clean and create build directory
        $this->clean_build_dir();
        $this->create_build_dir();
        
        // Copy plugin files
        $this->copy_plugin_files();
        
        // Create ZIP package
        $zip_file = $this->create_zip_package();
        
        echo "Build completed successfully!\n";
        echo "Package created: {$zip_file}\n";
        echo "Package size: " . $this->format_bytes(filesize($zip_file)) . "\n";
        
        return $zip_file;
    }
    
    /**
     * Get plugin version from main plugin file
     */
    private function get_plugin_version() {
        $plugin_file = $this->plugin_dir . '/wordpress-crm-integration.php';
        $plugin_data = get_file_data($plugin_file, array('Version' => 'Version'));
        
        if (empty($plugin_data['Version'])) {
            // Fallback: read version from file content
            $content = file_get_contents($plugin_file);
            if (preg_match('/Version:\s*([0-9.]+)/', $content, $matches)) {
                return $matches[1];
            }
            return '1.0.0'; // Default version
        }
        
        return $plugin_data['Version'];
    }
    
    /**
     * Clean build directory
     */
    private function clean_build_dir() {
        if (is_dir($this->build_dir)) {
            $this->delete_directory($this->build_dir);
        }
    }
    
    /**
     * Create build directory
     */
    private function create_build_dir() {
        if (!mkdir($this->build_dir, 0755, true)) {
            throw new Exception("Failed to create build directory: {$this->build_dir}");
        }
        
        $plugin_build_dir = $this->build_dir . '/' . $this->plugin_slug;
        if (!mkdir($plugin_build_dir, 0755, true)) {
            throw new Exception("Failed to create plugin build directory: {$plugin_build_dir}");
        }
    }
    
    /**
     * Copy plugin files to build directory
     */
    private function copy_plugin_files() {
        $plugin_build_dir = $this->build_dir . '/' . $this->plugin_slug;
        
        // Files and directories to include
        $include_patterns = array(
            'wordpress-crm-integration.php',
            'readme.txt',
            'admin/',
            'assets/',
            'includes/',
            'languages/'
        );
        
        // Files and directories to exclude
        $exclude_patterns = array(
            'tests/',
            'build/',
            'build.php',
            'phpunit.xml',
            'run-tests.sh',
            'run-tests.bat',
            'test-*.php',
            '*.md',
            '.git*',
            'node_modules/',
            'composer.json',
            'composer.lock',
            'package.json',
            'package-lock.json'
        );
        
        echo "Copying plugin files...\n";
        
        foreach ($include_patterns as $pattern) {
            $source = $this->plugin_dir . '/' . $pattern;
            $destination = $plugin_build_dir . '/' . $pattern;
            
            if (is_file($source)) {
                $this->copy_file($source, $destination);
                echo "  Copied: {$pattern}\n";
            } elseif (is_dir($source)) {
                $this->copy_directory($source, $destination, $exclude_patterns);
                echo "  Copied: {$pattern}\n";
            }
        }
        
        // Create version file
        $this->create_version_file($plugin_build_dir);
        
        echo "Plugin files copied successfully.\n\n";
    }
    
    /**
     * Copy a single file
     */
    private function copy_file($source, $destination) {
        $dest_dir = dirname($destination);
        if (!is_dir($dest_dir)) {
            mkdir($dest_dir, 0755, true);
        }
        
        if (!copy($source, $destination)) {
            throw new Exception("Failed to copy file: {$source} to {$destination}");
        }
    }
    
    /**
     * Copy directory recursively
     */
    private function copy_directory($source, $destination, $exclude_patterns = array()) {
        if (!is_dir($destination)) {
            mkdir($destination, 0755, true);
        }
        
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($source, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        
        foreach ($iterator as $item) {
            $relative_path = str_replace($source . DIRECTORY_SEPARATOR, '', $item->getPathname());
            
            // Check if file should be excluded
            if ($this->should_exclude($relative_path, $exclude_patterns)) {
                continue;
            }
            
            $dest_path = $destination . DIRECTORY_SEPARATOR . $relative_path;
            
            if ($item->isDir()) {
                if (!is_dir($dest_path)) {
                    mkdir($dest_path, 0755, true);
                }
            } else {
                $this->copy_file($item->getPathname(), $dest_path);
            }
        }
    }
    
    /**
     * Check if file should be excluded
     */
    private function should_exclude($file_path, $exclude_patterns) {
        foreach ($exclude_patterns as $pattern) {
            if (fnmatch($pattern, $file_path) || fnmatch($pattern, basename($file_path))) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Create version file
     */
    private function create_version_file($plugin_build_dir) {
        $version_info = array(
            'version' => $this->version,
            'build_date' => date('Y-m-d H:i:s'),
            'build_timestamp' => time()
        );
        
        $version_file = $plugin_build_dir . '/version.json';
        file_put_contents($version_file, json_encode($version_info, JSON_PRETTY_PRINT));
    }
    
    /**
     * Create ZIP package
     */
    private function create_zip_package() {
        $zip_filename = $this->plugin_slug . '-v' . $this->version . '.zip';
        $zip_path = $this->build_dir . '/' . $zip_filename;
        
        echo "Creating ZIP package...\n";
        
        $zip = new ZipArchive();
        if ($zip->open($zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
            throw new Exception("Failed to create ZIP file: {$zip_path}");
        }
        
        $plugin_build_dir = $this->build_dir . '/' . $this->plugin_slug;
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($plugin_build_dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );
        
        foreach ($iterator as $item) {
            $relative_path = $this->plugin_slug . '/' . str_replace($plugin_build_dir . DIRECTORY_SEPARATOR, '', $item->getPathname());
            
            if ($item->isDir()) {
                $zip->addEmptyDir($relative_path);
            } else {
                $zip->addFile($item->getPathname(), $relative_path);
            }
        }
        
        $zip->close();
        
        echo "ZIP package created successfully.\n\n";
        
        return $zip_path;
    }
    
    /**
     * Delete directory recursively
     */
    private function delete_directory($dir) {
        if (!is_dir($dir)) {
            return;
        }
        
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        
        foreach ($iterator as $item) {
            if ($item->isDir()) {
                rmdir($item->getPathname());
            } else {
                unlink($item->getPathname());
            }
        }
        
        rmdir($dir);
    }
    
    /**
     * Format bytes to human readable format
     */
    private function format_bytes($bytes, $precision = 2) {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}

// Compatibility function for get_file_data if not available
if (!function_exists('get_file_data')) {
    function get_file_data($file, $default_headers, $context = '') {
        $fp = fopen($file, 'r');
        if (!$fp) {
            return array();
        }
        
        $file_data = array();
        $headers = array_keys($default_headers);
        
        // Read first 8 KB of file
        $file_content = fread($fp, 8192);
        fclose($fp);
        
        foreach ($default_headers as $field => $regex) {
            if (preg_match('/^[ \t\/*#@]*' . preg_quote($regex, '/') . ':(.*)$/mi', $file_content, $match) && $match[1]) {
                $file_data[$field] = trim(preg_replace('/\s*(?:\*\/|\?>).*/', '', $match[1]));
            } else {
                $file_data[$field] = '';
            }
        }
        
        return $file_data;
    }
}

// Run the build process if script is executed directly
if (basename(__FILE__) == basename($_SERVER['SCRIPT_NAME'])) {
    try {
        $builder = new WP_CRM_Integration_Builder();
        $builder->build();
    } catch (Exception $e) {
        echo "Build failed: " . $e->getMessage() . "\n";
        exit(1);
    }
}