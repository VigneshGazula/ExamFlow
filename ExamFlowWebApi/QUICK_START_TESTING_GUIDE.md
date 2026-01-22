# ?? Quick Start Guide - Test Exam Management Feature

## ? Database Migration - COMPLETE!

The migration has been successfully applied. Your database now has:
- ? ExamSeries table
- ? Exams table
- ? All relationships configured

## ?? Step 2: Login as Admin

### Option A: Use Existing Admin Account

If you already have an admin account:

1. **Open Frontend:** `http://localhost:4200/auth/login`
2. **Select Role:** Admin
3. **Enter Credentials** (your existing admin account)
4. **Click Login**
5. **Navigate to:** `http://localhost:4200/admin/manage-exams`

### Option B: Create New Admin Account

If you don't have an admin account:

1. **Open Signup:** `http://localhost:4200/auth/signup`
2. **Fill Form:**
   - Full Name: `Admin User`
   - Email: `admin@examflow.com`
   - Password: `Admin@123`
   - Confirm Password: `Admin@123`
   - Role: `Admin`
3. **Click Sign Up**
4. **Note the generated User ID** (e.g., `admin001`)
5. **Go to Login:** `http://localhost:4200/auth/login`
6. **Enter:**
   - User ID: (the one generated)
   - Password: `Admin@123`
   - Login As: `Admin`
7. **Click Login**

## ?? Step 3: Test the Complete Workflow

### 3.1 View Manage Exams Page
```
URL: http://localhost:4200/admin/manage-exams
Expected: Empty state or list of exam series
```

### 3.2 Create Exam Series
1. **Click** "Create New Exam Series" (top right button)
2. **Fill Form:**
   - Name: `CSE Semester 3 - Jan 2025`
   - Exam Type: `Semester`
   - Year: `3`
   - Branches: Check `CSE`, `IT`, `ECE`
   - Start Date: `2025-01-20`
   - End Date: `2025-01-30`
3. **Click** "Create Exam Series"
4. **Expected:** Redirect to branch schedule list

### 3.3 Schedule Exams for Branch
1. **You'll see 3 branches:** CSE, IT, ECE (all "Not Prepared")
2. **Click** "Schedule Now" for CSE
3. **You'll see:**
   - Global time settings (Start: 09:00, End: 12:00)
   - Table with dates from Jan 20 to Jan 30
4. **For each date, select a subject:**
   - Jan 20: Mathematics
   - Jan 21: Operating Systems
   - Jan 22: Database Management Systems
   - Jan 23: Mark as Holiday (toggle switch)
   - Jan 24: Data Structures
   - etc.
5. **Click** "Save Schedule"
6. **Expected:** Success message ? Redirect to branch list
7. **CSE now shows:** "Scheduled (X exams)"

### 3.4 Repeat for Other Branches
- Click "Schedule Now" for IT
- Select subjects from IT subject list
- Save schedule
- Repeat for ECE

## ? Verification Checklist

After completing the above:

- [ ] Can login as Admin
- [ ] Can access `/admin/manage-exams`
- [ ] Can see "Create New Exam Series" button
- [ ] Can create exam series successfully
- [ ] Can see branches with "Not Prepared" status
- [ ] Can click "Schedule Now" for a branch
- [ ] Can see calendar dates with subject dropdowns
- [ ] Can select subjects for dates
- [ ] Can toggle holidays
- [ ] Can save schedule successfully
- [ ] Branch status changes to "Scheduled (X exams)"
- [ ] Can schedule exams for multiple branches

## ?? Troubleshooting

### Still Getting 401 Error?

**Check Authentication:**
```javascript
// Open browser console (F12) and run:
console.log('JWT Token:', localStorage.getItem('jwt'));
console.log('Role:', localStorage.getItem('role'));

// Expected output:
// JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (long string)
// Role: Admin
```

**If JWT is null or Role is not "Admin":**
1. Logout (clear localStorage)
2. Login again with Admin credentials

### Backend Not Running?

```bash
# Start backend
cd F:\ExamFlow\ExamFlowWebApi
dotnet run
```

### Frontend Not Running?

```bash
# Start frontend
cd F:\ExamFlow\Frontend
ng serve
```

### Clear Browser Cache

```
1. Open DevTools (F12)
2. Right-click Refresh button
3. Select "Empty Cache and Hard Reload"
```

## ?? Database Verification

To verify data is being saved:

```sql
-- Connect to PostgreSQL
psql -U examflowuser -d examflowdb

-- Check exam series
SELECT * FROM "ExamSeries";

-- Check exams
SELECT * FROM "Exams";

-- View scheduled exams with series info
SELECT 
    es."Name" as SeriesName,
    e."Branch",
    e."ExamDate",
    e."Subject",
    e."StartTime",
    e."EndTime",
    e."IsHoliday"
FROM "Exams" e
JOIN "ExamSeries" es ON e."ExamSeriesId" = es."Id"
ORDER BY e."ExamDate", e."Branch";
```

## ?? Success Indicators

You'll know it's working when:

1. ? No 401 errors in browser console
2. ? Exam series cards appear on manage-exams page
3. ? Can create new exam series
4. ? Can schedule exams for branches
5. ? Branch status updates to "Scheduled"
6. ? Data persists in PostgreSQL database

## ?? Quick Reference

### Important URLs:
- Login: `http://localhost:4200/auth/login`
- Signup: `http://localhost:4200/auth/signup`
- Manage Exams: `http://localhost:4200/admin/manage-exams`
- Backend API: `http://localhost:5275/api/examseries`
- Swagger: `http://localhost:5275/swagger`

### Default Credentials (if using seed data):
- User ID: (generated during signup)
- Password: (what you set during signup)
- Role: Admin

### Backend Endpoints:
- Create Series: `POST /api/examseries`
- Get All: `GET /api/examseries`
- Get Branches: `GET /api/examseries/{id}/branches`
- Get Dates: `GET /api/examseries/{id}/branches/{branch}/dates`
- Get Subjects: `GET /api/examseries/branches/{branch}/subjects`
- Schedule: `POST /api/examseries/{id}/branches/{branch}/schedule`

---

## ?? Ready to Test!

1. ? Migration complete
2. ? Login as Admin
3. ? Test exam management workflow

**Start here:** `http://localhost:4200/auth/login`

After login, everything should work perfectly! ??
