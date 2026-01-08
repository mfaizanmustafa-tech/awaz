const mysql = require('mysql2/promise');

/**
 * Cleanup Admin Accounts
 * Removes all admin accounts except faizanmustafaADM@shows.com
 */

async function cleanupAdmins() {
    let connection;

    try {
        // Database connection
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'awaz_pulse_root_2024',
            database: 'awaz_pulse'
        });

        console.log('🔍 Connecting to database...');

        // 1. Identify admins to be removed (just for logging)
        const [admins] = await connection.execute(`
      SELECT email FROM users 
      WHERE role = 'admin' 
      AND email != 'faizanmustafaADM@shows.com'
    `);

        if (admins.length === 0) {
            console.log('✅ No extra admin accounts found. Cleaner is happy.');
        } else {
            console.log(`⚠️ Found ${admins.length} admin(s) to remove:`);
            admins.forEach(a => console.log(`   - ${a.email}`));

            // 2. Perform deletion
            const [result] = await connection.execute(`
        DELETE FROM users 
        WHERE role = 'admin' 
        AND email != 'faizanmustafaADM@shows.com'
      `);

            console.log(`\n🗑️  Deleted ${result.affectedRows} admin account(s).`);
        }

        // 3. Verify
        const [remaining] = await connection.execute(`SELECT email, role FROM users WHERE role = 'admin'`);
        console.log('\n👥 Remaining Admins:');
        remaining.forEach(u => console.log(`   - ${u.email}`));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

cleanupAdmins();
