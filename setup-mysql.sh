#!/bin/bash

# Awaz Pulse MySQL Setup Script
echo "🚀 Setting up Awaz Pulse with MySQL..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker and Docker Compose are installed"

# Create necessary directories
mkdir -p backend/database-init
mkdir -p backend/migration-scripts

print_status "Created necessary directories"

# Install backend dependencies
print_info "Installing backend dependencies..."
cd backend
npm install mysql2 @nestjs/config
print_status "Backend dependencies installed"

# Start MySQL and phpMyAdmin
print_info "Starting MySQL and phpMyAdmin containers..."
cd ..
docker-compose up mysql phpmyadmin -d

# Wait for MySQL to be ready
print_info "Waiting for MySQL to be ready..."
sleep 30

# Check if MySQL is running
if docker ps | grep -q "awaz-pulse-mysql"; then
    print_status "MySQL container is running"
else
    print_error "MySQL container failed to start"
    exit 1
fi

# Check if phpMyAdmin is running
if docker ps | grep -q "awaz-pulse-phpmyadmin"; then
    print_status "phpMyAdmin container is running"
else
    print_warning "phpMyAdmin container may not be running properly"
fi

# Test MySQL connection
print_info "Testing MySQL connection..."
cd backend
if node -e "
const mysql = require('mysql2/promise');
require('dotenv').config();
(async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'awaz_user',
      password: 'awaz_pass_2024',
      database: 'awaz_pulse'
    });
    console.log('MySQL connection successful');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('MySQL connection failed:', error.message);
    process.exit(1);
  }
})();
"; then
    print_status "MySQL connection test passed"
else
    print_error "MySQL connection test failed"
    print_info "Make sure MySQL container is fully started and try again"
fi

cd ..

print_status "Setup completed successfully!"
echo ""
print_info "Next steps:"
echo "1. 📊 Access phpMyAdmin at: http://localhost:8080"
echo "   - Username: root"
echo "   - Password: awaz_pulse_root_2024"
echo ""
echo "2. 🔄 Migrate data from SQLite to MySQL:"
echo "   cd backend && npm run db:migrate"
echo ""
echo "3. 🗄️  Manage MySQL database:"
echo "   cd backend && node mysql-database-manager.js"
echo ""
echo "4. 🚀 Start the full application:"
echo "   docker-compose up -d"
echo ""
print_info "Useful commands:"
echo "• View MySQL logs: docker logs awaz-pulse-mysql"
echo "• Access MySQL shell: npm run db:shell:mysql"
echo "• Stop containers: docker-compose down"
echo "• Reset database: npm run db:mysql:reset"