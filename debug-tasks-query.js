import mysql from 'mysql2/promise';

async function debugTasksQuery() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'crm_system'
        });

        console.log('Testing tasks query step by step...');

        // Test 1: Simple tasks query
        console.log('\n1. Testing simple tasks query...');
        try {
            const [simpleResult] = await connection.execute('SELECT * FROM tasks LIMIT 1');
            console.log('✅ Simple tasks query works:', simpleResult.length);
        } catch (error) {
            console.log('❌ Simple tasks query failed:', error.message);
        }

        // Test 2: Test with customers join
        console.log('\n2. Testing with customers join...');
        try {
            const [customerJoin] = await connection.execute(`
                SELECT t.*, c.name as customer_name
                FROM tasks t
                LEFT JOIN customers c ON t.customer_id = c.id
                LIMIT 1
            `);
            console.log('✅ Customer join works:', customerJoin.length);
        } catch (error) {
            console.log('❌ Customer join failed:', error.message);
        }

        // Test 3: Test with users join
        console.log('\n3. Testing with users join...');
        try {
            const [usersJoin] = await connection.execute(`
                SELECT t.*, u1.name as assigned_to_name
                FROM tasks t
                LEFT JOIN users u1 ON t.assigned_to = u1.id
                LIMIT 1
            `);
            console.log('✅ Users join works:', usersJoin.length);
        } catch (error) {
            console.log('❌ Users join failed:', error.message);
        }

        // Test 4: Test full query
        console.log('\n4. Testing full query...');
        try {
            const [fullResult] = await connection.execute(`
                SELECT 
                    t.*,
                    c.name as customer_name,
                    u1.name as assigned_to_name,
                    u2.name as assigned_by_name
                FROM tasks t
                LEFT JOIN customers c ON t.customer_id = c.id
                LEFT JOIN users u1 ON t.assigned_to = u1.id
                LEFT JOIN users u2 ON t.assigned_by = u2.id
                WHERE 1=1
                ORDER BY t.due_date ASC, t.priority DESC, t.created_at DESC
            `);
            console.log('✅ Full query works:', fullResult.length);
            if (fullResult.length > 0) {
                console.log('Sample result:', JSON.stringify(fullResult[0], null, 2));
            }
        } catch (error) {
            console.log('❌ Full query failed:', error.message);
        }

        // Test 5: Check table structures
        console.log('\n5. Checking table structures...');
        
        const [tasksDesc] = await connection.execute('DESCRIBE tasks');
        console.log('Tasks table columns:', tasksDesc.map(col => col.Field));
        
        const [usersDesc] = await connection.execute('DESCRIBE users');
        console.log('Users table columns:', usersDesc.map(col => col.Field));
        
        const [customersDesc] = await connection.execute('DESCRIBE customers');
        console.log('Customers table columns:', customersDesc.map(col => col.Field));

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

debugTasksQuery();