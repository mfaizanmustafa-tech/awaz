# How to Test the Performers Page

## Quick Test Guide

### 1. Start the Application

```bash
# Terminal 1 - Backend (if not already running)
cd backend
npm run start:dev

# Terminal 2 - React Admin
cd admin-react
npm start
```

### 2. Access the Page

1. Open browser: http://localhost:4300
2. Login as station owner:
   - Email: (your station owner email)
   - Password: (your password)
3. Navigate to: **Station Owner > Performers**
   - Or directly: http://localhost:4300/station-owner/performers

### 3. What You Should See

#### ✅ Page Loads Successfully
- Green gradient hero header with "Hosts Management"
- 4 stat cards showing counts
- Filter panel with dropdowns
- List of hosts (either from API or 5 mock hosts)
- Right sidebar with Quick Actions, Top Hosts, and Hosts by Role

#### ✅ Mock Data (If No API Data)
If you see these 5 hosts, mock data is working:
1. **DJ Mike** - DJ Music, Music specialty, 4.8 rating
2. **Sarah Host** - Primary Host, Talk specialty, 4.9 rating
3. **Radio Tom** - Announcer, Sports specialty, 4.5 rating
4. **News Anchor Jane** - Anchor, News specialty, 4.7 rating
5. **Podcast Pete** - Podcaster, Entertainment specialty, 4.3 rating

### 4. Test the "Add New Host" Dialog

#### Method 1: Hero Button
1. Click **"Add New Host"** button in the hero header (top right)
2. Dialog should open

#### Method 2: Quick Actions
1. Scroll to right sidebar
2. Click **"Add Host"** in Quick Actions panel
3. Dialog should open

#### Method 3: Empty State (if no hosts)
1. If no hosts are showing
2. Click **"Add Your First Host"** button
3. Dialog should open

### 5. Fill the Form

1. **First Name**: John
2. **Last Name**: Doe
3. **Stage Name**: DJ Johnny
4. **Role Type**: DJ Music (select from dropdown)
5. **Specialty**: Music (select from dropdown)
6. **Experience (Years)**: 5

### 6. Submit the Form

1. Click **"Create Host"** button
2. Check browser console (F12) for logs:
   ```
   Creating performer with data: {...}
   ```
3. If successful:
   - Alert: "Host created successfully!"
   - Dialog closes
   - Page reloads hosts
   - New host appears in list

4. If error:
   - Alert shows error message
   - Check console for details

### 7. Test Filters

#### Search
1. Type in search box: "DJ"
2. Should filter to show only DJs

#### Role Filter
1. Select "DJ Music" from Role Type dropdown
2. Should show only DJ Music hosts

#### Specialty Filter
1. Select "Music" from Specialty dropdown
2. Should show only Music specialty hosts

#### Clear Filters
1. Select "All Role Types" and "All Specialties"
2. Clear search box
3. Should show all hosts again

### 8. Test Actions

#### Analytics Button
1. Click chart icon on any host card
2. Should navigate to Analytics page

#### Assign to Show Button
1. Click microphone icon on any host card
2. Should navigate to Shows page

#### Delete Button
1. Click trash icon on any host card
2. Confirmation dialog appears
3. Click OK to delete
4. Host is removed from list

### 9. Check Console Logs

Open browser console (F12) and look for:

```
Opening dialog...                          ✅ Dialog opened
Closing dialog...                          ✅ Dialog closed
Loading performers from API...             ✅ API call started
Loaded performers: [...]                   ✅ API returned data
No auth token found, using mock data       ⚠️  Not logged in
Error loading performers: [error]          ❌ API error
Falling back to mock data                  ⚠️  Using fallback
Creating performer with data: {...}        ✅ Creating host
Performer created successfully: {...}      ✅ Host created
```

### 10. Troubleshooting

#### Problem: Black Screen
**Solution**: Check console for errors. Page should never show black screen now.

#### Problem: Dialog Not Opening
**Solution**: 
1. Check console for "Opening dialog..." message
2. If not appearing, there's a JavaScript error
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

#### Problem: No Hosts Showing
**Solution**: 
1. Check console logs
2. If "using mock data" - mock data should show 5 hosts
3. If API error - check backend is running on port 3000
4. If empty array - no hosts in database (use mock data or create one)

#### Problem: Create Host Fails
**Solution**:
1. Check console for error message
2. Verify you're logged in (check localStorage for jwt_access_token)
3. Check backend is running
4. Check network tab for API response

#### Problem: Filters Not Working
**Solution**:
1. Clear all filters first
2. Try one filter at a time
3. Check console for errors

### 11. Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Page Load | Shows hero, stats, filters, hosts list, sidebar |
| No Auth | Shows mock data (5 hosts) |
| With Auth | Loads real hosts from API |
| API Fails | Falls back to mock data |
| Click "Add New Host" | Dialog opens with form |
| Fill & Submit Form | Creates host, closes dialog, reloads list |
| Search | Filters hosts by name |
| Role Filter | Filters hosts by role type |
| Specialty Filter | Filters hosts by specialty |
| Click Analytics | Navigates to analytics page |
| Click Assign | Navigates to shows page |
| Click Delete | Confirms and deletes host |

---

## Success Criteria

✅ Page loads without black screen
✅ Shows either API data or mock data
✅ Dialog opens when clicking "Add New Host"
✅ Form has all fields (First Name, Last Name, Stage Name, Role Type, Specialty, Experience)
✅ Form validates required fields
✅ Create host works (with proper auth)
✅ Filters work (search, role, specialty)
✅ Action buttons work (analytics, shows, delete)
✅ Console logs show helpful debug info
✅ No ESLint errors causing compilation failure

---

## Quick Verification Checklist

- [ ] Page loads successfully
- [ ] Hero header shows with green gradient
- [ ] 4 stat cards display
- [ ] Hosts list shows (API or mock data)
- [ ] "Add New Host" button works
- [ ] Dialog opens with all form fields
- [ ] Can fill and submit form
- [ ] Search filter works
- [ ] Role filter works
- [ ] Specialty filter works
- [ ] Action buttons navigate correctly
- [ ] Delete confirmation works
- [ ] Console shows helpful logs
- [ ] No black screen at any point

---

**If all checkboxes are checked, the page is fully functional! 🎉**
