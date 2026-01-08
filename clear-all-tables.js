const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, 'backend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

async function clearAllTables() {
  const connection = await mysql.createConnection({
    host: envVars.DB_HOST || 'localhost',
    port: parseInt(envVars.DB_PORT) || 3306,
    user: envVars.DB_USERNAME || 'root',
    password: envVars.DB_PASSWORD || '',
    database: envVars.DB_NAME || 'awaz_pulse'
  });

  try {
    console.log('🔌 Connected to MySQL database');
    
    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('🔓 Disabled foreign key checks');

    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    console.log(`\n📋 Found ${tableNames.length} tables to clear:`);
    tableNames.forEach(table => console.log(`   - ${table}`));
    
    console.log('\n🗑️  Clearing all tables...\n');

    // Truncate each table
    for (const tableName of tableNames) {
      await connection.query(`TRUNCATE TABLE \`${tableName}\``);
      console.log(`   ✅ Cleared: ${tableName}`);
    }

    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n🔒 Re-enabled foreign key checks');
    
    console.log('\n✅ All tables have been cleared successfully!');
    console.log('📊 Database is now empty and ready for fresh data.');

  } catch (error) {
    console.error('❌ Error clearing tables:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
clearAllTables()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
