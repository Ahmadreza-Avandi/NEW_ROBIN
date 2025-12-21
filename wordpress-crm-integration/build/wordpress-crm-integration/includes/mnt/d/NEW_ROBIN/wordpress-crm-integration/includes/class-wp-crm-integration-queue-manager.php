<?php
/**
 * Queue manager for WordPress CRM Integration
 *
 * @package WordPressCRMIntegration
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Queue manager class
 */
class WP_CRM_Integration_Queue_Manager {
    
    /**
     * Instance of this class
     *
     * @var WP_CRM_Integration_Queue_Manager
     */
    private static $instance = null;
    
    /**
     * Get instance
     *
     * @return WP_CRM_Integration_Queue_Manager
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
        add_action('wp_crm_integration_process_queue', array($this, 'process_queue'));
    }
    
    /**
     * Process queue
     */
    public function process_queue() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crm_integration_queue';
        
        // Get pending items
        $items = $wpdb->get_results(
            "SELECT * FROM $table_name 
             WHERE status = 'pending' 
             AND scheduled_at <= NOW() 
             ORDER BY priority DESC, created_at ASC 
             LIMIT 10"
        );
        
        foreach ($items as $item) {
            $this->process_item($item);
        }
    }
    
    /**
     * Process single queue item
     *
     * @param object $item
     */
    private function process_item($item) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'crm_integration_queue';
        
        // Mark as processing
        $wpdb->update(
            $table_name,
            array('status' => 'processing'),
            array('id' => $item->id),
            array('%s'),
            array('%d')
        );
        
        $data = json_decode($item->data, true);
        $api_client = WP_CRM_Integration_API_Client::get_instance();
        
        $result = $api_client->send_customer($data);
        
        if ($result['success']) {
            // Mark as completed
            $wpdb->update(
                $table_name,
                array(
                    'status' => 'completed',
                    'updated_at' => current_time('mysql')
                ),
                array('id' => $item->id),
                array('%s', '%s'),
                array('%d')
            );
        } else {
            // Mark as failed and increment attempts
            $wpdb->update(
                $table_name,
                array(
                    'status' => 'failed',
                    'attempts' => $item->attempts + 1,
                    'error_message' => $result['error'],
                    'updated_at' => current_time('mysql')
                ),
                array('id' => $item->id),
                array('%s', '%d', '%s', '%s'),
                array('%d')
            );
        }
    }
}