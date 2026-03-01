# ?? PDF Generation Error - Troubleshooting Guide

## Issue
Getting **500 Internal Server Error** when downloading hall ticket PDF.

---

## ? Fixes Applied

### 1. Added Detailed Logging
**File**: `PdfHallTicketGenerator.cs`
- Added `ILogger` injection
- Logs PDF generation start and completion
- Catches and logs any errors with stack trace

### 2. Enhanced Error Handling in Controller
**File**: `HallTicketController.cs`
- Added console logging at each step
- Separate try-catch for PDF generation
- Returns detailed error messages with stack trace

---

## ?? How to Debug

### Step 1: Restart Backend with Logging
```powershell
cd F:\ExamFlow\ExamFlowWebApi
dotnet run --launch-profile http
```

### Step 2: Try to Download Hall Ticket
1. Login as student
2. Navigate to Hall Tickets
3. Click **Download Hall Ticket**

### Step 3: Check Backend Console
You'll see detailed logs like:
```
[INFO] Fetching hall ticket for UserId: 1, ExamSeriesId: xxx
[INFO] Hall ticket found: HT-2026-CSE-001. Generating PDF...
[INFO] Starting PDF generation for hall ticket: HT-2026-CSE-001
[INFO] PDF generated successfully. Size: 52441 bytes
```

**If error occurs, you'll see:**
```
[ERROR] PDF generation failed: [specific error message]
[ERROR] Stack trace: [detailed stack trace]
```

---

## ?? Common Issues & Solutions

### Issue 1: "Student profile not found"
**Cause**: Student doesn't have a profile in database

**Solution**:
```sql
-- Check if profile exists
SELECT * FROM "StudentProfiles" WHERE "StudentId" = 1;

-- If not, create one via the frontend profile completion page
```

### Issue 2: "Hall ticket not available"
**Cause**: Hall ticket not released for this student

**Solution**:
1. Login as admin
2. Navigate to Manage Exams
3. Release hall tickets for the exam series
4. Select the student's branch/section

### Issue 3: "ExamSchedule is null or empty"
**Cause**: No exams scheduled for this exam series

**This is OK!** - PDF will show: "Exam schedule will be updated soon"

### Issue 4: iText7 Library Error
**Symptoms**: Error mentioning fonts or PDF structure

**Solution**:
```powershell
# Reinstall iText7
dotnet remove package itext7
dotnet add package itext7 --version 8.0.5
dotnet build
```

### Issue 5: "Object reference not set to an instance"
**Cause**: Missing data in HallTicketDownloadDTO

**Debug**:
Add this to controller before PDF generation:
```csharp
Console.WriteLine($"Hall Ticket Data: {JsonSerializer.Serialize(hallTicket)}");
```

Check what's null.

---

## ?? Verify Database Data

### Check Hall Ticket Exists
```sql
SELECT * FROM "HallTickets" 
WHERE "StudentId" = 1 
  AND "ExamSeriesId" = '25bc7fe7-bf17-43a2-83a8-52f53edd88ef'
  AND "Status" = 'Released';
```

**Expected**: Returns the hall ticket record

### Check Exam Schedule
```sql
SELECT * FROM "Exams" 
WHERE "ExamSeriesId" = '25bc7fe7-bf17-43a2-83a8-52f53edd88ef'
  AND "Branch" = 'Computer Science';
```

**Expected**: Returns scheduled exams (or empty if not scheduled yet - this is OK)

### Check Student Profile
```sql
SELECT u."Id", u."FullName", u."UserId", 
       sp."RollNumber", sp."Department", sp."Year", sp."Section"
FROM "Users" u
LEFT JOIN "StudentProfiles" sp ON u."Id" = sp."StudentId"
WHERE u."Id" = 1;
```

**Expected**: Returns user with profile data

---

## ?? Test PDF Generation Manually

### Create Test Endpoint
Add this to `HallTicketController.cs`:

```csharp
[HttpGet("test-pdf")]
[AllowAnonymous] // For testing only - remove in production
public IActionResult TestPdfGeneration()
{
    try
    {
        // Create test data
        var testData = new HallTicketDownloadDTO
        {
            HallTicketNumber = "HT-TEST-001",
            StudentName = "Test Student",
            RollNumber = "TEST001",
            Department = "Computer Science",
            ExamSeriesName = "Test Exam Series",
            IssuedAt = DateTime.Now,
            ExamSchedule = new List<ExamScheduleDTO>
            {
                new ExamScheduleDTO
                {
                    SubjectName = "Test Subject",
                    SubjectCode = "TS101",
                    ExamDate = DateTime.Now.AddDays(7),
                    ExamTime = "10:00 AM - 01:00 PM"
                }
            }
        };

        var pdfBytes = _pdfGenerator.GenerateHallTicketPdf(testData);
        return File(pdfBytes, "application/pdf", "TestHallTicket.pdf");
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
    }
}
```

**Test**: Navigate to `http://localhost:5275/api/hallticket/test-pdf`

**Expected**: Downloads a PDF file

**If fails**: Error message shows exactly what's wrong

---

## ?? Check Logs

### Backend Console Logs
Look for these patterns:

**Success**:
```
[INFO] Fetching hall ticket for UserId: 1, ExamSeriesId: xxx
[INFO] Hall ticket found: HT-2026-CSE-001
[INFO] Starting PDF generation
[INFO] PDF generated successfully. Size: 52441 bytes
```

**Failure**:
```
[ERROR] PDF generation failed: [error message]
[ERROR] Stack trace: at PdfHallTicketGenerator.GenerateHallTicketPdf...
```

### Frontend Console Logs
```
downloading hall ticket: [Blob object]
? or
Error downloading hall ticket: HttpErrorResponse {status: 500, ...}
```

---

## ?? Step-by-Step Testing

### 1. Verify Backend is Running
```powershell
curl http://localhost:5275/swagger
```
**Expected**: Swagger UI loads

### 2. Verify Authentication
**Browser Console**:
```javascript
const token = localStorage.getItem('jwt');
console.log('Token exists:', !!token);
```
**Expected**: `Token exists: true`

### 3. Test API Endpoint Directly
**Browser Console**:
```javascript
fetch('http://localhost:5275/api/hallticket/25bc7fe7-bf17-43a2-83a8-52f53edd88ef/download', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
  }
})
.then(r => {
  console.log('Status:', r.status);
  if (r.status === 200) {
    return r.blob().then(blob => console.log('PDF Size:', blob.size, 'bytes'));
  } else {
    return r.json().then(err => console.error('Error:', err));
  }
});
```

**Expected**: 
```
Status: 200
PDF Size: 52441 bytes
```

**If 500 error**:
```
Status: 500
Error: {message: "...", error: "...", stackTrace: "..."}
```

---

## ?? Quick Fixes

### If "iText7 not found"
```powershell
cd F:\ExamFlow\ExamFlowWebApi
dotnet add package itext7
dotnet build
```

### If "Logger not injected"
Already fixed in latest code - rebuild backend.

### If "Hall ticket data is null"
Check if hall ticket is actually released:
```sql
SELECT * FROM "HallTickets" 
WHERE "Status" = 'Released'
LIMIT 5;
```

If empty, release hall tickets via admin panel first.

---

## ? Expected Behavior

### Success Flow:
1. Student clicks "Download Hall Ticket"
2. Backend logs: `[INFO] Fetching hall ticket...`
3. Backend logs: `[INFO] Hall ticket found...`
4. Backend logs: `[INFO] Starting PDF generation...`
5. Backend logs: `[INFO] PDF generated successfully...`
6. Browser downloads: `HallTicket_21CS001_HT-2026-CSE-001.pdf`

### Error Flow with Good Logging:
1. Student clicks "Download Hall Ticket"
2. Backend logs error with exact line and message
3. You can fix based on the error message

---

## ?? Need More Help?

If still not working after following this guide:

1. **Copy the complete error from backend console**
2. **Check what line number it fails at**
3. **Verify all database tables have data**

The enhanced logging will tell you exactly what's wrong!

---

*With the new logging, you'll see exactly where and why the PDF generation fails!* ??
