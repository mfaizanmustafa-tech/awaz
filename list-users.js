#!/usr/bin/env node

/**
 * List Users Script for Awaz Pulse
 * 
 * This script lists all users in the database with their roles and basic info.
 * Usage: node list-users.js
 */

const mysql = require('mysql2/promise');
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

async function listUsers() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Query all users
    const [users] = await connection.execute(`
      SELECT 
        id,
        email,
        firstName,
        lastName,
        role,
        city,
        phoneNumber,
        isActive,
        createdAt
      FROM users 
      ORDER BY role, email
    `);

    if (users.length === 0) {
      console.log('\n❌ No users found in database');
      return;
    }

    console.log('\n📋 USERS IN DATABASE:');
    console.log('=' .repeat(80));

    // Group users by role
    const usersByRole = {};
    users.forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });

    // Display users by role
    Object.keys(usersByRole).forEach(role => {
      console.log(`\n🔑 ${role.toUpperCase()} USERS:`);
      console.log('-'.repeat(50));
      
      usersByRole[role].forEach(user => {
        console.log(`📧 Email: ${user.email}`);
        console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
        console.log(`🏙️  City: ${user.city || 'Not specified'}`);
        console.log(`📱 Phone: ${user.phoneNumber || 'Not specified'}`);
        console.log(`✅ Active: ${user.isActive ? 'Yes' : 'No'}`);
        console.log(`📅 Created: ${user.createdAt}`);
        console.log('');
      });
    });

    console.log(`\n📊 SUMMARY: ${users.length} total users found`);
    Object.keys(usersByRole).forEach(role => {
      console.log(`   - ${usersByRole[role].length} ${role} user(s)`);
    });

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
listUsers();