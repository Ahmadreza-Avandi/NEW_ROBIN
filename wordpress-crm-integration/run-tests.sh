#!/bin/bash

# WordPress CRM Integration Test Runner
# 
# This script sets up the WordPress test environment and runs the integration tests.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WP_VERSION=${WP_VERSION:-latest}
WP_TESTS_DIR=${WP_TESTS_DIR:-/tmp/wordpress-tests-lib}
WP_CORE_DIR=${WP_CORE_DIR:-/tmp/wordpress}
DB_NAME=${DB_NAME:-wordpress_test}
DB_USER=${DB_USER:-root}
DB_PASS=${DB_PASS:-}
DB_HOST=${DB_HOST:-localhost}

echo -e "${BLUE}WordPress CRM Integration Test Runner${NC}"
echo "======================================"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
print_status "Checking dependencies..."

if ! command_exists php; then
    print_error "PHP is not installed or not in PATH"
    exit 1
fi

if ! command_exists mysql; then
    print_warning "MySQL client not found. Database setup may fail."
fi

if ! command_exists wget && ! command_exists curl; then
    print_error "Neither wget nor curl is available for downloading WordPress"
    exit 1
fi

# Check PHP version
PHP_VERSION=$(php -r "echo PHP_VERSION;")
print_status "PHP Version: $PHP_VERSION"

# Function to download file
download() {
    if command_exists curl; then
        curl -s "$1" > "$2"
    elif command_exists wget; then
        wget -nv -O "$2" "$1"
    fi
}

# Install WordPress test suite
install_wp_tests() {
    if [ -d "$WP_TESTS_DIR" ]; then
        print_status "WordPress test suite already exists at $WP_TESTS_DIR"
        return
    fi
    
    print_status "Installing WordPress test suite..."
    
    # Create directories
    mkdir -p "$WP_TESTS_DIR"
    mkdir -p "$WP_CORE_DIR"
    
    # Download WordPress test suite
    cd "$WP_TESTS_DIR"
    
    if [ "$WP_VERSION" = "latest" ]; then
        local ARCHIVE_NAME='master'
    else
        local ARCHIVE_NAME="$WP_VERSION"
    fi
    
    download "https://develop.svn.wordpress.org/tags/$ARCHIVE_NAME/tests/phpunit/includes/" "$WP_TESTS_DIR/includes/"
    download "https://develop.svn.wordpress.org/tags/$ARCHIVE_NAME/wp-tests-config-sample.php" "$WP_TESTS_DIR/wp-tests-config.php"
    
    # Download WordPress core
    cd "$WP_CORE_DIR"
    download "https://wordpress.org/wordpress-$WP_VERSION.tar.gz" "wordpress.tar.gz"
    tar --strip-components=1 -zxf wordpress.tar.gz
    rm wordpress.tar.gz
    
    print_status "WordPress test suite installed successfully"
}

# Set up test database
setup_test_database() {
    print_status "Setting up test database..."
    
    # Create database if it doesn't exist
    mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null || {
        print_warning "Could not create database. Please ensure MySQL is running and credentials are correct."
        print_warning "You may need to create the database manually: CREATE DATABASE $DB_NAME;"
    }
    
    # Configure wp-tests-config.php
    if [ -f "$WP_TESTS_DIR/wp-tests-config.php" ]; then
        sed -i "s/youremptytestdbnamehere/$DB_NAME/" "$WP_TESTS_DIR/wp-tests-config.php"
        sed -i "s/yourusernamehere/$DB_USER/" "$WP_TESTS_DIR/wp-tests-config.php"
        sed -i "s/yourpasswordhere/$DB_PASS/" "$WP_TESTS_DIR/wp-tests-config.php"
        sed -i "s/localhost/$DB_HOST/" "$WP_TESTS_DIR/wp-tests-config.php"
    fi
    
    print_status "Test database configured"
}

# Install Composer dependencies if needed
install_dependencies() {
    if [ -f "composer.json" ]; then
        print_status "Installing Composer dependencies..."
        if command_exists composer; then
            composer install --no-interaction --prefer-dist
        else
            print_warning "Composer not found. Skipping dependency installation."
        fi
    fi
}

# Run PHPUnit tests
run_tests() {
    print_status "Running WordPress CRM Integration tests..."
    
    # Set environment variables
    export WP_TESTS_DIR
    export WP_CORE_DIR
    export DB_NAME
    export DB_USER
    export DB_PASS
    export DB_HOST
    
    # Check if PHPUnit is available
    if command_exists phpunit; then
        PHPUNIT_CMD="phpunit"
    elif [ -f "vendor/bin/phpunit" ]; then
        PHPUNIT_CMD="vendor/bin/phpunit"
    else
        print_error "PHPUnit not found. Please install PHPUnit or run 'composer install'"
        exit 1
    fi
    
    # Run tests with configuration
    if [ -f "phpunit.xml" ]; then
        $PHPUNIT_CMD --configuration phpunit.xml "$@"
    else
        $PHPUNIT_CMD tests/ "$@"
    fi
}

# Parse command line arguments
INSTALL_WP=false
SETUP_DB=false
RUN_TESTS=true
TEST_ARGS=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --install-wp)
            INSTALL_WP=true
            shift
            ;;
        --setup-db)
            SETUP_DB=true
            shift
            ;;
        --no-tests)
            RUN_TESTS=false
            shift
            ;;
        --help)
            echo "Usage: $0 [options] [phpunit-args]"
            echo ""
            echo "Options:"
            echo "  --install-wp    Install WordPress test suite"
            echo "  --setup-db      Set up test database"
            echo "  --no-tests      Skip running tests (setup only)"
            echo "  --help          Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  WP_VERSION      WordPress version (default: latest)"
            echo "  WP_TESTS_DIR    WordPress tests directory (default: /tmp/wordpress-tests-lib)"
            echo "  WP_CORE_DIR     WordPress core directory (default: /tmp/wordpress)"
            echo "  DB_NAME         Test database name (default: wordpress_test)"
            echo "  DB_USER         Database user (default: root)"
            echo "  DB_PASS         Database password (default: empty)"
            echo "  DB_HOST         Database host (default: localhost)"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Run all tests"
            echo "  $0 --install-wp --setup-db           # Set up environment and run tests"
            echo "  $0 tests/integration/                # Run only integration tests"
            echo "  $0 --filter test_customer_sync       # Run specific test"
            exit 0
            ;;
        *)
            TEST_ARGS+=("$1")
            shift
            ;;
    esac
done

# Main execution
main() {
    print_status "Starting WordPress CRM Integration test setup..."
    
    # Install WordPress test suite if requested or if it doesn't exist
    if [ "$INSTALL_WP" = true ] || [ ! -d "$WP_TESTS_DIR" ]; then
        install_wp_tests
    fi
    
    # Set up database if requested
    if [ "$SETUP_DB" = true ]; then
        setup_test_database
    fi
    
    # Install dependencies
    install_dependencies
    
    # Run tests if not disabled
    if [ "$RUN_TESTS" = true ]; then
        run_tests "${TEST_ARGS[@]}"
        
        if [ $? -eq 0 ]; then
            print_status "All tests passed successfully!"
        else
            print_error "Some tests failed. Check the output above for details."
            exit 1
        fi
    else
        print_status "Test environment setup complete. Run tests manually with: phpunit"
    fi
}

# Run main function
main