#!/usr/bin/env node

/**
 * Verify Channel-Owner Associations
 * 
 * This script checks that all channels are properly associated with their owners
 */

const mysql = require('mysql2/promise');

async function verifyChannelOwners() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'awaz_pulse'
  });

  console.log('🔍 Verifying Channel-Owner Associations...\n');

  try {
    // 1. Check all channels have valid owners
    console.log('1️⃣  Checking for orphaned channels (channels without valid owners)...');
    const [orphaned] = await connection.execute(`
      SELECT c.* 
      FROM channels c
      LEFT JOIN users u ON c.ownerId = u.id
      WHERE u.id IS NULL
    `);
    
    if (orphaned.length === 0) {
      console.log('   ✅ No orphaned channels found - All channels have valid owners\n');
    } else {
      console.log(`   ❌ Found ${orphaned.length} orphaned channels:`);
      orphaned.forEach(ch => {
        console.log(`      - ${ch.name} (${ch.callSign}) - Invalid ownerId: ${ch.ownerId}`);
      });
      console.log('');
    }

    // 2. Show all channels with their owners
    console.log('2️⃣  All Channels with Owner Information:');
    const [channels] = await connection.execute(`
      SELECT 
        c.id,
        c.name,
        c.callSign,
        c.frequency,
        c.status,
        c.city,
        c.ownerId,
        u.firstName,
        u.lastName,
        u.email,
        u.role,
        c.createdAt
      FROM channels c
      INNER JOIN users u ON c.ownerId = u.id
      ORDER BY c.createdAt DESC
    `);

    if (channels.length === 0) {
      console.log('   No channels found in database\n');
    } else {
      console.log(`   Found ${channels.length} channels:\n`);
      channels.forEach((ch, idx) => {
        console.log(`   ${idx + 1}. ${ch.name} (${ch.callSign})`);
        console.log(`      📻 Frequency: ${ch.frequency}`);
        console.log(`      📍 City: ${ch.city}`);
        console.log(`      📊 Status: ${ch.status}`);
        console.log(`      👤 Owner: ${ch.firstName} ${ch.lastName} (${ch.email})`);
        console.log(`      🔑 Owner ID: ${ch.ownerId}`);
        console.log(`      📅 Created: ${new Date(ch.createdAt).toLocaleString()}`);
        console.log('');
      });
    }

    // 3. Count channels per owner
    console.log('3️⃣  Channels Per Owner:');
    const [ownerStats] = await connection.execute(`
      SELECT 
        u.id,
        u.firstName,
        u.lastName,
        u.email,
        u.role,
        COUNT(c.id) as channelCount,
        GROUP_CONCAT(c.name SEPARATOR ', ') as channelNames
      FROM users u
      LEFT JOIN channels c ON u.id = c.ownerId
      WHERE u.role = 'station_owner'
      GROUP BY u.id
      ORDER BY channelCount DESC
    `);

    if (ownerStats.length === 0) {
      console.log('   No station owners found\n');
    } else {
      ownerStats.forEach((owner, idx) => {
        console.log(`   ${idx + 1}. ${owner.firstName} ${owner.lastName} (${owner.email})`);
        console.log(`      📻 Channels: ${owner.channelCount}`);
        if (owner.channelNames) {
          console.log(`      📝 Names: ${owner.channelNames}`);
        }
        console.log('');
      });
    }

    // 4. Check foreign key constraint
    console.log('4️⃣  Checking Foreign Key Constraint:');
    const [fkInfo] = await connection.execute(`
      SELECT 
        CONSTRAINT_NAME,
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'awaz_pulse'
        AND TABLE_NAME = 'channels'
        AND COLUMN_NAME = 'ownerId'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    if (fkInfo.length > 0) {
      console.log('   ✅ Foreign key constraint exists:');
      fkInfo.forEach(fk => {
        console.log(`      ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log('   ⚠️  No foreign key constraint found (may be using SQLite)');
    }
    console.log('');

    // 5. Summary
    console.log('📊 Summary:');
    console.log(`   Total Channels: ${channels.length}`);
    console.log(`   Total Station Owners: ${ownerStats.length}`);
    console.log(`   Orphaned Channels: ${orphaned.length}`);
    console.log(`   Average Channels per Owner: ${ownerStats.length > 0 ? (channels.length / ownerStats.length).toFixed(2) : 0}`);
    console.log('');

    console.log('✅ Verification Complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

// Run verification
verifyChannelOwners().catch(console.error);
