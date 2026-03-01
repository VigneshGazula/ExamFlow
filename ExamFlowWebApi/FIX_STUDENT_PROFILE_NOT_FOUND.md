# ?? Fix: "Student profile not found" Error

## What You're Seeing

**Error Message**: "Student profile not found. Please complete your profile first."

**This is EXPECTED behavior!** ?

---

## Why This Happens

When a student logs in for the **first time**, they don't have a profile in the database yet. The profile contains:
- Roll Number
- Department
- Year
- Section

**Without this profile**, the system cannot:
- Match the student to exam series
- Determine eligibility for hall tickets
- Generate hall ticket numbers

---

## ? Complete Solution (3 Steps)

### Step 1: Clear Expired Token

**Open Browser Console (Press F12) and run:**
```javascript
localStorage.clear();
location.reload();
```

This clears the expired JWT token.

---

### Step 2: Login Again

1. You'll be redirected to login page
2. Enter your credentials:
   - **User ID**: Your student ID (e.g., `STU001`)
   - **Password**: Your password
   - **Login As**: Student
3. Click **Login**

---

### Step 3: Complete Your Profile

After login, you should be **automatically redirected** to:
```
http://localhost:4200/student/complete-profile
```

**If not redirected**, navigate to it manually.

**Fill in the form**:
```
???????????????????????????????????????
?  Complete Your Profile              ?
???????????????????????????????????????
?  Roll Number:    [21CS001      ]    ?
?  Department:     [Computer Science?]?
?  Year:           [2              ?] ?
?  Section:        [A              ?] ?
?                                      ?
?         [Submit Profile]             ?
???????????????????????????????????????
```

**Example Values**:
- Roll Number: `21CS001`
- Department: `Computer Science`
- Year: `2`
- Section: `A`

**Click "Submit Profile"**

---

### Step 4: Access Hall Tickets

After profile creation:
1. Navigate to **Hall Ticket** in the sidebar
2. You should now see:
   - List of exam series for your year
   - Eligibility status for each exam
   - Download buttons (if released)

---

## ?? Troubleshooting

### Issue 1: Still Getting "Profile Not Found" After Creating Profile

**Check if profile was actually saved**:
1. Open Console (F12)
2. Navigate to **Network** tab
3. Navigate to Hall Tickets
4. Look for the API call to `/api/StudentProfile`
5. Check the response

**If 200 OK**: Profile exists, but Hall Tickets API has an issue  
**If 404**: Profile creation failed

**Solution**: Try creating profile again, or check backend console for errors.

---

### Issue 2: Redirected to Login Instead of Profile Completion

This means the **Profile Completion Guard** is not working.

**Manual Fix**:
1. After login, manually go to:
   ```
   http://localhost:4200/student/complete-profile
   ```
2. Complete the profile
3. Then navigate to Hall Tickets

---

### Issue 3: Can't Create Profile (Submit Button Doesn't Work)

**Check Console for Errors**:
```javascript
// Open Console and look for errors after clicking Submit
```

**Common Issues**:
- Backend not running ? Start backend: `dotnet run`
- Database connection issue ? Check connection string
- Validation error ? All fields are required

---

## ?? Complete Workflow (First Time User)

```
1. Student logs in
   ?
2. System checks if profile exists
   ?
3. Profile NOT found
   ?
4. Redirect to /student/complete-profile
   ?
5. Student fills in profile
   ?
6. Submit ? Profile saved to database
   ?
7. Redirect to /student/dashboard
   ?
8. Student navigates to Hall Tickets
   ?
9. System fetches exam series for student's year
   ?
10. Display hall tickets with eligibility
```

---

## ?? Expected Results After Fix

### Before Profile Creation
```
? Hall Tickets: "Student profile not found"
```

### After Profile Creation
```
? Hall Tickets: Shows exam series
   - CSE Semester 2 Exam | Released for Department - Pending for You
   - CSE Midterm 1 Exam  | Not Released for Department
```

---

## ?? Backend Check

Make sure backend is running and accessible:

**Test Backend Health**:
```bash
# Open browser or run in terminal:
curl http://localhost:5275/swagger

# Should show Swagger UI
```

**Check if StudentProfile API works**:
```bash
# In browser console (after login):
fetch('http://localhost:5275/api/StudentProfile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
  }
})
.then(r => r.json())
.then(d => console.log('Profile:', d))
.catch(e => console.error('Error:', e));
```

**Expected Results**:
- **If profile exists**: Returns profile data
- **If no profile**: Returns 404 with message "Student profile not found"

---

## ? Quick Commands

### Clear Everything and Start Fresh
```javascript
// Browser Console:
localStorage.clear();
sessionStorage.clear();
location.href = '/login';
```

### Check Current State
```javascript
// Check if logged in:
console.log('JWT:', localStorage.getItem('jwt') ? 'EXISTS' : 'MISSING');
console.log('Role:', localStorage.getItem('userRole'));

// Check token expiry:
const token = localStorage.getItem('jwt');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Expires:', new Date(payload.exp * 1000));
  console.log('Expired?:', new Date() > new Date(payload.exp * 1000));
}
```

---

## ?? Summary

**What's Happening**: System is working correctly by asking you to complete your profile first.

**What To Do**:
1. ? Clear token (expired)
2. ? Login again
3. ? Complete profile form
4. ? Access hall tickets

**After These Steps**: You'll be able to see and download hall tickets (if released by admin).

---

## ?? Security Note

The system **requires** a profile because:
- It validates you're a real student
- It determines which exam series you're eligible for
- It associates you with a department and year
- It's needed to generate your hall ticket number

**This is by design and is a security feature.** ?

---

*After completing your profile, hall tickets will work perfectly!* ??
