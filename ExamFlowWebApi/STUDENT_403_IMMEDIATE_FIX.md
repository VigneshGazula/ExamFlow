# ?? IMMEDIATE FIX - Student 403 Forbidden Error

## Issue
You're logged in as a student but getting **"Access denied. Redirecting to dashboard..."** when trying to access "My Exams".

## ?? Quick Diagnosis & Fix

### Step 1: Run the Debugger Script

**Open browser console (F12) and paste this entire script:**

```javascript
// Copy and paste this ENTIRE script into console
const token = localStorage.getItem('jwt');
if (!token) {
    console.error('? NO TOKEN - You are not logged in!');
} else {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    
    console.log('Your Role:', role);
    
    if (role === 'Student') {
        console.log('? Role is correct!');
        console.log('Testing backend...');
        
        fetch('http://localhost:5275/api/examseries/debug/claims', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(r => r.json())
        .then(data => {
            console.log('Backend says:');
            console.log('- Is Student Role:', data.isInStudentRole);
            console.log('- Role:', data.role);
            
            if (!data.isInStudentRole) {
                console.error('? Backend authorization failing!');
                console.log('FIX: Restart backend server with updated code');
            }
        });
    } else {
        console.error('? Role is wrong:', role);
        console.log('Expected: "Student"');
        console.log('FIX NEEDED: See below');
    }
}
```

### Step 2: Based on the Output

#### If role is NOT "Student" (e.g., "student", "STUDENT", null):

**Fix Option A - Database Update:**
Run this SQL in your PostgreSQL database:

```sql
-- Check current role
SELECT "UserId", "Email", "Role" 
FROM "Users" 
WHERE "Email" = 'your@email.com';  -- Replace with your email

-- Fix the role
UPDATE "Users"
SET "Role" = 'Student'
WHERE "Email" = 'your@email.com';  -- Replace with your email
```

**Then:**
1. Logout: `localStorage.clear()`
2. Login again
3. Try "My Exams" again

**Fix Option B - Re-register:**
```javascript
// Create new student account with correct role
fetch('http://localhost:5275/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: "Test Student",
    email: "newstudent@test.com",
    password: "Student@123",
    confirmPassword: "Student@123",
    role: "Student"  // Make sure this is "Student" with capital S
  })
})
.then(r => r.json())
.then(console.log);
```

Then login with new account.

#### If role IS "Student" but still getting 403:

**This means backend authorization is failing. Fix:**

1. **Restart Backend Server**
   ```bash
   # Stop current server (Ctrl+C)
   dotnet run
   ```

2. **Check backend logs** when you try to access /student/exams
   - Should see: `[DEBUG] GetStudentExamSeries - ...`
   - Should see: `IsInRole('Student'): True`

3. **If IsInRole is False**, there's an authorization configuration issue.

### Step 3: Nuclear Option (If nothing works)

**Complete Fresh Start:**

1. **Clear everything**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Close browser completely**

3. **Restart backend**
   ```bash
   cd ExamFlowWebApi
   dotnet run
   ```

4. **Restart frontend**
   ```bash
   cd Frontend
   npm start
   ```

5. **Create fresh student account using Postman/Browser:**
   ```
   POST http://localhost:5275/api/auth/signup
   
   {
     "fullName": "Fresh Student",
     "email": "fresh@test.com",
     "password": "Student@123",
     "confirmPassword": "Student@123",
     "role": "Student"
   }
   ```

6. **Login with new account**

7. **Try My Exams**

## ?? Detailed Debugging

### Check 1: Token Role Claim

```javascript
const token = localStorage.getItem('jwt');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('All Claims:', payload);
console.log('Role Claim:', payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
```

**Expected:** Should output `"Student"` (exact match, case-sensitive)

### Check 2: Backend Debug Endpoint

```javascript
fetch('http://localhost:5275/api/examseries/debug/claims', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
  }
})
.then(r => r.json())
.then(data => {
  console.log('Debug Info:', data);
  console.log('Is Student:', data.isInStudentRole);
});
```

**Expected:** `isInStudentRole: true`

### Check 3: Database Role

Connect to PostgreSQL and run:
```sql
SELECT "Id", "UserId", "FullName", "Email", "Role", "IsActive"
FROM "Users"
ORDER BY "Id" DESC
LIMIT 10;
```

**Check that:**
- Your user exists
- Role is exactly `"Student"` (not `"student"` or anything else)
- IsActive is `true`

## ? What I've Added

1. **Debug logging** in StudentProfileController
2. **Debug logging** in ExamsController  
3. **Debug endpoint** at `/api/examseries/debug/claims`
4. **SQL script** to check/fix roles
5. **JavaScript debugger** script for browser console

## ?? Most Likely Solution

Based on similar issues, the problem is usually:

**Role in database is lowercase "student" instead of "Student"**

**Quick Fix:**
```sql
UPDATE "Users" 
SET "Role" = 'Student' 
WHERE LOWER("Role") = 'student';
```

Then:
1. `localStorage.clear()`
2. Login again
3. Should work! ?

---

## ?? Still Not Working?

If after all these steps it still doesn't work:

1. **Copy the FULL output** of the debugger script
2. **Copy the backend console logs** when you try to access My Exams
3. **Share both** and I'll help you further

The logs will show exactly where the authorization is failing!
