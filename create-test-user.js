import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function createTestUser() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'crm_system'
        });

        console.log('Creating test user...');

        // Hash password
        const password = 'test123';
        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if test user exists
        const [existing] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            ['test@test.com']
        );

        if (existing.length > 0) {
            // Update existing user
            await connection.execute(
                'UPDATE users SET password = ?, status = "active" WHERE email = ?',
                [hashedPassword, 'test@test.com']
            );
            console.log('Updated existing test user');
        } else {
            // Create new test user
            await connection.execute(
                'INSERT INTO users (id, name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                ['test-user-001', 'Test User', 'test@test.com', hashedPassword, 'ceo', 'active']
            );
            console.log('Created new test user');
        }

        console.log('Test user credentials:');
        console.log('Email: test@test.com');
        console.log('Password: test123');
        console.log('Role: ceo');

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createTestUser();