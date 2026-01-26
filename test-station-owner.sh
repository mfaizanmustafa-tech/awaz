#!/bin/bash

echo "🎙️ Testing Station Owner Dashboard Setup"
echo "=========================================="
echo ""

# Check if backend is running
echo "1. Checking Backend (port 3000)..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
else
    echo "   ❌ Backend is NOT running"
    echo "   Run: cd backend && npm run start:dev"
    exit 1
fi

# Check if React admin is running
echo ""
echo "2. Checking React Admin (port 4300)..."
if curl -s http://localhost:4300 > /dev/null 2>&1; then
    echo "   ✅ React Admin is running"
else
    echo "   ❌ React Admin is NOT running"
    echo "   Run: cd admin-react && npm start"
    exit 1
fi

# Check if react-feather is installed
echo ""
echo "3. Checking react-feather dependency..."
if [ -d "admin-react/node_modules/react-feather" ]; then
    echo "   ✅ react-feather is installed"
else
    echo "   ❌ react-feather is NOT installed"
    echo "   Run: cd admin-react && npm install react-feather"
    exit 1
fi

# Check if station-owner files exist
echo ""
echo "4. Checking Station Owner files..."
FILES=(
    "admin-react/src/app/main/station-owner/StationOwnerConfig.js"
    "admin-react/src/app/main/station-owner/overview/OverviewPage.js"
    "admin-react/src/app/main/station-owner/control-panel/ControlPanelPage.js"
    "admin-react/src/app/main/station-owner/my-channel/MyChannelPage.js"
    "admin-react/src/app/main/station-owner/shows/ShowsPage.js"
    "admin-react/src/app/main/station-owner/performers/PerformersPage.js"
    "admin-react/src/app/main/station-owner/guests/GuestsPage.js"
    "admin-react/src/app/main/station-owner/analytics/AnalyticsPage.js"
)

ALL_EXIST=true
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $(basename $file)"
    else
        echo "   ❌ $(basename $file) - MISSING"
        ALL_EXIST=false
    fi
done

if [ "$ALL_EXIST" = false ]; then
    echo ""
    echo "   ⚠️  Some files are missing!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ All checks passed!"
echo ""
echo "📍 Access Points:"
echo "   • React Admin: http://localhost:4300"
echo "   • Backend API: http://localhost:3000"
echo "   • Station Owner: http://localhost:4300/station-owner/overview"
echo ""
echo "🔐 Login Requirements:"
echo "   • Role: station_owner"
echo "   • Login at: http://localhost:4300/sign-in"
echo ""
echo "📚 Documentation:"
echo "   • STATION_OWNER_QUICK_START.md"
echo "   • STATION_OWNER_REACT_MIGRATION.md"
echo "   • STATION_OWNER_CHECKLIST.md"
echo ""
echo "🎉 Ready to broadcast!"
