const mysql = require('mysql2/promise');

async function checkStages() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin123',
    database: 'rabin_crm'
  });
  
  const [stages] = await connection.query('SELECT name, display_name FROM pipeline_stages WHERE tenant_key = "rabin" ORDER BY stage_order');
  console.log('📊 Pipeline Stages:');
  stages.forEach(stage => {
    console.log(`  ${stage.name} -> ${stage.display_name}`);
  });
  
  await connection.end();
}

checkStages().catch(console.error);