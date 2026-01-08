# 🚨 Station Owner Dashboard "Unauthorized" Error - Fix Guide

## Problem
You're getting an "unauthorized" error when accessing `http://localhost:4201/station-owner` even though you've logged in successfully.

## Root Cause
The issue is likely that your user account doesn't have the correct role (`station_owner`) in the database, or there's an authentication token problem.

## 🔍 Step 1: Quick Diagnosis

### Option A: Browser Console Check
1. Open the station owner page: `http://localhost:4201/station-owner`
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Run this command:
   ```javascript
   console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));
   console.log('Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
   ```
5. Check the output:
   - **User role should be**: `"station_owner"`
   - **Token should**: exist (not null)

### Option B: Add Debug Component (Temporary)
1. Add this to your `station-owner-dashboard.component.html` at the top:
   ```html
   <app-debug-auth></app-debug-auth>
   ```
2. Import the debug component in your `station-owner-dashboard.component.ts`:
   ```typescript
   import { DebugAuthComponent } from '../../debug-auth.component';
   
   // Add to imports array:
   imports: [CommonModule, ReactiveFormsModule, FormsModule, DebugAuthComponent]
   ```
3. Refresh the page - you'll see a debug panel in the top-right corner

## 🔧 Step 2: Fix the Issue

### Fix 1: Database Role Update (Most Common)

1. **Check current user roles:**
   ```bash
   cd backend
   node ../check-user-roles.js
   ```

2. **Fix the role:**
   ```bash
   node ../fix-station-owner-role.js
   ```
   
   Or manually in MySQL:
   ```sql
   -- Replace 'your-email@example.com' with your actual email
   UPDATE users SET role = 'station_owner', isActive = true 
   WHERE email = 'your-email@example.com';
   ```

### Fix 2: Clear Corrupted Storage
If the role is correct but still getting errors:

1. **Clear browser storage:**
   ```javascript
   // Run in browser console
   localStorage.clear();
   ```

2. **Login again** with your station owner account

### Fix 3: Check Backend API
1. **Check backend logs** when accessing the dashboard
2. **Test API endpoint directly:**
   ```bash
   # Get your token from localStorage first
   curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
        http://localhost:3000/channels/my-channels
   ```

## 🎯 Step 3: Verify Fix

1. **Clear browser cache/storage**
2. **Login again** with your station owner account  
3. **Navigate to**: `http://localhost:4201/station-owner`
4. **Should see**: Station owner dashboard (not unauthorized error)

## 🔍 Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Wrong Role** | User role is not `station_owner` | Update database role |
| **Inactive Account** | `isActive = false` in database | Set `isActive = true` |
| **Expired Token** | Token exists but API calls fail | Logout and login again |
| **Corrupted Storage** | Malformed user data in localStorage | Clear storage and login |
| **Backend Error** | API endpoints returning 401/403 | Check backend logs and database connection |

## 🛠️ Debug Tools Provided

1. **`debug-auth-issue.js`** - General debugging guide
2. **`check-user-roles.js`** - Check database user roles  
3. **`fix-station-owner-role.js`** - Interactive role fixer
4. **`debug-auth.component.ts`** - Frontend debug panel

## 📞 Quick Commands

```bash
# Check what's in your database
node check-user-roles.js

# Fix user role interactively  
node fix-station-owner-role.js

# Or direct MySQL command
mysql -u root -p awaz_pulse -e "UPDATE users SET role='station_owner' WHERE email='YOUR_EMAIL';"
```

## ✅ Success Checklist

- [ ] User role is `station_owner` in database
- [ ] User `isActive` is `true` in database  
- [ ] Browser localStorage has valid token and user data
- [ ] Can access `http://localhost:4201/station-owner` without redirect
- [ ] Dashboard loads with station owner features visible

---

**Need more help?** Check the browser console for specific error messages and include them when asking for assistance.