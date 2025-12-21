# WordPress-to-CRM Integration Setup

This document describes the implementation of Task 1: "Set up CRM API integration endpoints" for the WordPress-to-CRM integration system.

## 🎯 What Was Implemented

### 1. WordPress Authentication Middleware (`lib/wordpress-auth.ts`)
- **API Key Validation**: Validates `X-WP-API-Key` header or `Authorization: Bearer` token
- **HMAC Signature Verification**: Optional HMAC-SHA256 signature validation using `X-WP-Signature` header
- **Rate Limiting**: In-memory rate limiting (100 requests per minute by default)
- **Security**: Timing-safe comparison for HMAC validation
- **Configuration**: Environment-based configuration with sensible defaults

### 2. Customer Data Endpoint (`/api/integrations/wordpress/customers`)
- **POST endpoint** for receiving WordPress customer data
- **JSON Schema Validation** for all required and optional fields
- **Duplicate Detection** by email and wordpress_user_id
- **Automatic Customer Creation/Update** with proper CRM field mapping
- **Tenant Support** with configurable tenant keys
- **UUID Generation** for new customers
- **Segment Assignment** (individual vs small_business based on company_name)

### 3. Order Data Endpoint (`/api/integrations/wordpress/orders`)
- **POST endpoint** for WooCommerce order data
- **Customer Linking** - finds existing customers or creates new ones from billing info
- **Order Line Items** support with product details
- **Status Mapping** from WooCommerce statuses to CRM statuses
- **Duplicate Prevention** by wordpress_order_id
- **Multi-currency Support** with configurable currency fields

### 4. Product Data Endpoint (`/api/integrations/wordpress/products`)
- **POST endpoint** for WordPress product data
- **Category Management** - automatically creates product categories
- **SKU and Product ID** duplicate detection
- **Status Mapping** (active/inactive)
- **Metadata Support** for additional product information

### 5. Database Migration (`database/migrations/add-wordpress-integration-fields.sql`)
- Adds `wordpress_user_id` to customers table
- Adds `wordpress_order_id` to sales table  
- Adds `wordpress_product_id` to products table
- Creates `sale_items` table for order line items
- Creates `product_categories` table
- Creates `wordpress_sync_log` table for integration tracking
- Adds proper indexes and unique constraints
- Includes sample configuration settings

## 🚀 Setup Instructions

### 1. Database Migration
Run the database migration to add required fields:

```sql
-- Execute this file in your MySQL database
source database/migrations/add-wordpress-integration-fields.sql;
```

### 2. Environment Configuration
Add these environment variables to your `.env` file:

```env
# WordPress Integration Settings
WORDPRESS_API_KEY=your-secure-api-key-here
WORDPRESS_HMAC_SECRET=your-optional-hmac-secret-here
```

### 3. Test the Integration
Use the provided test script:

```bash
node test-wordpress-integration.js
```

## 📡 API Endpoints

### Authentication
All endpoints require authentication via:
- **Header**: `X-WP-API-Key: your-api-key`
- **Or**: `Authorization: Bearer your-api-key`
- **Optional**: `X-WP-Signature: sha256=hmac-signature` (if HMAC is enabled)

### Customer Endpoint
```
POST /api/integrations/wordpress/customers
Content-Type: application/json

{
  "source": "wordpress",
  "wordpress_user_id": 12345,
  "email": "customer@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "company_name": "Acme Corp",
  "address": "123 Main St",
  "city": "Anytown",
  "state": "CA",
  "country": "USA",
  "postal_code": "12345",
  "registration_date": "2023-12-17T10:00:00Z",
  "tenant_key": "rabin"
}
```

### Order Endpoint
```
POST /api/integrations/wordpress/orders
Content-Type: application/json

{
  "source": "wordpress",
  "wordpress_order_id": 67890,
  "customer_email": "customer@example.com",
  "total_amount": 299.99,
  "currency": "USD",
  "status": "processing",
  "order_date": "2023-12-17T10:00:00Z",
  "billing_info": {
    "first_name": "John",
    "last_name": "Doe",
    "company": "Acme Corp",
    "address_1": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "country": "USA",
    "postcode": "12345",
    "email": "customer@example.com",
    "phone": "+1234567890"
  },
  "line_items": [
    {
      "product_name": "Widget Pro",
      "quantity": 2,
      "unit_price": 99.99,
      "total_price": 199.98,
      "sku": "WIDGET-PRO"
    }
  ],
  "tenant_key": "rabin"
}
```

### Product Endpoint
```
POST /api/integrations/wordpress/products
Content-Type: application/json

{
  "source": "wordpress",
  "wordpress_product_id": 11111,
  "name": "Widget Pro",
  "description": "Professional grade widget",
  "sku": "WIDGET-PRO",
  "price": 99.99,
  "currency": "USD",
  "category": "Widgets",
  "status": "active",
  "tenant_key": "rabin"
}
```

## 🔒 Security Features

- **API Key Authentication**: Secure token-based authentication
- **HMAC Signature Validation**: Optional request integrity verification
- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Comprehensive JSON schema validation
- **SQL Injection Prevention**: Parameterized queries throughout
- **Tenant Isolation**: Multi-tenant support with proper data isolation

## 📊 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Customer data validation failed",
  "details": ["email is required and must be a valid email address"]
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Validation error
- `401`: Authentication failed
- `429`: Rate limit exceeded
- `500`: Internal server error

## 🔄 Data Flow

1. **WordPress Event** → Plugin captures user registration/order/product update
2. **Data Preparation** → Plugin formats data according to API schema
3. **API Request** → Plugin sends POST request with authentication
4. **Validation** → CRM validates authentication and data schema
5. **Processing** → CRM creates/updates records with duplicate detection
6. **Response** → CRM returns success/error with details

## ✅ Requirements Satisfied

This implementation satisfies the following requirements from the specification:

- **4.1**: API key authentication for WordPress requests ✅
- **4.2**: JSON schema validation for customer/order/product data ✅
- **4.3**: UUID generation and tenant assignment ✅
- **4.4**: Duplicate detection and update logic ✅
- **4.5**: Structured error responses with field-level feedback ✅
- **7.1**: RESTful API design with proper HTTP methods ✅
- **7.3**: Consistent JSON response structure ✅
- **7.4**: HMAC signature validation support ✅

## 🧪 Testing

The implementation includes:
- **Input Validation Tests**: Schema validation for all data types
- **Authentication Tests**: API key and HMAC validation
- **Duplicate Detection Tests**: Email and ID-based duplicate handling
- **Error Handling Tests**: Proper error responses and status codes
- **Integration Tests**: End-to-end data flow validation

## 📝 Next Steps

After completing this task, the next steps in the implementation plan are:
1. **WordPress Plugin Development** (Tasks 2.x)
2. **Field Mapping Interface** (Tasks 2.x)
3. **Event Handlers** (Tasks 4.x)
4. **Error Handling & Retry Logic** (Tasks 7.x)
5. **Queue Management** (Tasks 8.x)

## 🐛 Troubleshooting

### Common Issues:

1. **Authentication Errors**
   - Verify `WORDPRESS_API_KEY` in environment
   - Check header format: `X-WP-API-Key: your-key`

2. **Database Errors**
   - Run the migration script first
   - Check database connection settings
   - Verify table permissions

3. **Validation Errors**
   - Check JSON schema compliance
   - Ensure required fields are present
   - Verify data types match schema

4. **Rate Limiting**
   - Default: 100 requests per minute
   - Adjust in `lib/wordpress-auth.ts` if needed
   - Consider Redis for production rate limiting