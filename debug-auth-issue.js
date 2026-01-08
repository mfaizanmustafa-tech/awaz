#!/usr/bin/env node

/**
 * Debug Script for Authentication Issues
 * 
 * This script helps diagnose why the station owner dashboard shows "unauthorized"
 * even after successful login.
 */

console.log('🔍 AWAZ PULSE - Authentication Debug Tool\n');

// Check localStorage data
console.log('📱 FRONTEND - Checking Browser Storage:');
console.log('1. Open your browser Developer Tools (F12)');
console.log('2. Go to Application/Storage tab');
console.log('3. Check localStorage for these keys:');
console.log('   - token: Should contain a JWT token');
console.log('   - user: Should contain user object with role');
console.log('\n📋 Expected user object format:');
console.log(JSON.stringify({
  id: "uuid-string",
  email: "owner@example.com",
  firstName: "John",
  lastName: "Doe", 
  role: "station_owner",  // ← This MUST be "station_owner"
  isActive: true
}, null, 2));

console.log('\n🔧 TROUBLESHOOTING STEPS:\n');

console.log('STEP 1: Check Current User Role');
console.log('Run this in browser console on the station-owner page:');
console.log('localStorage.getItem("user")');
console.log('↳ Look for "role" field - it should be "station_owner"\n');

console.log('STEP 2: Check Authentication Token');
console.log('Run this in browser console:');
console.log('localStorage.getItem("token")');
console.log('↳ Should return a JWT token string\n');

console.log('STEP 3: Check Network Requests');
console.log('1. Open Network tab in DevTools');
console.log('2. Refresh the station-owner page');
console.log('3. Look for failed requests (red status codes)');
console.log('4. Check if Authorization header is being sent\n');

console.log('🚨 COMMON ISSUES & FIXES:\n');

console.log('Issue 1: Wrong Role in Database');
console.log('Solution: Update user role in database:');
console.log('UPDATE users SET role = "station_owner" WHERE email = "your-email@example.com";\n');

console.log('Issue 2: Corrupted localStorage');
console.log('Solution: Clear browser storage and login again:');
console.log('localStorage.clear(); // Run in browser console\n');

console.log('Issue 3: Token Expired');
console.log('Solution: Logout and login again to get fresh token\n');

console.log('Issue 4: Backend API Issues');
console.log('Check backend logs for errors when accessing /channels/my-channels\n');

console.log('📞 QUICK FIX COMMANDS:\n');
console.log('If you have database access, run these SQL commands:');
console.log('-- Check current user roles');
console.log('SELECT email, role, isActive FROM users;');
console.log('');
console.log('-- Fix role for specific user');
console.log('UPDATE users SET role = "station_owner" WHERE email = "YOUR_EMAIL_HERE";');
console.log('');
console.log('-- Activate user if needed');
console.log('UPDATE users SET isActive = true WHERE email = "YOUR_EMAIL_HERE";');

console.log('\n✅ After making changes:');
console.log('1. Clear browser localStorage');
console.log('2. Login again');
console.log('3. Navigate to http://localhost:4201/station-owner');