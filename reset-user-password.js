#!/usr/bin/env node

/**
 * Password Reset Script for Awaz Pulse
 * 
 * This script allows you to reset a user's password by email.
 * Usage: node reset-user-password.js <email> <new-password>
 * Example: node reset-user-password.js user@example.com newpassword123
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnv() {
  const envPath = path.join(__dirname, 'backend', '.env');
  const env = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
  
  return env;
}

const env = loadEnv();

// Database configuration
const dbConfig = {
  host: env.DB_HOST || 'localhost',
  port: parseInt(env.DB_PORT) || 3306,
  user: env.DB_USERNAME || 'awaz_user',
  password: env.DB_PASSWORD || 'awaz_pass_2024',
  database: env.DB_NAME || 'awaz_pulse'
};

async function resetPassword(email, newPassword) {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Check if user exists
    console.log(`🔍 Looking for user with email: ${email}`);
    const [users] = await connection.execute(
      'SELECT id, email, firstName, lastName, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('❌ User not found with email:', email);
      console.log('\n💡 Tip: Use get-current-user.html to find your email address');
      return;
    }

    const user = users[0];
    console.log('✅ User found:');
    console.log(`   - Name: ${user.firstName} ${user.lastName}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - ID: ${user.id}`);

    // Hash the new password
    console.log('\n🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log('✅ Password hashed');

    // Update the password
    console.log('💾 Updating password in database...');
    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    console.log('✅ Password updated successfully!');

    console.log('\n🎉 SUCCESS! You can now log in with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('\n⚠️  IMPORTANT: Save these credentials in a secure place!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Database connection refused. Make sure MySQL is running:');
      console.log('   - Check if MySQL service is running');
      console.log('   - Verify database credentials in backend/.env');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

async function listAllUsers() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    const [users] = await connection.execute(
      'SELECT id, email, firstName, lastName, role, isActive, createdAt FROM users ORDER BY createdAt DESC'
    );

    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`📋 Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           Awaz Pulse - Password Reset Tool                    ║
╚════════════════════════════════════════════════════════════════╝

Usage:
  node reset-user-password.js <email> <new-password>
  node reset-user-password.js --list

Examples:
  # Reset password for a specific user
  node reset-user-password.js user@example.com newpassword123

  # List all users in the database
  node reset-user-password.js --list

Options:
  --list, -l    List all users in the database
  --help, -h    Show this help message

Notes:
  - Password must be at least 6 characters long
  - Use get-current-user.html to find your email if you forgot it
  - Make sure MySQL is running before using this script
  `);
  process.exit(0);
}

if (args[0] === '--list' || args[0] === '-l') {
  listAllUsers();
} else if (args.length < 2) {
  console.log('❌ Error: Missing arguments');
  console.log('Usage: node reset-user-password.js <email> <new-password>');
  console.log('Run with --help for more information');
  process.exit(1);
} else {
  const email = args[0];
  const newPassword = args[1];

  if (newPassword.length < 6) {
    console.log('❌ Error: Password must be at least 6 characters long');
    process.exit(1);
  }

  resetPassword(email, newPassword);
}
