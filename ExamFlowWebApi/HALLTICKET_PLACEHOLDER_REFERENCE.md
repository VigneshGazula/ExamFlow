# Hall Ticket HTML Template - Placeholder Reference

## Available Placeholders in `hallticket.html`

### ? Currently Implemented & Auto-Filled:

| Placeholder | Description | Data Source | Example Value |
|------------|-------------|-------------|---------------|
| `{{EXAM_SERIES_NAME}}` | Exam series title | ExamSeries.Name | "III B.TECH. II SEMESTER CIE-1(R22) FEBRUARY 2026" |
| `{{DEPARTMENT}}` | Student's department | StudentProfile.Department | "CSE" |
| `{{HALL_TICKET_NO}}` | Hall ticket number | HallTicket.HallTicketNumber | "HT-2024-00123" |
| `{{STUDENT_NAME}}` | Student's full name | User.FullName | "RAJESH KUMAR" |
| `{{DATE_1}}` to `{{DATE_5}}` | Exam dates | Exam.ExamDate | "15/02/2026" |
| `{{TIME_1}}` to `{{TIME_5}}` | Exam times | Exam.StartTime - EndTime | "09:00 AM - 12:00 PM" |
| `{{CODE_1}}` to `{{CODE_5}}` | Subject codes | Exam.Subject | "CS301" |
| `{{COURSE_1}}` to `{{COURSE_5}}` | Subject names | Exam.Subject | "Data Structures" |

### ?? Placeholder Format in HTML:
```html
<div class="info-value">{{HALL_TICKET_NO}}</div>
<div class="info-value">{{STUDENT_NAME}}</div>

<td>{{DATE_1}}</td>
<td>{{TIME_1}}</td>
<td>{{CODE_1}}</td>
<td>{{COURSE_1}}</td>
```

### ?? How Placeholders Are Filled:

1. **Single Values** (Student Info):
   ```csharp
   htmlContent.Replace("{{HALL_TICKET_NO}}", data.HallTicketNumber);
   htmlContent.Replace("{{STUDENT_NAME}}", data.StudentName);
   htmlContent.Replace("{{DEPARTMENT}}", data.Department);
   ```

2. **Dynamic Rows** (Exam Schedule):
   ```csharp
   for (int i = 0; i < 5; i++)
   {
       if (i < data.ExamSchedule.Count)
       {
           // Fill with exam data
           htmlContent.Replace($"{{DATE_{i+1}}}", exam.ExamDate);
       }
       else
       {
           // Fill empty rows with "-"
           htmlContent.Replace($"{{DATE_{i+1}}}", "-");
       }
   }
   ```

## ?? Styling Notes

All CSS styling from your template is preserved:
- ? Gray hall ticket header background
- ? Black borders and table styling
- ? White backgrounds
- ? Font sizes and weights
- ? Signature section layout
- ? Instructions formatting

## ??? Logo Support

To include your institute logo:
1. Place logo image as `mlrit_logo.png` in `hallticket-html` folder
2. The template will automatically include it
3. If logo is missing, template still works (shows alt text)

## ?? Adding More Placeholders

If you want to add more placeholders:

1. **Add to HTML template**:
   ```html
   <div>{{NEW_FIELD}}</div>
   ```

2. **Update `ReplacePlaceholders()` method**:
   ```csharp
   htmlContent = htmlContent.Replace("{{NEW_FIELD}}", data.NewFieldValue);
   ```

3. **Ensure data is available in `HallTicketDownloadDTO`**

## ?? Example Filled HTML:

**Before (Template)**:
```html
<div class="exam-title">{{EXAM_SERIES_NAME}}</div>
<div class="hallticket-header">{{DEPARTMENT}} HALLTICKET</div>
<div class="info-value">{{HALL_TICKET_NO}}</div>
<div class="info-value">{{STUDENT_NAME}}</div>
```

**After (Filled)**:
```html
<div class="exam-title">III B.TECH. II SEMESTER CIE-1(R22)</div>
<div class="hallticket-header">CSE HALLTICKET</div>
<div class="info-value">HT-2024-00123</div>
<div class="info-value">RAJESH KUMAR</div>
```

## ?? How Students Receive PDFs

1. **Admin Portal** ? Release Hall Tickets ? Select students ? Click Release
2. **Student Portal** ? Hall Ticket ? View available exam series ? Click Download
3. **System Generates** ? Reads template ? Fills placeholders ? Converts to PDF
4. **Browser Downloads** ? `HallTicket_ROLLNO_HTNO.pdf`

## ?? System Requirements

- .NET 10
- PuppeteerSharp (installed)
- ~120MB disk space for Chromium browser (auto-downloaded on first use)
- Internet connection (first run only, for browser download)

## ?? Ready to Use!

Your hall ticket system is fully configured and ready to generate personalized PDFs using your HTML template!
