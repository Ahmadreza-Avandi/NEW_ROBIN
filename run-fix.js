import mysql from 'mysql2/promise';
import fs from 'fs';

async function runFix() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'crm_system'
        });

        console.log('Connected to database');

        // Read and execute the fix
        const fixSQL = fs.readFileSync('fix-tasks-data.sql', 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = fixSQL.split(';').filter(stmt => stmt.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim().startsWith('--')) continue; // Skip comments
            
            console.log('Executing:', statement.trim().substring(0, 50) + '...');
            const [result] = await connection.execute(statement.trim());
            
            if (statement.trim().toUpperCase().startsWith('UPDATE')) {
                console.log('Updated rows:', result.affectedRows);
            } else if (statement.trim().toUpperCase().startsWith('SELECT')) {
                console.log('Results:', result);
            }
        }

        await connection.end();
        console.log('Fix completed successfully!');
    } catch (error) {
        console.error('Error running fix:', error.message);
    }
}

runFix();