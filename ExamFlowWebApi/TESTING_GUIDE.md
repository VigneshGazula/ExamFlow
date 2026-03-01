# ?? Testing Guide - Hall Ticket PDF Generation

## Quick Test Steps

### 1?? Verify Template File
```bash
# Check if template exists
ls hallticket-html/

# Should show:
# hallticket.html ?
# mlrit_logo.png (optional)
```

### 2?? Test Data Setup (As Admin)

#### Create Exam Series:
```
- Name: "III B.TECH II SEM CIE-1 (R22) FEB 2026"
- Year: 3
- Branches: ["CSE", "ECE", "IT"]
- Start Date: 15-Feb-2026
- End Date: 25-Feb-2026
```

#### Schedule Exams:
```
Exam 1: CS301 | Data Structures | 15-Feb-2026 | 09:00 AM - 12:00 PM | CSE
Exam 2: CS302 | Database Systems | 17-Feb-2026 | 09:00 AM - 12:00 PM | CSE
Exam 3: CS303 | Computer Networks | 19-Feb-2026 | 09:00 AM - 12:00 PM | CSE
```

#### Release Hall Tickets:
```
- Select Exam Series
- Filter by Branch: CSE
- Select All Students
- Click "Release Hall Tickets"
```

### 3?? Test Download (As Student)

```
Student Login ? Hall Ticket Section ? Download Hall Ticket

Expected Behavior:
? First time: Shows "Generating PDF..." (30-60 sec - browser download)
? Subsequent: Quick download (1-2 sec)
? File downloads: HallTicket_22BQ1A0501_HT-2024-00123.pdf
```

### 4?? Verify PDF Contents

Open downloaded PDF and verify:

#### Header Section:
```
?? Institute logo visible (if mlrit_logo.png present)
?? Exam series name: "III B.TECH II SEM CIE-1 (R22) FEB 2026"
?? Department header: "CSE             HALLTICKET"
?? Gray background on header
```

#### Student Information:
```
?? Hall Ticket No: HT-2024-00123
?? Name: RAJESH KUMAR (actual student name)
```

#### Exam Schedule Table:
```
?? Date column: 15/02/2026, 17/02/2026, 19/02/2026
?? Time column: 09:00 AM - 12:00 PM
?? Course Code: CS301, CS302, CS303
?? Registered Courses: Data Structures, Database Systems, Computer Networks
?? Empty rows show "-"
?? Table has black borders
```

#### Footer:
```
?? "Signature of Student" on left
?? "Controller of Examinations" on right
?? Instructions list (5 items)
```

---

## ?? Troubleshooting Test Scenarios

### Test 1: No Exams Scheduled
**Setup**: Release hall ticket but no exams created for that series
**Expected**: All 5 exam rows filled with "-"
**Result**: ?? Pass / ? Fail

### Test 2: Only 2 Exams
**Setup**: Create only 2 exams for the series
**Expected**: First 2 rows filled, remaining 3 rows show "-"
**Result**: ?? Pass / ? Fail

### Test 3: Different Branches
**Setup**: Create exams for CSE and ECE, student is in CSE
**Expected**: PDF shows only CSE exams, not ECE exams
**Result**: ?? Pass / ? Fail

### Test 4: Student Not Eligible
**Setup**: Try to download without hall ticket released
**Expected**: Error message "Hall ticket not available"
**Result**: ?? Pass / ? Fail

### Test 5: First-Time Browser Download
**Setup**: Fresh installation, first PDF generation
**Expected**: Logs show browser download, PDF generates successfully
**Result**: ?? Pass / ? Fail

---

## ?? Expected Console Logs

### Successful Generation:
```
[INFO] Fetching hall ticket for UserId: 123, ExamSeriesId: abc-def-123
[INFO] Hall ticket found: HT-2024-00123. Generating PDF...
[INFO] Starting PDF generation for hall ticket: HT-2024-00123
[INFO] Downloading Chromium browser for PDF generation... (first time only)
[INFO] Chromium browser downloaded successfully
[INFO] PDF generation completed successfully for hall ticket: HT-2024-00123
[INFO] PDF generated successfully. Size: 245678 bytes
```

### Error Scenarios:

#### Template Not Found:
```
[ERROR] HTML template not found at: F:\ExamFlow\ExamFlowWebApi\hallticket-html\hallticket.html
```
**Fix**: Ensure hallticket.html exists in hallticket-html folder

#### Hall Ticket Not Released:
```
[WARNING] Hall ticket not found for UserId: 123, ExamSeriesId: abc-def-123
```
**Fix**: Admin must release hall tickets first

---

## ?? Manual Verification Checklist

### Visual Check:
- [ ] Logo appears at top (if mlrit_logo.png exists)
- [ ] Black borders around entire hall ticket
- [ ] Exam title centered and bold
- [ ] Gray background on "DEPARTMENT HALLTICKET" header
- [ ] Student info properly aligned
- [ ] Table has 4 columns with black borders
- [ ] All 5 rows visible (data or "-")
- [ ] Signature section has two columns
- [ ] Instructions numbered 1-5
- [ ] All text readable and properly formatted

### Data Accuracy Check:
- [ ] Correct student name
- [ ] Correct hall ticket number
- [ ] Correct department code
- [ ] Correct exam series name
- [ ] Dates in dd/MM/yyyy format
- [ ] Times show AM/PM
- [ ] Only exams for student's branch
- [ ] Exams sorted by date

---

## ?? Performance Check

### Expected Timings:
- **First PDF** (with browser download): 30-60 seconds
- **Subsequent PDFs**: 1-3 seconds
- **Multiple Students**: 1-3 seconds per student

### If Slower:
- Check server CPU/RAM usage
- Check disk space (Chromium needs ~120MB)
- Check internet connection (for first-time download)

---

## ? Final Test Workflow

```
1. Admin Creates Exam Series
   ? (Success: Series created)
   
2. Admin Schedules Exams for CSE Branch
   ? (Success: 3 exams created)
   
3. Admin Releases Hall Tickets
   ? (Success: 10 students got hall tickets)
   
4. Student Logs In
   ? (Success: JWT token received)
   
5. Student Views Hall Ticket Section
   ? (Success: Sees available exam series)
   
6. Student Clicks Download
   ? (First time: Browser downloads)
   ? (Success: PDF generates)
   
7. PDF Downloads to Computer
   ? (Success: HallTicket_22BQ1A0501_HT-2024-00123.pdf)
   
8. Student Opens PDF
   ? (Success: All data filled correctly)
   ? (Success: Styling preserved)
   ? (Success: Logo visible)
   
? TEST PASSED!
```

---

## ?? Success Criteria

Your implementation is successful if:

1. ? PDF downloads when student clicks download
2. ? PDF contains student's name and hall ticket number
3. ? PDF shows correct exam series name
4. ? PDF displays exams for student's branch only
5. ? PDF preserves HTML template styling
6. ? PDF has proper date/time formatting
7. ? PDF includes signature section
8. ? PDF includes all 5 instructions
9. ? Empty exam slots show "-"
10. ? Logo appears (if file exists)

**All criteria met = Implementation Complete!** ??

---

## ?? Quick Fixes

| Issue | Solution |
|-------|----------|
| PDF not downloading | Check browser console for errors |
| Wrong exam schedule | Verify Branch field in Exam table matches Department |
| Missing student name | Check User.FullName is populated |
| Template not found | Ensure hallticket.html in hallticket-html folder |
| Browser not downloading | Check internet connection, firewall |
| Empty exam rows | Verify exams created for correct branch |

---

## ?? You're Ready!

Everything is configured and ready for production use. Test it out and enjoy your automated hall ticket generation system! ??
