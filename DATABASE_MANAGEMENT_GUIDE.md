# 🗄️ Awaz Pulse Database Management Guide

## 📋 Overview

Your Awaz Pulse project uses **SQLite** with **TypeORM** for data persistence. The database file is located at `backend/awaz-pulse.db` and contains all your application data including users, channels, shows, and analytics.

## 🛠️ Database Management Options

### Option 1: GUI Tools (Recommended)

#### 🖥️ **DB Browser for SQLite** (Best Option)
```bash
# Install on macOS
brew install --cask db-browser-for-sqlite

# Install on Windows
# Download from: https://sqlitebrowser.org/

# Install on Linux
sudo apt-get install sqlitebrowser  # Ubuntu/Debian
sudo yum install sqlitebrowser      # CentOS/RHEL
```

**How to use:**
1. Open DB Browser for SQLite
2. File → Open Database → Navigate to `backend/awaz-pulse.db`
3. Browse tables, view data, run queries, and export data

#### 🌐 **Web-based Viewer**
Open `backend/database-viewer.html` in your browser for a custom web interface.

### Option 2: Command Line Tools

#### 🔧 **Interactive Database Manager**
```bash
cd backend
npm run db:manager
```

This launches an interactive menu with options to:
- List all tables
- Show table structures
- View table data
- Run custom queries
- Export data to CSV
- Clear table data

#### ⚡ **Quick Commands**
```bash
cd backend

# View all tables
npm run db:tables

# Open SQLite shell
npm run db:shell

# Show database schema
npm run db:schema

# Show table statistics
npm run db:stats

# Create backup
npm run db:backup
```

#### 📊 **Direct SQLite Commands**
```bash
cd backend

# Open database shell
sqlite3 awaz-pulse.db

# Inside SQLite shell:
.tables                    # List all tables
.schema users             # Show users table structure
SELECT * FROM users;      # View all users
.quit                     # Exit
```

## 📋 Current Database Tables

Your database contains these tables:

| Table Name | Description |
|------------|-------------|
| `users` | User accounts (listeners, admins, station owners) |
| `channels` | Radio stations/channels |
| `persons` | RJs, hosts, and performers |
| `shows` | Radio shows and programs |
| `streams` | Live streaming sessions |
| `listening_sessions` | User listening history |
| `user_interactions` | User engagement data |
| `polls` | Interactive polls |
| `poll_votes` | Poll voting records |
| `show_performers` | Show-performer relationships |
| `user_preferences` | User settings and preferences |
| `channel_analytics` | Channel performance metrics |
| `person_analytics` | Performer analytics |
| `show_analytics` | Show performance data |
| `stream_analytics` | Streaming statistics |

## 📊 Sample Data Overview

Current database contains:
- **6 users** (admins, station owners, listeners)
- **Multiple channels** across Pakistani cities
- **RJs and performers** with ratings
- **Shows and streaming data**
- **Analytics and interaction records**

## 🔍 Common Queries

### User Management
```sql
-- View all users
SELECT id, email, firstName, lastName, role, city FROM users;

-- Count users by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Find admin users
SELECT * FROM users WHERE role = 'admin';
```

### Channel Analytics
```sql
-- View all channels
SELECT id, name, callSign, category, city FROM channels;

-- Channels by city
SELECT city, COUNT(*) as count FROM channels GROUP BY city;

-- Channels by category
SELECT category, COUNT(*) as count FROM channels GROUP BY category;
```

### Performance Data
```sql
-- Top performers
SELECT stageName, type, personScore FROM persons ORDER BY personScore DESC;

-- Show statistics
SELECT type, COUNT(*) as count FROM shows GROUP BY type;

-- Recent listening sessions
SELECT * FROM listening_sessions ORDER BY startTime DESC LIMIT 10;
```

## 🛡️ Database Maintenance

### Backup Your Database
```bash
cd backend

# Create timestamped backup
npm run db:backup

# Manual backup
cp awaz-pulse.db awaz-pulse-backup.db
```

### Monitor Database Size
```bash
# Check database file size
ls -lh backend/awaz-pulse.db

# Check table record counts
npm run db:stats
```

### Clean Up Old Data
```sql
-- Delete old listening sessions (older than 30 days)
DELETE FROM listening_sessions 
WHERE startTime < datetime('now', '-30 days');

-- Delete old user interactions (older than 90 days)
DELETE FROM user_interactions 
WHERE createdAt < datetime('now', '-90 days');
```

## 📤 Data Export Options

### Export Entire Tables
```bash
cd backend

# Using the interactive manager
npm run db:manager
# Choose option 6 for CSV export

# Using SQLite directly
sqlite3 awaz-pulse.db
.mode csv
.headers on
.output users_export.csv
SELECT * FROM users;
.quit
```

### Export Specific Data
```sql
-- Export active users only
.output active_users.csv
SELECT id, email, firstName, lastName, role, city 
FROM users WHERE isActive = 1;

-- Export channels by city
.output karachi_channels.csv
SELECT * FROM channels WHERE city = 'Karachi';
```

## 🔧 Development Tools

### Reset Database (Development Only)
```bash
cd backend

# Stop the backend server first
# Then delete and restart to recreate tables
rm awaz-pulse.db
npm run start:dev  # This will recreate the database
```

### Seed Test Data
Your TypeORM entities will automatically create the database schema. To add test data, you can:

1. Use the interactive manager to insert records
2. Create a seed script
3. Import data from CSV files

## 🚨 Important Notes

### Security
- **Never expose your database file** in production
- **Always backup** before making bulk changes
- **Use transactions** for multiple related operations
- **Validate data** before bulk imports

### Performance
- SQLite is great for development and small-to-medium applications
- Consider **indexing** frequently queried columns
- **Monitor database size** and clean up old data regularly
- For high-traffic production, consider **PostgreSQL** or **MySQL**

### Best Practices
- **Regular backups** (automated if possible)
- **Monitor query performance**
- **Use prepared statements** for security
- **Validate all user inputs**
- **Log database operations** in production

## 🆘 Troubleshooting

### Database Locked Error
```bash
# Check for processes using the database
lsof backend/awaz-pulse.db

# Kill processes if needed
kill -9 <process_id>
```

### Corrupted Database
```bash
# Check database integrity
sqlite3 awaz-pulse.db "PRAGMA integrity_check;"

# Repair if needed
sqlite3 awaz-pulse.db ".recover" | sqlite3 awaz-pulse-recovered.db
```

### Missing Tables
```bash
# Restart the NestJS application to recreate tables
cd backend
npm run start:dev
```

## 📚 Additional Resources

- [SQLite Documentation](https://sqlite.org/docs.html)
- [TypeORM Documentation](https://typeorm.io/)
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)

---

**Happy Database Managing! 🎵**