# 401 Unauthorized - Student Profile Error - Troubleshooting Guide

## Error Details

**Error Message**: "Error loading profile: HttpErrorResponse"
**Status Code**: 401 Unauthorized
**Endpoint**: `GET http://localhost:5275/api/StudentProfile`

## Root Causes

The 401 Unauthorized error when loading student profile can happen due to:

### 1. ? User Not Logged In
**Symptom**: No JWT token in localStorage
**Cause**: User hasn't logged in or logged out
**Solution**: Login as a student user

### 2. ?? Token Expired
**Symptom**: Token exists but is expired
**Cause**: JWT token has exceeded its validity period
**Solution**: Re-login to get a fresh token

### 3. ?? Wrong User Role
**Symptom**: Token valid but user is Admin/Faculty
**Cause**: Logged in with wrong role
**Solution**: Logout and login as Student

### 4. ?? Missing Authorization Header
**Symptom**: Token exists but not sent with request
**Cause**: Service not attaching header properly
**Solution**: Check service implementation

## Quick Diagnosis

### Step 1: Check if User is Logged In

Open browser console and run:
```javascript
localStorage.getItem('jwt')
```

**Expected Result**: Should return a JWT token string
**If null/empty**: User is not logged in ? **Login required**

### Step 2: Check Token Validity

Copy the JWT token and decode it at [jwt.io](https://jwt.io)

Check the payload:
```json
{
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "1",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Student",
  "exp": 1234567890
}
```

**Verify**:
- ? Role is "Student"
- ? `exp` (expiration) is in the future (Unix timestamp)

**If expired**: Re-login to get new token
**If role is wrong**: Logout and login as Student

### Step 3: Check Request Headers

In browser DevTools ? Network tab:
1. Reload the page
2. Find the request to `/api/StudentProfile`
3. Check Request Headers

**Should see**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**If missing**: Service is not attaching the header

## Solutions

### Solution 1: Login as Student ?

1. **Navigate to Login Page**
   ```
   http://localhost:4200/login
   ```

2. **Use Student Credentials**
   - User ID: Your student ID
   - Password: Your password

3. **Verify Login**
   - Check localStorage for JWT token
   - Check token role is "Student"

### Solution 2: Re-login (Token Expired) ?

1. **Logout**
   - Click Logout in navbar
   - Or clear localStorage: `localStorage.clear()`

2. **Login Again**
   - Navigate to `/login`
   - Enter credentials
   - New token will be generated

### Solution 3: Create Student Account ?

If you don't have a student account:

**API Call**:
```http
POST http://localhost:5275/api/auth/register
Content-Type: application/json

{
  "userId": "student001",
  "fullName": "Test Student",
  "email": "student@test.com",
  "password": "Student@123",
  "role": "Student"
}
```

**Or use Postman/Curl**:
```bash
curl -X POST http://localhost:5275/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "student001",
    "fullName": "Test Student",
    "email": "student@test.com",
    "password": "Student@123",
    "role": "Student"
  }'
```

### Solution 4: Update Token Configuration ??

If tokens are expiring too quickly, update `Program.cs`:

**File**: `Program.cs`

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,  // Enable expiration check
            ClockSkew = TimeSpan.Zero  // No clock skew tolerance
        };
    });
```

**Update Token Expiration** in `AuthController.cs`:

```csharp
var tokenDescriptor = new SecurityTokenDescriptor
{
    Subject = new ClaimsIdentity(claims),
    Expires = DateTime.UtcNow.AddHours(24),  // 24 hours instead of 2
    SigningCredentials = new SigningCredentials(
        new SymmetricSecurityKey(key),
        SecurityAlgorithms.HmacSha256Signature
    )
};
```

## Code Fixes Applied

### Frontend - Enhanced Error Handling ?

**File**: `Frontend/src/app/student/exams/exams.component.ts`

Updated all three methods with better error handling:

**1. loadStudentProfile()**
```typescript
loadStudentProfile(): void {
  this.studentProfileService.getProfile().subscribe({
    next: (profile) => {
      this.studentBranch = profile.department;
      this.studentBranchCode = this.departmentToBranch[profile.department] || profile.department;
      this.loadExamSeries();
    },
    error: (error) => {
      console.error('Error loading profile:', error);
      
      // Check if it's an authentication error
      if (error.status === 401) {
        this.errorMessage = 'Authentication failed. Please login again.';
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else if (error.status === 404) {
        // Profile not found - redirect to profile completion
        this.errorMessage = 'Profile not found. Redirecting to profile setup...';
        setTimeout(() => {
          this.router.navigate(['/student/complete-profile']);
        }, 1500);
      } else {
        this.errorMessage = error.error?.message || 'Failed to load your profile. Please try again.';
      }
      
      this.isLoading = false;
    }
  });
}
```

**2. loadExamSeries()**
```typescript
loadExamSeries(): void {
  this.isLoading = true;
  this.examService.getStudentExamSeries(this.studentBranch).subscribe({
    next: (series) => {
      this.examSeriesList = series;
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading exam series:', error);
      
      if (error.status === 401) {
        this.errorMessage = 'Authentication failed. Please login again.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else {
        this.errorMessage = error.error?.message || 'Failed to load exam series. Please try again.';
      }
      
      this.isLoading = false;
    }
  });
}
```

**3. viewExamDetails()**
```typescript
viewExamDetails(series: StudentExamSeriesResponse): void {
  this.selectedExamSeries = series;
  this.isLoadingExams = true;
  
  this.examService.getStudentExams(series.id, this.studentBranch).subscribe({
    next: (exams) => {
      this.exams = exams;
      this.isLoadingExams = false;
    },
    error: (error) => {
      console.error('Error loading exams:', error);
      
      if (error.status === 401) {
        this.errorMessage = 'Authentication failed. Please login again.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else {
        this.errorMessage = error.error?.message || 'Failed to load exam details. Please try again.';
      }
      
      this.isLoadingExams = false;
    }
  });
}
```

**Benefits**:
- ? Detects 401 errors specifically
- ? Shows helpful error messages
- ? Auto-redirects to login on auth failure
- ? Handles profile not found (404) case
- ? Graceful error handling

## Testing Steps

### Test 1: Valid Student Login ?

1. **Login as Student**
   ```
   User ID: student001
   Password: Student@123
   ```

2. **Navigate to Exams**
   ```
   /student/exams
   ```

3. **Expected Result**:
   - ? No errors
   - ? Profile loads successfully
   - ? Exam series displayed (or empty state)

### Test 2: Token Expiration ??

1. **Manually Expire Token**
   - Login as student
   - Wait for token to expire (or modify exp claim)
   - Navigate to `/student/exams`

2. **Expected Result**:
   - ? 401 error caught
   - ? Error message: "Authentication failed. Please login again."
   - ? Auto-redirect to login after 2 seconds

### Test 3: No Token (Not Logged In) ??

1. **Clear Storage**
   ```javascript
   localStorage.clear()
   ```

2. **Navigate to /student/exams**

3. **Expected Result**:
   - ? 401 error caught
   - ? Error message displayed
   - ? Redirects to login

### Test 4: Wrong Role (Admin User) ??

1. **Login as Admin**
   ```
   User ID: admin001
   Password: Admin@123
   ```

2. **Try to access /student/exams**

3. **Expected Result**:
   - ? 401 error (admin token doesn't have student claims)
   - ? Error message displayed
   - ? Redirects to login

## Debugging Commands

### Check Token in Console
```javascript
// Get token
const token = localStorage.getItem('jwt');
console.log('Token:', token);

// Decode token (manual)
const base64Url = token.split('.')[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const payload = JSON.parse(window.atob(base64));
console.log('Decoded Token:', payload);

// Check expiration
const exp = payload.exp;
const now = Date.now() / 1000;
console.log('Expired:', now > exp);
console.log('Expires in:', (exp - now) / 3600, 'hours');
```

### Check API Response
```javascript
// Manually call API
fetch('http://localhost:5275/api/StudentProfile', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('jwt'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Clear and Re-Login
```javascript
// Clear everything
localStorage.clear();
sessionStorage.clear();

// Navigate to login
window.location.href = '/login';
```

## Common Issues & Solutions

### Issue 1: "Authentication failed. Please login again."

**Cause**: Token expired or invalid
**Solution**:
1. Click "OK" on the error message
2. Wait for auto-redirect to login (2 seconds)
3. Or manually go to `/login`
4. Login with student credentials

### Issue 2: "Profile not found"

**Cause**: Student hasn't completed their profile
**Solution**:
1. Error message will auto-redirect to profile completion
2. Or manually navigate to `/student/complete-profile`
3. Fill in profile details
4. Submit

### Issue 3: Error persists after re-login

**Cause**: Cached data or browser issue
**Solution**:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear localStorage: `localStorage.clear()`
3. Close and reopen browser
4. Login again

### Issue 4: Backend returns 500 error

**Cause**: Database or server error
**Solution**:
1. Check backend console for errors
2. Verify database connection
3. Check if StudentProfile table exists
4. Restart backend server

## Prevention Strategies

### 1. Implement Token Refresh
Add token refresh logic before expiration:
```typescript
// In auth.service.ts
refreshToken(): Observable<any> {
  return this.http.post(`${this.apiUrl}/refresh`, {
    token: localStorage.getItem('jwt')
  });
}

// In app.component.ts
setInterval(() => {
  this.authService.refreshToken().subscribe(/* ... */);
}, 1000 * 60 * 30); // Refresh every 30 minutes
```

### 2. Add Route Guards
Ensure students must be logged in to access routes:
```typescript
// student.guard.ts
export const StudentGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('jwt');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  // Decode and check role
  // ...
  return true;
};
```

### 3. Implement Interceptors
Add HTTP interceptor to handle 401 globally:
```typescript
// auth.interceptor.ts
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Clear token
          localStorage.removeItem('jwt');
          // Redirect to login
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
```

## Status: ? ENHANCED ERROR HANDLING IMPLEMENTED

The component now:
- ? Detects 401 authentication errors
- ? Shows user-friendly error messages
- ? Auto-redirects to login page
- ? Handles profile not found scenario
- ? Provides better debugging information

## Next Steps

1. **Verify User is Logged In as Student**
2. **Check Token Validity** (use jwt.io)
3. **Test the Enhanced Error Handling**
4. **Consider Implementing Token Refresh** (optional)
5. **Add Global Auth Interceptor** (optional)

---

**Updated**: January 2025
**Issue**: 401 Unauthorized when loading student profile
**Solution**: Enhanced error handling with auto-redirect to login
**Status**: Ready for testing ?
