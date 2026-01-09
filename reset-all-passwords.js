#!/usr/bin/env node

/**
 * Reset All User Passwords Script for Awaz Pulse
 * 
 * This script resets all user passwords to default values for testing.
 * Usage: node reset-all-passwords.js
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

// Default passwords by role
const defaultPasswords = {
  'admin': 'admin123',
  'station_owner': 'station123',
  'end_user': 'user123'
};

async function resetAllPasswords() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Get all users
    const [users] = await connection.execute(`
      SELECT id, email, role, firstName, lastName
      FROM users 
      ORDER BY role, email
    `);

    if (users.length === 0) {
      console.log('\n❌ No users found in database');
      return;
    }

    console.log(`\n🔄 Resetting passwords for ${users.length} users...`);
    console.log('=' .repeat(60));

    for (const user of users) {
      const defaultPassword = defaultPasswords[user.role] || 'password123';
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      // Update the user's password
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, user.id]
      );

      console.log(`✅ ${user.email} (${user.role}) → Password: ${defaultPassword}`);
    }

    console.log('\n🎉 All passwords reset successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('=' .repeat(60));

    // Group and display credentials by role
    const usersByRole = {};
    users.forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });

    Object.keys(usersByRole).forEach(role => {
      console.log(`\n🔑 ${role.toUpperCase()} USERS:`);
      console.log('-'.repeat(40));
      
      usersByRole[role].forEach(user => {
        const password = defaultPasswords[user.role] || 'password123';
        console.log(`📧 Email: ${user.email}`);
        console.log(`🔒 Password: ${password}`);
        console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
        console.log('');
      });
    });

    console.log('💡 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check database credentials in backend/.env');
      console.log('3. Verify database exists: awaz_pulse');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
resetAllPasswords();