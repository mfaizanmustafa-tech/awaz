const mysql = require('mysql2/promise');

async function cleanupMultipleChannels() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'awaz_user',
      password: 'awaz_pass_2024',
      database: 'awaz_pulse'
    });

    console.log('Connected to database successfully');

    // Find station owners with multiple channels
    const [ownersWithMultipleChannels] = await connection.execute(`
      SELECT ownerId, COUNT(*) as channelCount
      FROM channels 
      WHERE ownerId IS NOT NULL 
      GROUP BY ownerId 
      HAVING COUNT(*) > 1
      ORDER BY channelCount DESC
    `);

    console.log(`Found ${ownersWithMultipleChannels.length} station owners with multiple channels:`);
    
    for (const owner of ownersWithMultipleChannels) {
      console.log(`- Owner ID ${owner.ownerId}: ${owner.channelCount} channels`);
    }

    if (ownersWithMultipleChannels.length === 0) {
      console.log('✅ No cleanup needed - all station owners have 1 or 0 channels');
      return;
    }

    // For each owner with multiple channels, keep the oldest one and remove the rest
    for (const owner of ownersWithMultipleChannels) {
      console.log(`\n🔄 Processing Owner ID ${owner.ownerId}...`);
      
      // Get all channels for this owner, ordered by creation date (oldest first)
      const [ownerChannels] = await connection.execute(`
        SELECT id, name, callSign, createdAt 
        FROM channels 
        WHERE ownerId = ? 
        ORDER BY createdAt ASC
      `, [owner.ownerId]);

      console.log(`  Found ${ownerChannels.length} channels:`);
      ownerChannels.forEach((channel, index) => {
        console.log(`    ${index + 1}. ${channel.name} (${channel.callSign}) - Created: ${channel.createdAt}`);
      });

      // Keep the first (oldest) channel, remove the rest
      const channelToKeep = ownerChannels[0];
      const channelsToRemove = ownerChannels.slice(1);

      console.log(`  ✅ Keeping: ${channelToKeep.name} (${channelToKeep.callSign})`);
      console.log(`  🗑️  Removing ${channelsToRemove.length} channels:`);

      for (const channel of channelsToRemove) {
        console.log(`    - Removing: ${channel.name} (${channel.callSign})`);
        
        // Remove related data first (streams, shows, etc.)
        // Note: Using correct column names based on actual schema
        await connection.execute('DELETE FROM streams WHERE channelId = ?', [channel.id]);
        
        // Check if shows table has channelId or streamId
        try {
          await connection.execute('DELETE FROM shows WHERE channelId = ?', [channel.id]);
        } catch (error) {
          // If channelId doesn't exist, try streamId approach
          console.log(`    Note: Shows table may use streamId instead of channelId`);
          const [channelStreams] = await connection.execute('SELECT id FROM streams WHERE channelId = ?', [channel.id]);
          for (const stream of channelStreams) {
            await connection.execute('DELETE FROM shows WHERE streamId = ?', [stream.id]);
          }
        }
        
        // Remove the channel
        await connection.execute('DELETE FROM channels WHERE id = ?', [channel.id]);
        
        console.log(`    ✅ Removed channel: ${channel.name}`);
      }
    }

    // Verify cleanup
    console.log('\n📊 Verification after cleanup:');
    const [finalCheck] = await connection.execute(`
      SELECT ownerId, COUNT(*) as channelCount
      FROM channels 
      WHERE ownerId IS NOT NULL 
      GROUP BY ownerId 
      HAVING COUNT(*) > 1
    `);

    if (finalCheck.length === 0) {
      console.log('✅ Cleanup successful! All station owners now have at most 1 channel.');
    } else {
      console.log('❌ Cleanup incomplete. Remaining owners with multiple channels:');
      finalCheck.forEach(owner => {
        console.log(`  - Owner ID ${owner.ownerId}: ${owner.channelCount} channels`);
      });
    }

    // Show final statistics
    const [totalStats] = await connection.execute(`
      SELECT 
        COUNT(DISTINCT ownerId) as totalOwners,
        COUNT(*) as totalChannels
      FROM channels 
      WHERE ownerId IS NOT NULL
    `);

    console.log(`\n📈 Final Statistics:`);
    console.log(`  - Total Station Owners: ${totalStats[0].totalOwners}`);
    console.log(`  - Total Channels: ${totalStats[0].totalChannels}`);
    console.log(`  - Average Channels per Owner: ${(totalStats[0].totalChannels / totalStats[0].totalOwners).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the cleanup
console.log('🚀 Starting channel cleanup process...\n');
cleanupMultipleChannels()
  .then(() => {
    console.log('\n✅ Channel cleanup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Channel cleanup failed:', error);
    process.exit(1);
  });