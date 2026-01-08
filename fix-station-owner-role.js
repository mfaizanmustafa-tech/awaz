const mysql = require('mysql2/promise');
const readline = require('readline');

/**
 * Fix Station Owner Role Script
 * This script helps you update a user's role to station_owner
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function fixStationOwnerRole() {
  console.log('🔧 AWAZ PULSE - Fix Station Owner Role\n');

  try {
    // Get database credentials
    const host = await question('Database host (default: localhost): ') || 'localhost';
    const user = await question('Database user (default: root): ') || 'root';
    const password = await question('Database password: ');
    const database = await question('Database name (default: awaz_pulse): ') || 'awaz_pulse';

    console.log('\n🔌 Connecting to database...');

    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database
    });

    console.log('✅ Connected successfully!\n');

    // Show current users
    const [users] = await connection.execute(`
      SELECT id, email, firstName, lastName, role, isActive 
      FROM users 
      ORDER BY createdAt DESC
    `);

    if (users.length === 0) {
      console.log('❌ No users found in database');
      rl.close();
      return;
    }

    console.log('👥 Current users:');
    console.log('='.repeat(60));
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Role: ${user.role} | Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log('-'.repeat(40));
    });

    // Get email to update
    const emailToUpdate = await question('\nEnter email of user to make station owner: ');

    // Find the user
    const [targetUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [emailToUpdate]
    );

    if (targetUsers.length === 0) {
      console.log('❌ User not found with that email');
      rl.close();
      return;
    }

    const targetUser = targetUsers[0];
    console.log(`\n📋 Found user: ${targetUser.firstName} ${targetUser.lastName}`);
    console.log(`Current role: ${targetUser.role}`);
    console.log(`Current status: ${targetUser.isActive ? 'Active' : 'Inactive'}`);

    const confirm = await question('\nUpdate this user to station_owner? (y/N): ');

    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      rl.close();
      return;
    }

    // Update the user
    console.log('\n🔄 Updating user...');

    await connection.execute(`
      UPDATE users 
      SET role = 'station_owner', isActive = true 
      WHERE email = ?
    `, [emailToUpdate]);

    console.log('✅ User updated successfully!');

    // Verify the update
    const [updatedUsers] = await connection.execute(
      'SELECT email, role, isActive FROM users WHERE email = ?',
      [emailToUpdate]
    );

    const updatedUser = updatedUsers[0];
    console.log('\n📊 Updated user details:');
    console.log(`Email: ${updatedUser.email}`);
    console.log(`Role: ${updatedUser.role}`);
    console.log(`Active: ${updatedUser.isActive}`);

    console.log('\n🎉 SUCCESS! The user can now access the station owner dashboard.');
    console.log('\n📝 Next steps:');
    console.log('1. Clear browser localStorage (or logout/login)');
    console.log('2. Login with the updated user account');
    console.log('3. Navigate to http://localhost:4201/station-owner');

    await connection.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check database credentials');
    console.log('3. Ensure database exists');
    console.log('4. Run: npm install mysql2 (if not installed)');
  } finally {
    rl.close();
  }
}

// Run the fix
fixStationOwnerRole();