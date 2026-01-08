#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load environment variables
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

const dbConfig = {
  host: env.DB_HOST || 'localhost',
  port: parseInt(env.DB_PORT) || 3306,
  user: env.DB_USERNAME || 'awaz_user',
  password: env.DB_PASSWORD || 'awaz_pass_2024',
  database: env.DB_NAME || 'awaz_pulse'
};

async function fixStreamUrls() {
  let connection;

  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database\n');

    // Find all streams with /api/ in the URL
    const [streams] = await connection.execute(
      "SELECT id, streamUrl FROM streams WHERE streamUrl LIKE '%/api/audio-tracks/%'"
    );

    if (streams.length === 0) {
      console.log('✅ No streams need fixing!');
      return;
    }

    console.log(`📋 Found ${streams.length} stream(s) to fix:\n`);

    for (const stream of streams) {
      const oldUrl = stream.streamUrl;
      const newUrl = oldUrl.replace('/api/audio-tracks/', '/audio-tracks/');
      
      console.log(`🔧 Fixing stream ${stream.id}:`);
      console.log(`   Old: ${oldUrl}`);
      console.log(`   New: ${newUrl}`);
      
      await connection.execute(
        'UPDATE streams SET streamUrl = ? WHERE id = ?',
        [newUrl, stream.id]
      );
      
      console.log('   ✅ Updated\n');
    }

    console.log('🎉 All stream URLs fixed!');
    console.log('\n💡 Now refresh your browser and try playing again!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixStreamUrls();
