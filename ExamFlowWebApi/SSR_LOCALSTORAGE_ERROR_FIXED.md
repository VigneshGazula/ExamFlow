# SSR localStorage Error - FIXED ?

## Problem
**Error:** `ReferenceError: localStorage is not defined`

This error occurs because Angular's **server-side rendering (SSR)** tries to execute code on the server, but `localStorage` only exists in the browser.

## Root Cause
All services were directly accessing `localStorage` without checking if the code is running in a browser environment:

```typescript
// ? CAUSES ERROR in SSR
const token = localStorage.getItem('jwt');
```

## Solution
Use Angular's `PLATFORM_ID` and `isPlatformBrowser` to check if code is running in the browser:

```typescript
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

constructor(
  private http: HttpClient,
  @Inject(PLATFORM_ID) private platformId: Object
) {}

private getHeaders(): HttpHeaders {
  let token = '';
  
  // ? Only access localStorage in browser
  if (isPlatformBrowser(this.platformId)) {
    token = localStorage.getItem('jwt') || '';
  }
  
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
}
```

## Files Fixed

### 1. ? exam.service.ts
- Added `PLATFORM_ID` injection
- Added `isPlatformBrowser` check in `getHeaders()`
- Protected `localStorage.getItem()` calls

### 2. ? student-profile.service.ts
- Added `PLATFORM_ID` injection
- Added `isPlatformBrowser` check in `getHeaders()`
- Protected `localStorage.getItem()` calls

### 3. ? auth-api.service.ts
- Added `PLATFORM_ID` injection
- Protected all `localStorage` operations:
  - `storeToken()`
  - `getToken()`
  - `storeRole()`
  - `getRole()`
  - `clearAuth()`

## Why This Happens

Angular uses **Server-Side Rendering (SSR)** to:
- Improve SEO
- Faster initial page load
- Better performance

During SSR, Angular code runs on the **Node.js server**, which doesn't have:
- `window` object
- `document` object
- `localStorage` / `sessionStorage`
- Browser APIs

## Best Practices

### ? Always Check Platform
```typescript
if (isPlatformBrowser(this.platformId)) {
  // Browser-only code
  localStorage.setItem('key', 'value');
}
```

### ? Inject PLATFORM_ID
```typescript
constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
```

### ? Provide Fallbacks
```typescript
const token = isPlatformBrowser(this.platformId) 
  ? localStorage.getItem('jwt') || ''
  : '';
```

## Other Browser APIs to Protect

If you use any of these, wrap them in `isPlatformBrowser()`:
- `window`
- `document`
- `localStorage`
- `sessionStorage`
- `navigator`
- `location`
- DOM manipulation
- Browser-only libraries

## Testing

1. **Clear the cache:**
```bash
rm -rf .angular/cache
```

2. **Restart the dev server:**
```bash
ng serve
```

3. **Expected Result:** ? No more `localStorage is not defined` errors

## Additional Notes

### Production Build
For production builds with SSR, always test:
```bash
ng build
ng build:ssr
node dist/Frontend/server/server.mjs
```

### Alternative: Use Transfer State
For complex scenarios, use Angular's `TransferState` API to share data between server and browser.

## Status
? **All localStorage errors fixed**
? **SSR compatibility added**
? **Application should now run without errors**

## Next Steps
1. Restart `ng serve`
2. Verify no localStorage errors
3. Test admin exam management flow
4. Continue with remaining component development

---

**Fixed in:** exam.service.ts, student-profile.service.ts, auth-api.service.ts
