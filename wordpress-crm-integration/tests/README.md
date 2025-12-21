# WordPress CRM Integration Tests

This directory contains comprehensive tests for the WordPress CRM Integration plugin, including end-to-end integration tests that validate the complete data flow from WordPress events to CRM storage.

## Test Structure

```
tests/
├── bootstrap.php                           # Test environment setup
├── includes/
│   └── class-wp-crm-test-utilities.php    # Test helper utilities
├── integration/
│   └── test-end-to-end-integration.php    # End-to-end integration tests
├── unit/                                   # Unit tests (to be added)
├── coverage/                               # Test coverage reports
└── README.md                               # This file
```

## Test Types

### End-to-End Integration Tests

The integration tests validate complete workflows including:

- **Customer Registration Sync Flow**: Tests user registration event capture, field mapping, API transmission, and CRM data validation
- **WooCommerce Order Sync Flow**: Tests order creation events, customer and order data extraction, and API communication
- **Error Handling and Retry Logic**: Tests API failures, retry mechanisms with exponential backoff, and error logging
- **Rate Limiting Handling**: Tests API rate limiting responses and backoff strategies
- **Field Mapping Validation**: Tests field mapping configuration and validation errors
- **Connection Validation**: Tests CRM connection testing and authentication
- **Authentication Failure Handling**: Tests invalid API key scenarios and error responses
- **Batch Processing**: Tests multiple item processing and batch API calls
- **WordPress Compatibility**: Tests across different user roles and WordPress configurations

### Test Features

- **WordPress Environment Simulation**: Creates realistic WordPress users, orders, and products
- **Mock CRM API Responses**: Intercepts HTTP requests to provide controlled test responses
- **Database Validation**: Verifies queue processing, logging, and data persistence
- **Error Scenario Testing**: Simulates various failure conditions and recovery mechanisms
- **Performance Testing**: Tests batch processing and rate limiting scenarios

## Prerequisites

### Required Software

- **PHP 7.4+**: The plugin requires PHP 7.4 or higher
- **PHPUnit**: For running the test suite
- **MySQL/MariaDB**: For test database (optional for basic tests)
- **WordPress Test Suite**: Automatically installed by test runner

### Optional Software

- **WooCommerce**: For order and product sync testing (tests will skip if not available)
- **Composer**: For dependency management
- **Xdebug**: For code coverage reports

## Installation

### Automatic Setup (Recommended)

Use the provided test runner scripts to automatically set up the test environment:

**Linux/macOS:**
```bash
# Make script executable and run
chmod +x run-tests.sh
./run-tests.sh --install-wp --setup-db
```

**Windows:**
```cmd
# Run the batch script
run-tests.bat --install-wp --setup-db
```

### Manual Setup

1. **Install WordPress Test Suite:**
   ```bash
   # Set environment variables
   export WP_TESTS_DIR=/tmp/wordpress-tests-lib
   export WP_CORE_DIR=/tmp/wordpress
   
   # Download and install
   bash bin/install-wp-tests.sh wordpress_test root '' localhost latest
   ```

2. **Install PHPUnit:**
   ```bash
   # Via Composer (recommended)
   composer install
   
   # Or globally
   composer global require phpunit/phpunit
   ```

3. **Configure Database:**
   ```sql
   CREATE DATABASE wordpress_test;
   GRANT ALL PRIVILEGES ON wordpress_test.* TO 'root'@'localhost';
   ```

## Running Tests

### Run All Tests

```bash
# Using test runner (recommended)
./run-tests.sh

# Using PHPUnit directly
phpunit --configuration phpunit.xml
```

### Run Specific Test Suites

```bash
# Integration tests only
./run-tests.sh tests/integration/

# Specific test class
./run-tests.sh tests/integration/test-end-to-end-integration.php

# Specific test method
./run-tests.sh --filter test_complete_customer_registration_sync_flow
```

### Run with Coverage

```bash
# Generate HTML coverage report
phpunit --configuration phpunit.xml --coverage-html tests/coverage/html

# Generate Clover XML coverage
phpunit --configuration phpunit.xml --coverage-clover tests/coverage/clover.xml
```

## Configuration

### Environment Variables

Set these environment variables to customize the test environment:

```bash
# WordPress Test Configuration
export WP_VERSION=latest                    # WordPress version to test against
export WP_TESTS_DIR=/tmp/wordpress-tests-lib # WordPress test suite directory
export WP_CORE_DIR=/tmp/wordpress           # WordPress core directory

# Database Configuration
export DB_NAME=wordpress_test               # Test database name
export DB_USER=root                         # Database user
export DB_PASS=                             # Database password (empty for root)
export DB_HOST=localhost                    # Database host

# Plugin Test Configuration
export WP_CRM_INTEGRATION_TESTING=true     # Enable test mode
export WP_CRM_TEST_MODE=true               # Additional test flags
```

### PHPUnit Configuration

The `phpunit.xml` file contains the test configuration:

- **Test Suites**: Organized by type (integration, unit)
- **Code Coverage**: Includes plugin files, excludes test files
- **Logging**: HTML and XML coverage reports
- **PHP Settings**: WordPress and plugin-specific constants

## Test Data

### Mock CRM Responses

Tests use mock HTTP responses to simulate CRM API interactions:

```php
// Successful customer creation
$mock_response = array(
    'success' => true,
    'status_code' => 200,
    'body' => wp_json_encode(array(
        'success' => true,
        'message' => 'Customer created successfully',
        'data' => array(
            'customer_id' => 'crm_customer_123',
            'action' => 'created'
        )
    ))
);
```

### Test Utilities

The `WP_CRM_Test_Utilities` class provides helper methods:

```php
// Create test user with billing information
$user_id = WP_CRM_Test_Utilities::create_test_user(array(
    'user_email' => 'test@example.com',
    'first_name' => 'John',
    'last_name' => 'Doe'
));

// Create test WooCommerce order
$order_id = WP_CRM_Test_Utilities::create_test_wc_order(array(
    'billing_email' => 'customer@example.com',
    'total' => 99.99
));

// Set up plugin configuration
WP_CRM_Test_Utilities::setup_test_config(array(
    'crm_url' => 'https://test-crm.example.com',
    'api_key' => 'test_key_123'
));
```

## Debugging Tests

### Enable Debug Output

```bash
# Run with verbose output
phpunit --configuration phpunit.xml --verbose

# Run with debug information
phpunit --configuration phpunit.xml --debug
```

### Test-Specific Debugging

```php
// In test methods, use WordPress debugging
error_log('Debug info: ' . print_r($data, true));

// Use PHPUnit assertions for debugging
$this->assertNotEmpty($api_request_data, 'API request data should not be empty');
$this->assertEquals($expected, $actual, 'Values should match');
```

### Common Issues

1. **WordPress Test Suite Not Found**
   ```
   Could not find WordPress test suite at /tmp/wordpress-tests-lib
   ```
   **Solution**: Run `./run-tests.sh --install-wp` to install the test suite

2. **Database Connection Failed**
   ```
   Error establishing a database connection
   ```
   **Solution**: Ensure MySQL is running and database credentials are correct

3. **PHPUnit Not Found**
   ```
   phpunit: command not found
   ```
   **Solution**: Install PHPUnit via Composer: `composer install`

4. **Memory Limit Exceeded**
   ```
   Fatal error: Allowed memory size exhausted
   ```
   **Solution**: Increase PHP memory limit: `php -d memory_limit=512M vendor/bin/phpunit`

## Continuous Integration

### GitHub Actions Example

```yaml
name: WordPress CRM Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:5.7
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: wordpress_test
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '7.4'
        extensions: mysql, zip
        
    - name: Install dependencies
      run: composer install
      
    - name: Run tests
      run: ./run-tests.sh --install-wp --setup-db
      env:
        DB_HOST: 127.0.0.1
        DB_PORT: 3306
        DB_USER: root
        DB_PASS: root
```

## Contributing

When adding new tests:

1. **Follow Naming Conventions**: Test methods should start with `test_` and describe what they test
2. **Use Descriptive Assertions**: Include meaningful assertion messages
3. **Clean Up Test Data**: Use `setUp()` and `tearDown()` methods to manage test data
4. **Mock External Dependencies**: Use the provided mock system for CRM API calls
5. **Test Error Conditions**: Include both success and failure scenarios
6. **Document Complex Tests**: Add comments explaining complex test logic

### Example Test Structure

```php
public function test_customer_sync_with_validation_error() {
    // Arrange: Set up test data and conditions
    $user_id = $this->create_test_user();
    $this->setup_invalid_field_mapping();
    
    // Act: Trigger the action being tested
    do_action('user_register', $user_id);
    $queue_manager = WP_CRM_Integration_Queue_Manager::get_instance();
    $processed = $queue_manager->process_queue_items(1);
    
    // Assert: Verify expected outcomes
    $this->assertGreaterThan(0, $processed, 'Queue should process the item');
    $queue_items = $this->get_queue_items();
    $this->assertEquals('failed', $queue_items[0]->status, 'Item should fail validation');
    $this->assertStringContainsString('validation', $queue_items[0]->error_message);
}
```

## Test Coverage

The test suite aims for comprehensive coverage of:

- **Core Plugin Functionality**: 90%+ coverage of main plugin classes
- **Integration Points**: All WordPress and WooCommerce hooks
- **API Communication**: All CRM API endpoints and error conditions
- **Error Handling**: All error scenarios and recovery mechanisms
- **Configuration**: All settings and field mapping combinations

View coverage reports in `tests/coverage/html/index.html` after running tests with coverage enabled.