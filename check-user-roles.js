const mysql = require('mysql2/promise');

/**
 * Quick Database Check for User Roles
 * Run this to check what roles users have in your database
 */

async function checkUserRoles() {
  let connection;
  
  try {
    // Database connection - adjust these settings to match your setup
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'awaz_pulse_root_2024', // MySQL password from docker-compose
      database: 'awaz_pulse'
    });

    console.log('🔍 Checking user roles in database...\n');

    // Get all users with their roles
    const [users] = await connection.execute(`
      SELECT 
        id,
        email, 
        firstName, 
        lastName, 
        role, 
        isActive,
        stationName,
        createdAt 
      FROM users 
      ORDER BY createdAt DESC
    `);

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log('👥 Users in database:');
    console.log('='.repeat(80));
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role} ${user.role === 'station_owner' ? '✅' : '❌'}`);
      console.log(`   Active: ${user.isActive ? 'Yes ✅' : 'No ❌'}`);
      console.log(`   Station: ${user.stationName || 'Not set'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('-'.repeat(50));
    });

    // Check for station owners specifically
    const [stationOwners] = await connection.execute(`
      SELECT COUNT(*) as count FROM users WHERE role = 'station_owner'
    `);

    console.log(`\n📊 Summary:`);
    console.log(`Total users: ${users.length}`);
    console.log(`Station owners: ${stationOwners[0].count}`);

    if (stationOwners[0].count === 0) {
      console.log('\n🚨 PROBLEM FOUND: No users with station_owner role!');
      console.log('\n💡 SOLUTION: Update a user to be station owner:');
      console.log('UPDATE users SET role = "station_owner" WHERE email = "your-email@example.com";');
    }

    // Check for inactive station owners
    const [inactiveOwners] = await connection.execute(`
      SELECT email FROM users WHERE role = 'station_owner' AND isActive = false
    `);

    if (inactiveOwners.length > 0) {
      console.log('\n⚠️  WARNING: Inactive station owners found:');
      inactiveOwners.forEach(owner => {
        console.log(`   - ${owner.email}`);
      });
      console.log('\n💡 SOLUTION: Activate them:');
      console.log('UPDATE users SET isActive = true WHERE role = "station_owner";');
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check database credentials in this script');
    console.log('3. Ensure awaz_pulse database exists');
    console.log('4. Run: npm install mysql2 (if not installed)');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the check
checkUserRoles();