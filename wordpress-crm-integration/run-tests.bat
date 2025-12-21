@echo off
REM WordPress CRM Integration Test Runner for Windows
REM 
REM This script sets up the WordPress test environment and runs the integration tests.

setlocal enabledelayedexpansion

REM Configuration
if "%WP_VERSION%"=="" set WP_VERSION=latest
if "%WP_TESTS_DIR%"=="" set WP_TESTS_DIR=%TEMP%\wordpress-tests-lib
if "%WP_CORE_DIR%"=="" set WP_CORE_DIR=%TEMP%\wordpress
if "%DB_NAME%"=="" set DB_NAME=wordpress_test
if "%DB_USER%"=="" set DB_USER=root
if "%DB_PASS%"=="" set DB_PASS=
if "%DB_HOST%"=="" set DB_HOST=localhost

echo WordPress CRM Integration Test Runner
echo ======================================

REM Check if PHP is available
php --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PHP is not installed or not in PATH
    exit /b 1
)

echo [INFO] PHP is available

REM Check if PHPUnit is available
phpunit --version >nul 2>&1
if errorlevel 1 (
    if exist "vendor\bin\phpunit.bat" (
        set PHPUNIT_CMD=vendor\bin\phpunit.bat
        echo [INFO] Using Composer-installed PHPUnit
    ) else (
        echo [ERROR] PHPUnit not found. Please install PHPUnit or run 'composer install'
        exit /b 1
    )
) else (
    set PHPUNIT_CMD=phpunit
    echo [INFO] Using system PHPUnit
)

REM Parse command line arguments
set INSTALL_WP=false
set SETUP_DB=false
set RUN_TESTS=true
set TEST_ARGS=

:parse_args
if "%~1"=="" goto end_parse
if "%~1"=="--install-wp" (
    set INSTALL_WP=true
    shift
    goto parse_args
)
if "%~1"=="--setup-db" (
    set SETUP_DB=true
    shift
    goto parse_args
)
if "%~1"=="--no-tests" (
    set RUN_TESTS=false
    shift
    goto parse_args
)
if "%~1"=="--help" (
    echo Usage: %0 [options] [phpunit-args]
    echo.
    echo Options:
    echo   --install-wp    Install WordPress test suite
    echo   --setup-db      Set up test database
    echo   --no-tests      Skip running tests (setup only)
    echo   --help          Show this help message
    echo.
    echo Environment Variables:
    echo   WP_VERSION      WordPress version (default: latest)
    echo   WP_TESTS_DIR    WordPress tests directory (default: %%TEMP%%\wordpress-tests-lib)
    echo   WP_CORE_DIR     WordPress core directory (default: %%TEMP%%\wordpress)
    echo   DB_NAME         Test database name (default: wordpress_test)
    echo   DB_USER         Database user (default: root)
    echo   DB_PASS         Database password (default: empty)
    echo   DB_HOST         Database host (default: localhost)
    echo.
    echo Examples:
    echo   %0                                    # Run all tests
    echo   %0 --install-wp --setup-db           # Set up environment and run tests
    echo   %0 tests\integration\                # Run only integration tests
    echo   %0 --filter test_customer_sync       # Run specific test
    exit /b 0
)
set TEST_ARGS=%TEST_ARGS% %~1
shift
goto parse_args

:end_parse

REM Install WordPress test suite if requested or if it doesn't exist
if "%INSTALL_WP%"=="true" goto install_wp
if not exist "%WP_TESTS_DIR%" goto install_wp
goto check_setup_db

:install_wp
echo [INFO] Installing WordPress test suite...
if not exist "%WP_TESTS_DIR%" mkdir "%WP_TESTS_DIR%"
if not exist "%WP_CORE_DIR%" mkdir "%WP_CORE_DIR%"

REM For Windows, we'll create a minimal test setup
echo [INFO] Creating minimal WordPress test environment for Windows...

REM Create basic test structure
if not exist "%WP_TESTS_DIR%\includes" mkdir "%WP_TESTS_DIR%\includes"

REM Create a basic wp-tests-config.php
(
echo ^<?php
echo define^( 'DB_NAME', '%DB_NAME%' ^);
echo define^( 'DB_USER', '%DB_USER%' ^);
echo define^( 'DB_PASSWORD', '%DB_PASS%' ^);
echo define^( 'DB_HOST', '%DB_HOST%' ^);
echo define^( 'DB_CHARSET', 'utf8' ^);
echo define^( 'DB_COLLATE', '' ^);
echo define^( 'WP_TESTS_DOMAIN', 'example.org' ^);
echo define^( 'WP_TESTS_EMAIL', 'admin@example.org' ^);
echo define^( 'WP_TESTS_TITLE', 'Test Blog' ^);
echo define^( 'WP_PHP_BINARY', 'php' ^);
echo define^( 'WPLANG', '' ^);
echo define^( 'WP_DEBUG', true ^);
echo define^( 'WP_DEBUG_LOG', false ^);
echo define^( 'WP_DEBUG_DISPLAY', false ^);
echo $table_prefix = 'wptests_';
) > "%WP_TESTS_DIR%\wp-tests-config.php"

echo [INFO] WordPress test environment created

:check_setup_db
if "%SETUP_DB%"=="true" (
    echo [INFO] Database setup requested but skipped on Windows
    echo [INFO] Please ensure your test database exists: %DB_NAME%
)

REM Install Composer dependencies if needed
if exist "composer.json" (
    echo [INFO] Checking Composer dependencies...
    composer --version >nul 2>&1
    if not errorlevel 1 (
        composer install --no-interaction --prefer-dist
    ) else (
        echo [WARNING] Composer not found. Skipping dependency installation.
    )
)

REM Run tests if not disabled
if "%RUN_TESTS%"=="false" (
    echo [INFO] Test environment setup complete. Run tests manually with: phpunit
    goto end
)

echo [INFO] Running WordPress CRM Integration tests...

REM Set environment variables for tests
set WP_TESTS_DIR=%WP_TESTS_DIR%
set WP_CORE_DIR=%WP_CORE_DIR%
set DB_NAME=%DB_NAME%
set DB_USER=%DB_USER%
set DB_PASS=%DB_PASS%
set DB_HOST=%DB_HOST%

REM Run tests with configuration
if exist "phpunit.xml" (
    %PHPUNIT_CMD% --configuration phpunit.xml %TEST_ARGS%
) else (
    %PHPUNIT_CMD% tests\ %TEST_ARGS%
)

if errorlevel 1 (
    echo [ERROR] Some tests failed. Check the output above for details.
    exit /b 1
) else (
    echo [INFO] All tests passed successfully!
)

:end
endlocal