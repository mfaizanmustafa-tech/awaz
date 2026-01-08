# MySQL Setup Guide for Awaz Pulse

This guide will help you migrate from SQLite to MySQL and set up a complete Docker-based development environment.

## 🚀 Quick Start

### 1. Automated Setup
```bash
./setup-mysql.sh
```

### 2. Manual Setup

#### Install Dependencies
```bash
cd backend
npm install mysql2 @nestjs/config
```

#### Start MySQL with Docker
```bash
docker-compose up mysql phpmyadmin -d
```

#### Migrate Data from SQLite
```bash
cd backend
npm run db:migrate
```

## 🗄️ Database Access Methods

### 1. phpMyAdmin (Web Interface)
- **URL**: http://localhost:8080
- **Username**: `root`
- **Password**: `awaz_pulse_root_2024`

### 2. MySQL Command Line
```bash
# Access MySQL shell
npm run db:shell:mysql

# Or directly with Docker
docker exec -it awaz-pulse-mysql mysql -u awaz_user -pawaz_pass_2024 awaz_pulse
```

### 3. Database Manager Script
```bash
cd backend
node mysql-database-manager.js
```

### 4. Original Database Manager (Updated)
```bash
cd backend
node database-manager.js
```

## 📊 Viewing Tables and Data

### Method 1: phpMyAdmin (Recommended)
1. Open http://localhost:8080
2. Login with root credentials
3. Select `awaz_pulse` database
4. Browse tables, run queries, export data

### Method 2: MySQL Database Manager
```bash
cd backend
node mysql-database-manager.js
```

Features:
- List all tables
- View table structure
- Browse table data
- Run custom queries
- Export to CSV
- Database statistics
- Backup creation

### Method 3: Command Line Queries
```bash
# List tables
docker exec awaz-pulse-mysql mysql -u awaz_user -pawaz_pass_2024 awaz_pulse -e "SHOW TABLES;"

# View table structure
docker exec awaz-pulse-mysql mysql -u awaz_user -pawaz_pass_2024 awaz_pulse -e "DESCRIBE users;"

# View table data
docker exec awaz-pulse-mysql mysql -u awaz_user -pawaz_pass_2024 awaz_pulse -e "SELECT * FROM users LIMIT 10;"
```

## 🔧 Configuration

### Environment Variables (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=awaz_user
DB_PASSWORD=awaz_pass_2024
DB_NAME=awaz_pulse

# For Docker
DB_HOST_DOCKER=mysql

# Application Configuration
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_in_production
PORT=3000

# MySQL Root Password (for admin tasks)
MYSQL_ROOT_PASSWORD=awaz_pulse_root_2024
```

### Docker Configuration
The application automatically detects the environment:
- **Development**: Uses localhost MySQL or falls back to SQLite
- **Docker**: Uses `mysql` hostname for container communication

## 🔄 Migration Process

### Automatic Migration
```bash
cd backend
npm run db:migrate
```

### Manual Migration Steps
1. **Export SQLite data**:
   ```bash
   sqlite3 awaz-pulse.db .dump > sqlite_backup.sql
   ```

2. **Start MySQL**:
   ```bash
   docker-compose up mysql -d
   ```

3. **Run migration script**:
   ```bash
   node migration-scripts/sqlite-to-mysql.js
   ```

### Migration Features
- Automatic table creation with proper MySQL types
- Data type conversion (SQLite → MySQL)
- Primary key and constraint handling
- JSON field preservation
- Error handling and rollback
- Migration summary report

## 🐳 Docker Commands

### Start Services
```bash
# Start only database services
docker-compose up mysql phpmyadmin -d

# Start all services
docker-compose up -d

# Start with logs
docker-compose up
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Database Management
```bash
# Reset database (⚠️ deletes all data)
npm run db:mysql:reset

# Create backup
npm run db:backup:mysql

# View logs
docker logs awaz-pulse-mysql
docker logs awaz-pulse-phpmyadmin
```

## 📈 Database Operations

### Backup and Restore
```bash
# Create backup
docker exec awaz-pulse-mysql mysqldump -u root -pawaz_pulse_root_2024 awaz_pulse > backup.sql

# Restore backup
docker exec -i awaz-pulse-mysql mysql -u root -pawaz_pulse_root_2024 awaz_pulse < backup.sql
```

### Performance Monitoring
```bash
# Show database statistics
cd backend
node mysql-database-manager.js
# Choose option 5: Show database statistics
```

### Query Examples
```sql
-- Show all tables with row counts
SELECT 
  TABLE_NAME as 'Table',
  TABLE_ROWS as 'Rows',
  ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Size (MB)'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'awaz_pulse' 
ORDER BY TABLE_ROWS DESC;

-- Show recent user registrations
SELECT id, email, firstName, lastName, createdAt 
FROM users 
ORDER BY createdAt DESC 
LIMIT 10;

-- Show channel statistics
SELECT 
  c.name as channel_name,
  COUNT(s.id) as stream_count,
  u.email as owner_email
FROM channels c
LEFT JOIN streams s ON c.id = s.channelId
LEFT JOIN users u ON c.ownerId = u.id
GROUP BY c.id;
```

## 🔍 Troubleshooting

### Common Issues

#### 1. MySQL Connection Failed
```bash
# Check if MySQL container is running
docker ps | grep mysql

# Check MySQL logs
docker logs awaz-pulse-mysql

# Restart MySQL
docker-compose restart mysql
```

#### 2. phpMyAdmin Access Issues
```bash
# Check phpMyAdmin logs
docker logs awaz-pulse-phpmyadmin

# Restart phpMyAdmin
docker-compose restart phpmyadmin
```

#### 3. Migration Errors
```bash
# Check SQLite file exists
ls -la backend/awaz-pulse.db

# Test MySQL connection
cd backend
node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'awaz_user',
  password: 'awaz_pass_2024',
  database: 'awaz_pulse'
}).then(() => console.log('✅ Connected')).catch(console.error);
"
```

#### 4. Port Conflicts
If ports 3306 or 8080 are already in use:
```yaml
# Edit docker-compose.yml
services:
  mysql:
    ports:
      - "3307:3306"  # Change to different port
  phpmyadmin:
    ports:
      - "8081:80"    # Change to different port
```

### Performance Tips

1. **Index Optimization**: Add indexes for frequently queried columns
2. **Connection Pooling**: Configure TypeORM connection pool
3. **Query Optimization**: Use EXPLAIN to analyze slow queries
4. **Monitoring**: Set up MySQL slow query log

## 🔐 Security Considerations

### Production Setup
1. **Change default passwords**
2. **Use environment-specific credentials**
3. **Enable SSL/TLS**
4. **Configure firewall rules**
5. **Regular security updates**

### Development vs Production
- **Development**: Uses Docker with default credentials
- **Production**: Should use managed MySQL service (AWS RDS, Google Cloud SQL, etc.)

## 📚 Additional Resources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [TypeORM MySQL Guide](https://typeorm.io/data-source-options#mysql--mariadb-data-source-options)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [phpMyAdmin Documentation](https://www.phpmyadmin.net/docs/)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Docker logs: `docker-compose logs`
3. Verify environment variables in `.env`
4. Test database connectivity manually
5. Check port availability: `netstat -tulpn | grep :3306`