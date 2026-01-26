#!/bin/bash

# Station Owner Dashboard Setup Script
# This script installs dependencies and prepares the React admin for station-owner features

echo "🚀 Setting up Station Owner Dashboard..."
echo ""

# Navigate to admin-react directory
cd admin-react

echo "📦 Installing react-feather icons..."
npm install react-feather

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend: cd backend && npm run start:dev"
echo "2. Start the React admin: cd admin-react && npm start"
echo "3. Login with station_owner credentials"
echo "4. Navigate to http://localhost:3001/station-owner/overview"
echo ""
echo "📚 Documentation:"
echo "- STATION_OWNER_REACT_MIGRATION.md - Full migration details"
echo "- STATION_OWNER_QUICK_START.md - Quick start guide"
echo ""
echo "Happy broadcasting! 🎙️"
