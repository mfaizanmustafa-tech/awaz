
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'awaz_user',
        password: 'awaz_pass_2024',
        database: 'awaz_pulse'
    });

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const [result] = await connection.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, 'faizanmustafaADM@shows.com']
        );

        console.log('Password reset result:', result);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

resetAdminPassword();
