
const mysql = require('mysql2/promise');

async function checkPending() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'awaz_user',
        password: 'awaz_pass_2024',
        database: 'awaz_pulse'
    });

    try {
        const [rows] = await connection.execute(
            'SELECT id, name, status, ownerId FROM channels'
        );
        console.log('All Channels:', rows);

        const [pending] = await connection.execute(
            "SELECT id, name, status FROM channels WHERE status = 'pending_approval'"
        );
        console.log('Pending Channels Query Result:', pending);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkPending();
