// Student Role Debugger - Run this in your browser console after logging in as student

console.log('=== STUDENT ROLE DEBUGGER ===\n');

// 1. Check if JWT token exists
const token = localStorage.getItem('jwt');
if (!token) {
    console.error('? NO TOKEN FOUND! You are not logged in.');
} else {
    console.log('? Token exists\n');
    
    // 2. Decode the token
    try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        
        console.log('?? Token Payload:', payload);
        console.log('');
        
        // 3. Check specific claims
        const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
        const name = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        
        console.log('?? User ID:', userId);
        console.log('?? Name:', name);
        console.log('?? Email:', email);
        console.log('?? Role:', role);
        console.log('');
        
        // 4. Check role value
        if (role === 'Student') {
            console.log('? Role is EXACTLY "Student" - This should work!');
        } else if (role && role.toLowerCase() === 'student') {
            console.error('? Role is "' + role + '" (wrong case) - Should be "Student" with capital S');
            console.log('?? FIX: Update your database role to "Student" or re-register');
        } else if (!role) {
            console.error('? Role claim is MISSING from token!');
            console.log('?? FIX: Check JWT token generation in backend');
        } else {
            console.error('? Role is "' + role + '" - Should be "Student"');
            console.log('?? FIX: Logout and login as Student, or update database');
        }
        console.log('');
        
        // 5. Check token expiration
        const exp = payload['exp'];
        const now = Math.floor(Date.now() / 1000);
        if (exp < now) {
            console.error('? TOKEN EXPIRED!');
            console.log('Expired:', new Date(exp * 1000));
            console.log('?? FIX: Login again to get new token');
        } else {
            console.log('? Token is still valid');
            const hoursLeft = ((exp - now) / 3600).toFixed(2);
            console.log('? Expires in:', hoursLeft, 'hours');
        }
        console.log('');
        
        // 6. Test the debug endpoint
        console.log('?? Testing backend debug endpoint...\n');
        
        fetch('http://localhost:5275/api/examseries/debug/claims', {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        })
        .then(r => {
            if (r.ok) return r.json();
            throw new Error('Status: ' + r.status + ' ' + r.statusText);
        })
        .then(data => {
            console.log('?? Backend Debug Response:');
            console.log('  User ID:', data.userId);
            console.log('  Role:', data.role);
            console.log('  Is in Student Role:', data.isInStudentRole);
            console.log('');
            
            if (data.isInStudentRole) {
                console.log('? Backend confirms you are a Student!');
                console.log('');
                console.log('?? If you still get 403 error, try:');
                console.log('   1. Hard refresh the page (Ctrl+Shift+R)');
                console.log('   2. Clear cache and reload');
                console.log('   3. Restart backend server');
            } else {
                console.error('? Backend says you are NOT a Student!');
                console.log('');
                console.log('?? FIXES:');
                console.log('   1. Logout completely: localStorage.clear()');
                console.log('   2. Login again as Student');
                console.log('   3. OR run this SQL:');
                console.log('      UPDATE "Users" SET "Role" = \'Student\' WHERE "Email" = \'your@email.com\';');
            }
            
            console.log('');
            console.log('?? All Claims:', data.allClaims);
        })
        .catch(err => {
            console.error('? Debug endpoint failed:', err.message);
            console.log('?? Make sure backend is running on http://localhost:5275');
        });
        
    } catch (e) {
        console.error('? Failed to decode token:', e);
    }
}

console.log('\n=== END DEBUGGER ===');
