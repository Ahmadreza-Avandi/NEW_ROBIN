-- Create WordPress API Keys table for CRM integration
CREATE TABLE IF NOT EXISTS wordpress_api_keys (
    id VARCHAR(36) PRIMARY KEY,
    tenant_key VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    api_key VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    INDEX idx_api_key (api_key),
    INDEX idx_tenant_key (tenant_key),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at),
    UNIQUE KEY unique_tenant_name (tenant_key, name)
);

-- Insert a default API key for WordPress integration
INSERT INTO wordpress_api_keys (
    id, 
    tenant_key,
    name, 
    api_key, 
    created_at, 
    is_active
) VALUES (
    UUID(),
    'default',
    'WordPress Plugin Default Key',
    'wp_crm_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
    NOW(),
    TRUE
) ON DUPLICATE KEY UPDATE name = name;