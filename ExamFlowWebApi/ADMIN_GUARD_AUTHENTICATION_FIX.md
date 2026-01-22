# 401 Unauthorized Error - FIXED ?

## Problem
**Error:** `401 Unauthorized` when accessing exam series endpoints

**Cause:** User is not logged in as Admin or JWT token is missing/expired

## Solution Implemented

### 1. ? Created AdminGuard
**File:** `Frontend/src/app/guards/admin.guard.ts`

**Features:**
- Checks for JWT token in localStorage
- Verifies user has "Admin" role
- Redirects to login if not authenticated
- Redirects to home if wrong role
- SSR-safe (uses isPlatformBrowser)

### 2. ? Applied Guard to Admin Routes
**File:** `admin-routing.module.ts`

Added `canActivate: [AdminGuard]` to parent route:
```typescript
{
  path: '',
  component: NavbarComponent,
  canActivate: [AdminGuard], // ? Protects all child routes
  children: [...]
}
```

### 3. ? Enhanced Error Handling
**Files:** 
- `manage-exams.component.ts`
- `branch-schedule-list.component.ts`

Added 401 error detection and auto-redirect:
```typescript
error: (error) => {
  if (error.status === 401) {
    this.errorMessage = 'Session expired. Please login again.';
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 2000);
  }
}
```

## How to Use

### Step 1: Login as Admin
```
1. Navigate to: http://localhost:4200/auth/login
2. Select Role: Admin
3. Enter credentials
4. Click Login
```

### Step 2: Access Admin Pages
```
After successful login, you can access:
- http://localhost:4200/admin/manage-exams
- http://localhost:4200/admin/dashboard
- etc.
```

## Testing the Fix

### Test 1: Without Login
1. Open browser in incognito mode
2. Navigate to `http://localhost:4200/admin/manage-exams`
3. **Expected:** Redirect to `/auth/login`

### Test 2: With Student Role
1. Login as Student
2. Try to access `http://localhost:4200/admin/manage-exams`
3. **Expected:** Alert "Access denied" + Redirect to home

### Test 3: With Admin Role
1. Login as Admin
2. Navigate to `http://localhost:4200/admin/manage-exams`
3. **Expected:** Page loads successfully ?

## Creating Admin Account

### Option 1: Via Signup Page
```
1. Go to: http://localhost:4200/auth/signup
2. Fill form:
   - Full Name: Admin User
   - Email: admin@example.com
   - Password: Admin@123
   - Confirm Password: Admin@123
   - Role: Admin
3. Click Sign Up
4. Note the generated User ID
5. Use it to login
```

### Option 2: Via Database (PostgreSQL)
```sql
-- Insert admin user directly
INSERT INTO "Users" ("UserId", "FullName", "Email", "PasswordHash", "Role", "IsActive")
VALUES ('admin001', 'Admin User', 'admin@example.com', 'HASHED_PASSWORD', 'Admin', true);
```

## Checking Authentication Status

### Browser Console:
```javascript
// Check if logged in
localStorage.getItem('jwt')  // Should return JWT token

// Check role
localStorage.getItem('role')  // Should return "Admin"
```

### Clear Session (Logout):
```javascript
localStorage.removeItem('jwt');
localStorage.removeItem('role');
```

## Guard Flow Diagram

```
User tries to access /admin/manage-exams
           ?
     AdminGuard Checks
           ?
   ??????????????????
   ?  Has JWT?      ?
   ??????????????????
         ? No
   Redirect to /auth/login
         ? Yes
   ??????????????????
   ?  Role = Admin? ?
   ??????????????????
         ? No
   Alert + Redirect to /
         ? Yes
   ? Allow Access
```

## Common Errors & Solutions

### Error: "No JWT token found"
**Solution:** Login first

### Error: "Access denied. Admin role required"
**Solution:** Login with Admin account, not Student/Faculty

### Error: "Session expired"
**Solution:** Login again (JWT expired after 2 hours)

### Error: Still getting 401 after login
**Solution:** 
1. Check backend is running
2. Check JWT is stored: `localStorage.getItem('jwt')`
3. Check role is correct: `localStorage.getItem('role')`
4. Try logout and login again

## Security Features

### ? Route Protection
- All admin routes protected by guard
- Cannot access without authentication

### ? Role-Based Access
- Only Admin role can access admin pages
- Student/Faculty roles blocked

### ? Session Management
- JWT token stored in localStorage
- Auto-redirect on expiration
- Clear error messages

### ? SSR Safe
- Uses `isPlatformBrowser` check
- No localStorage errors on server

## Files Modified

1. ? `guards/admin.guard.ts` - Created new guard
2. ? `admin/admin-routing.module.ts` - Applied guard
3. ? `admin/manage-exams/manage-exams.component.ts` - 401 handling
4. ? `admin/branch-schedule-list/branch-schedule-list.component.ts` - 401 handling

## Status

? **Authentication Guard Implemented**
? **401 Error Handling Added**
? **Auto-redirect on Unauthorized**
? **Role-based Access Control**

## Next Steps

1. **Login as Admin** before accessing admin pages
2. All exam management features will work after authentication
3. JWT token valid for 2 hours (backend setting)

---

**Remember:** Always login before accessing protected routes! ??
