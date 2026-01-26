const mysql = require('mysql2/promise');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'awaz_user',
      password: 'awaz_pass_2024',
      database: 'awaz_pulse'
    });
    
    const [rows] = await connection.execute('SELECT id, email, role FROM users LIMIT 10');
    console.log('Users in database:');
    rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - Role: ${user.role}`);
    });
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
