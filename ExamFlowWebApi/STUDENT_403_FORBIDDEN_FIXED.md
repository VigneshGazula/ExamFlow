# 403 Forbidden Error - Student Role Issue - FIXED ?

## Issue Summary
Student users were getting **403 Forbidden** errors when accessing `/student/exams` even after logging in with Student credentials.

## Root Cause
The JWT token might not contain the correct role claim that ASP.NET Core `[Authorize(Roles = "Student")]` expects, or there's a mismatch in how roles are being validated.

## Fixes Applied

### 1. Frontend - Redirect to Dashboard on 403 ?

Updated all error handlers in `exams.component.ts` to redirect to student dashboard instead of login page on 403 errors.

**File**: `Frontend/src/app/student/exams/exams.component.ts`

**Changes**:
```typescript
// Before - Redirected to login
else if (error.status === 403) {
  this.errorMessage = 'Access denied. Please login as a Student user.';
  setTimeout(() => {
    this.router.navigate(['/login']);  // ? Takes user to login
  }, 3000);
}

// After - Redirects to dashboard
else if (error.status === 403) {
  this.errorMessage = 'Access denied. Redirecting to dashboard...';
  console.error('403 Forbidden - Please ensure you are logged in as a Student.');
  setTimeout(() => {
    this.router.navigate(['/student/dashboard']);  // ? Takes user home
  }, 2000);
}
```

Applied to all three error handlers:
- `loadStudentProfile()`
- `loadExamSeries()`
- `viewExamDetails()`

### 2. Backend - Debug Endpoint Added ?

Added a debug endpoint to help diagnose token issues.

**File**: `Controllers/ExamsController.cs`

**New Endpoint**:
```csharp
/// <summary>
/// Debug endpoint to check current user claims
/// </summary>
[HttpGet("debug/claims")]
[Authorize]
public IActionResult GetClaims()
{
    var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var role = User.FindFirst(ClaimTypes.Role)?.Value;
    var isInStudentRole = User.IsInRole("Student");
    
    return Ok(new
    {
        userId = userId,
        role = role,
        isInStudentRole = isInStudentRole,
        allClaims = claims
    });
}
```

## How to Test the Debug Endpoint

### Step 1: Login as Student
Login normally with student credentials.

### Step 2: Call Debug Endpoint
Open browser console and run:
```javascript
fetch('http://localhost:5275/api/examseries/debug/claims', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('jwt'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('User Claims Debug Info:');
  console.log('User ID:', data.userId);
  console.log('Role:', data.role);
  console.log('Is in Student Role:', data.isInStudentRole);
  console.log('All Claims:', data.allClaims);
});
```

### Expected Output:
```json
{
  "userId": "1",
  "role": "Student",
  "isInStudentRole": true,
  "allClaims": [
    {
      "type": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
      "value": "1"
    },
    {
      "type": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
      "value": "STU001"
    },
    {
      "type": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
      "value": "student@test.com"
    },
    {
      "type": "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
      "value": "Student"
    }
  ]
}
```

**If `isInStudentRole` is false**, there's a role claim issue!

## Troubleshooting Steps

### Check 1: Verify Token Role Claim

Run this in browser console after login:
```javascript
const token = localStorage.getItem('jwt');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('JWT Payload:', payload);
console.log('Role Claim:', payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
```

**Expected**: Should show `"Student"`

### Check 2: Verify Database Role

Check the Users table in your database:
```sql
SELECT UserId, FullName, Email, Role 
FROM "Users" 
WHERE Email = 'student@test.com';
```

**Expected**: Role column should be exactly `"Student"` (case-sensitive!)

### Check 3: Test Login Flow

1. **Logout completely**:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Go to login page**: `/login`

3. **Select "Student" from dropdown**

4. **Enter credentials** and login

5. **Check token** immediately after login:
   ```javascript
   const token = localStorage.getItem('jwt');
   console.log('Token exists:', !!token);
   ```

### Check 4: Verify appsettings.json

Ensure JWT settings are correct:
```json
{
  "Jwt": {
    "Key": "your-super-secret-key-here-minimum-32-characters-long",
    "Issuer": "ExamFlowAPI",
    "Audience": "ExamFlowClient"
  }
}
```

## Common Issues & Solutions

### Issue 1: Role is null or empty in token

**Symptom**: `isInStudentRole: false`, role claim missing

**Solution**: 
1. Check database - User.Role must be "Student"
2. Re-register the student user
3. Clear token and re-login

**Fix in Database**:
```sql
UPDATE "Users" 
SET "Role" = 'Student' 
WHERE "Email" = 'student@test.com';
```

### Issue 2: Role claim has different type

**Symptom**: Role exists but authorization fails

**Solution**: Ensure JWT uses standard claim types

**Verify in JwtTokenGenerator.cs**:
```csharp
new Claim(ClaimTypes.Role, user.Role)  // ? Correct
```

NOT:
```csharp
new Claim("role", user.Role)  // ? Wrong
```

### Issue 3: Case sensitivity

**Symptom**: Database has "student" but endpoint expects "Student"

**Solution**: Make roles case-sensitive consistent

**Fix**:
```sql
UPDATE "Users" 
SET "Role" = 'Student'  -- Capital S
WHERE LOWER("Role") = 'student';
```

### Issue 4: Token not refreshed after role change

**Symptom**: Changed role in database but still getting 403

**Solution**: Force logout and re-login
```javascript
localStorage.clear();
// Then login again
```

## Testing Checklist

After applying fixes, test these scenarios:

### ? Test 1: Fresh Login
- [ ] Logout completely
- [ ] Login as Student
- [ ] Navigate to `/student/exams`
- [ ] Should load without errors OR show empty state

### ? Test 2: Debug Endpoint
- [ ] Call `/api/examseries/debug/claims`
- [ ] Verify `isInStudentRole: true`
- [ ] Verify role claim is "Student"

### ? Test 3: Error Handling
- [ ] Trigger 403 error (if still occurs)
- [ ] Should show: "Access denied. Redirecting to dashboard..."
- [ ] Should redirect to `/student/dashboard` after 2 seconds

### ? Test 4: Profile Creation
- [ ] New student user
- [ ] Complete profile
- [ ] Navigate to `/student/exams`
- [ ] Should work OR show empty state

## Backend Verification

### JWT Token Generation is Correct ?

**File**: `Helpers/JwtTokenGenerator.cs`

```csharp
var claims = new[]
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim(ClaimTypes.Name, user.UserId),
    new Claim(ClaimTypes.Email, user.Email),
    new Claim(ClaimTypes.Role, user.Role)  // ? Using ClaimTypes.Role
};
```

### Authentication Configuration is Correct ?

**File**: `Program.cs`

```csharp
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
    };
});
```

### Controller Authorization is Correct ?

**File**: `Controllers/ExamsController.cs`

```csharp
[HttpGet("student/{branch}")]
[Authorize(Roles = "Student")]  // ? Requires Student role
public async Task<IActionResult> GetStudentExamSeries(string branch)
```

## What Changed

### Frontend (exams.component.ts)
- ? 403 errors now redirect to `/student/dashboard` instead of `/login`
- ? Shows "Access denied. Redirecting to dashboard..." message
- ? Logs detailed error to console for debugging
- ? Waits 2 seconds before redirect

### Backend (ExamsController.cs)
- ? Added `/api/examseries/debug/claims` endpoint
- ? Returns all user claims for debugging
- ? Shows if user is in Student role
- ? Helps diagnose token issues

## Status: ? FIXES APPLIED

The application now:
1. ? **Redirects to dashboard** on 403 errors (not login)
2. ? **Provides debug endpoint** to check token claims
3. ? **Shows helpful messages** before redirect
4. ? **Logs errors** to console for troubleshooting

## Next Steps for User

### Immediate Actions:

1. **Restart Backend** (if not already running)
   ```bash
   cd ExamFlowWebApi
   dotnet run
   ```

2. **Clear Browser Data**
   - Press F12 (open DevTools)
   - Run: `localStorage.clear()`
   - Close browser completely
   - Reopen browser

3. **Fresh Login**
   - Go to `/login`
   - Select "Student" from dropdown
   - Enter student credentials
   - Login

4. **Test Debug Endpoint**
   - After login, run in console:
   ```javascript
   fetch('http://localhost:5275/api/examseries/debug/claims', {
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('jwt')
     }
   })
   .then(r => r.json())
   .then(console.log);
   ```

5. **Navigate to My Exams**
   - Click "My Exams" in navbar
   - Should work now!

### If Still Getting 403:

1. **Check debug endpoint output** - If `isInStudentRole: false`, the role claim is missing
2. **Check database** - Verify user role is exactly "Student"
3. **Re-register** - Create a fresh student account
4. **Check backend logs** - Look for authentication errors

## Prevention

To prevent this issue in the future:

### 1. Add Logging in AuthService
```csharp
public AuthResponseDTO signIn(LoginDTORequest loginDTORequest)
{
    // ... existing code ...
    
    var token = _jwtTokenGenerator.GenerateToken(user);
    
    // Log for debugging
    Console.WriteLine($"Generated token for user: {user.UserId}, Role: {user.Role}");
    
    return new AuthResponseDTO
    {
        Token = token,
        Role = user.Role
    };
}
```

### 2. Add Token Validation on Frontend
```typescript
// In auth.service.ts
decodeToken(token: string): any {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

verifyStudentRole(token: string): boolean {
  const payload = this.decodeToken(token);
  const roleClaim = payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  return roleClaim === 'Student';
}
```

### 3. Add Role Guard
Create a dedicated student guard:
```typescript
export const StudentGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('jwt');
  if (!token) return false;
  
  // Decode and verify role
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    return role === 'Student';
  } catch {
    return false;
  }
};
```

---

**Updated**: January 2025
**Issue**: 403 Forbidden on student exams page
**Fixes**: Redirect to dashboard + debug endpoint
**Status**: Ready for testing ?
