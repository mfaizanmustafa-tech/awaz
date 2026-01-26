const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'awaz_user',
      password: 'awaz_pass_2024',
      database: 'awaz_pulse'
    });
    
    const [users] = await connection.execute(
      'SELECT id, email, role, password FROM users WHERE role = "station_owner" LIMIT 5'
    );
    
    console.log('Station Owners:');
    for (const user of users) {
      console.log(`\nEmail: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`ID: ${user.id}`);
      
      // Test common passwords
      const testPasswords = ['password123', 'station123', 'admin123', '123456'];
      for (const pwd of testPasswords) {
        const match = await bcrypt.compare(pwd, user.password);
        if (match) {
          console.log(`✅ Password is: ${pwd}`);
          break;
        }
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
