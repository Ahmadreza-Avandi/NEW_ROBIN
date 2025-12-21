-- Create sale_items table for product-based sales tracking
CREATE TABLE IF NOT EXISTS sale_items (
    id VARCHAR(36) PRIMARY KEY,
    tenant_key VARCHAR(50) NOT NULL,
    sale_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tenant_key (tenant_key),
    INDEX idx_sale_id (sale_id),
    INDEX idx_product_id (product_id),
    INDEX idx_product_category (product_category),
    
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add title generation trigger or update existing sales to have better titles
UPDATE sales 
SET title = CONCAT('فروش ', customer_name, ' - ', DATE_FORMAT(COALESCE(sale_date, created_at), '%Y/%m/%d'))
WHERE title IS NULL OR title = '';

-- Add some sample sale items for existing sales
INSERT INTO sale_items (id, tenant_key, sale_id, product_id, product_name, product_category, quantity, unit_price, total_price)
SELECT 
    UUID() as id,
    s.tenant_key,
    s.id as sale_id,
    p.id as product_id,
    p.name as product_name,
    p.category as product_category,
    1 as quantity,
    s.total_amount as unit_price,
    s.total_amount as total_price
FROM sales s
CROSS JOIN products p
WHERE s.tenant_key = 'rabin' 
AND p.tenant_key = 'rabin'
AND p.status = 'active'
LIMIT 3;