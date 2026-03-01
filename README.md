# 📚 ExamFlow - Advanced Exam Management System

<div align="center">

![ExamFlow Logo](https://via.placeholder.com/150x150?text=ExamFlow)

**A comprehensive, modern exam management system for educational institutions**

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-18-DD0031?logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🌟 Overview

**ExamFlow** is a cutting-edge, full-stack exam management platform designed to streamline the entire examination lifecycle for educational institutions. From scheduling to result management, ExamFlow provides an intuitive, role-based interface for administrators, faculty, and students.

### Why ExamFlow?

- 🎯 **Centralized Management** - Single platform for all exam-related operations
- 🔐 **Role-Based Access** - Secure, customized experiences for Admin, Faculty, and Students
- 📱 **Modern UI/UX** - Beautiful, responsive design with smooth animations
- ⚡ **Real-Time Updates** - Live exam status and countdowns
- 🌐 **Branch-Specific Scheduling** - Flexible scheduling per department/branch
- 📊 **Comprehensive Analytics** - Track exam series, schedules, and statistics

---

## ✨ Features

### 👨‍💼 Admin Features
- **Exam Series Management**
  - Create and manage exam series (Semester, Midterm, Lab exams)
  - Multi-branch support with flexible scheduling
  - Date range configuration
  - Exam type categorization

- **Branch Scheduling**
  - Schedule exams per branch independently
  - Subject-wise scheduling
  - Holiday marking
  - Global time settings
  - Reschedule capabilities

- **Dashboard & Analytics**
  - Overview of all exam series
  - Statistics: Total, Semester, Midterm, Lab exams
  - Branch-wise scheduling status
  - Visual progress indicators

### 👨‍🎓 Student Features
- **My Exams Dashboard**
  - View personalized exam schedules
  - Branch-specific exam display
  - Real-time exam status (Upcoming/Ongoing/Completed)
  - Countdown timers for upcoming exams
  - Beautiful timeline interface

- **Exam Details**
  - Subject information
  - Date, time, and venue details
  - Status tracking
  - Holiday indicators

- **Profile Management**
  - Complete profile setup
  - Department and year information
  - Roll number management

### 👨‍🏫 Faculty Features
- **Script Assignment** (Coming Soon)
- **Evaluation Monitoring** (Coming Soon)
- **Result Management** (Coming Soon)

### 🔐 Security Features
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Authorization** - Granular access control (Admin/Faculty/Student)
- **Branch-Based Access Control** - Students only see their branch data
- **Profile Completion Guard** - Ensures students complete profiles before access
- **Server-Side Validation** - Comprehensive backend validation

---

## 🏗️ Architecture

### Tech Stack

#### Backend
- **Framework**: .NET 10 Web API
- **Database**: Entity Framework Core with SQL Server
- **Authentication**: JWT (JSON Web Tokens)
- **Architecture**: Clean Architecture with Repository Pattern
- **API Documentation**: RESTful API design

#### Frontend
- **Framework**: Angular 18 (Standalone Components)
- **Rendering**: Server-Side Rendering (SSR) with Angular Universal
- **Styling**: Custom CSS with Bootstrap Icons
- **State Management**: RxJS Observables
- **HTTP Client**: Angular HttpClient with interceptors

### Project Structure

```
ExamFlow/
├── Backend/
│   ├── Controllers/           # API Controllers
│   │   ├── AuthController.cs
│   │   ├── ExamsController.cs
│   │   └── StudentProfileController.cs
│   ├── Services/              # Business Logic
│   │   ├── Interfaces/
│   │   └── Implementations/
│   ├── Models/                # Domain Models
│   ├── Entities/              # Database Context
│   ├── DTO/                   # Data Transfer Objects
│   └── Program.cs             # Application Entry Point
│
├── Frontend/
│   └── src/
│       └── app/
│           ├── admin/         # Admin Module
│           │   ├── manage-exams/
│           │   ├── exam-series-form/
│           │   ├── branch-schedule-list/
│           │   └── branch-exam-scheduler/
│           ├── student/       # Student Module
│           │   ├── exams/
│           │   ├── dashboard/
│           │   └── profile/
│           ├── faculty/       # Faculty Module
│           ├── auth/          # Authentication
│           ├── services/      # Shared Services
│           └── guards/        # Route Guards
│
└── Documentation/             # API & User Documentation
```

---

## 🚀 Installation

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [SQL Server](https://www.microsoft.com/sql-server) or SQL Server Express
- [Angular CLI](https://angular.io/cli) - `npm install -g @angular/cli`

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vignesh777777/ExamFlow.git
   cd ExamFlow
   ```

2. **Configure Database Connection**
   
   Update `appsettings.json` with your SQL Server connection string:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=ExamFlowDb;Trusted_Connection=True;TrustServerCertificate=True"
     }
   }
   ```

3. **Run Database Migrations**
   ```bash
   dotnet ef database update
   ```

4. **Run the Backend API**
   ```bash
   dotnet run
   ```
   
   The API will be available at `http://localhost:5275`

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure API Endpoint** (if needed)
   
   Update the API URL in `src/app/services/exam.service.ts`:
   ```typescript
   private apiUrl = 'http://localhost:5275/api/examseries';
   ```

4. **Run the Development Server**
   ```bash
   npm start
   ```
   
   The application will be available at `http://localhost:4200`

### Initial Setup

1. **Create Admin Account**
   
   Use the registration endpoint or seed data to create an admin user:
   ```json
   POST /api/auth/register
   {
     "userId": "admin001",
     "fullName": "Admin User",
     "email": "admin@examflow.com",
     "password": "Admin@123",
     "role": "Admin"
   }
   ```

2. **Login**
   ```json
   POST /api/auth/login
   {
     "userId": "admin001",
     "password": "Admin@123"
   }
   ```

---

## 📖 Usage

### Admin Workflow

1. **Create Exam Series**
   - Navigate to "Manage Exams"
   - Click "Create New Exam Series"
   - Fill in details (Name, Type, Year, Branches, Date Range)
   - Submit

2. **Schedule Exams for Branches**
   - Select an exam series
   - Click "Schedule Exams"
   - Choose a branch
   - Set global exam timings
   - Assign subjects to dates
   - Mark holidays
   - Save schedule

3. **View Summary**
   - Access comprehensive exam series summary
   - View all scheduled exams across branches
   - Monitor scheduling completion status

### Student Workflow

1. **Complete Profile** (First-time users)
   - Enter Roll Number
   - Select Department (Branch)
   - Select Year and Section

2. **View Exams**
   - Navigate to "My Exams"
   - View all exam series for your branch
   - Click on a series to see detailed timeline
   - Check exam dates, times, and status
   - See countdown for upcoming exams

---

## 🎨 UI Highlights

### Modern Design Features
- **Gradient-Based Theme** - Purple to violet gradients (#667eea → #764ba2)
- **Card-Based Layouts** - Elevated cards with soft shadows
- **Timeline Interface** - Visual timeline for exam schedules
- **Status Indicators** - Color-coded badges (Upcoming/Ongoing/Completed)
- **Smooth Animations** - fadeInUp, pulse, and glow effects
- **Responsive Design** - Mobile-first approach
- **Glassmorphism Effects** - Modern backdrop blur on badges

### Components Showcase
- **Manage Exams**: Grid of exam series cards with statistics
- **Exam Scheduler**: Interactive table with subject dropdowns and holiday toggles
- **Student Exams**: Beautiful timeline with status markers
- **Branch Schedule List**: Card-based branch overview with progress indicators

---

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |

### Exam Series Endpoints (Admin)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/examseries` | Create exam series | ✅ Admin |
| GET | `/api/examseries` | Get all exam series | ✅ Admin |
| GET | `/api/examseries/{id}` | Get exam series by ID | ✅ Admin |
| GET | `/api/examseries/{id}/branches` | Get branch statuses | ✅ Admin |
| GET | `/api/examseries/{id}/branches/{branch}/dates` | Get available dates | ✅ Admin |
| POST | `/api/examseries/{id}/branches/{branch}/schedule` | Schedule exams | ✅ Admin |
| GET | `/api/examseries/{id}/summary` | Get exam summary | ✅ Admin |

### Student Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/examseries/student/{branch}` | Get student exam series | ✅ Student |
| GET | `/api/examseries/{id}/student/{branch}/exams` | Get student exams | ✅ Student |

### Public Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/examseries/branches` | Get all branches | ❌ |
| GET | `/api/examseries/branches/{branch}/subjects` | Get branch subjects | ✅ Admin |

---

## 📊 Database Schema

### Core Entities

**ExamSeries**
- Id (Guid)
- Name (string)
- ExamType (enum: Semester, Midterm, InternalLab, ExternalLab)
- Year (int)
- Branches (List<string>)
- StartDate (DateOnly)
- EndDate (DateOnly)
- CreatedBy (string)
- CreatedAt (DateTime)

**Exam**
- Id (Guid)
- ExamSeriesId (Guid)
- Subject (string)
- ExamDate (DateOnly)
- StartTime (TimeOnly)
- EndTime (TimeOnly)
- Branch (string)
- Year (int)
- IsHoliday (bool)

**User**
- Id (int)
- UserId (string)
- FullName (string)
- Email (string)
- PasswordHash (string)
- Role (string: Admin/Faculty/Student)
- IsActive (bool)

**StudentProfile**
- Id (int)
- StudentId (int)
- RollNumber (string)
- Department (string)
- Year (string)
- Section (string)

---

## 🛠️ Development

### Running in Development Mode

**Backend (Hot Reload):**
```bash
dotnet watch run
```

**Frontend (Live Reload):**
```bash
npm start
# or
ng serve --open
```

### Building for Production

**Backend:**
```bash
dotnet publish -c Release -o ./publish
```

**Frontend:**
```bash
npm run build
# Output in: dist/frontend/browser
```

### Running Tests

**Backend:**
```bash
dotnet test
```

**Frontend:**
```bash
npm run test
```

---

## 🎯 Roadmap

### Phase 1 - Exam Management ✅ (Completed)
- [x] User authentication and authorization
- [x] Admin exam series creation
- [x] Branch-wise exam scheduling
- [x] Student exam viewing
- [x] Profile management
- [x] Real-time status updates

### Phase 2 - Enhanced Features 🚧 (In Progress)
- [ ] Hall ticket generation
- [ ] Seating arrangement system
- [ ] Exam notification system
- [ ] Calendar integration
- [ ] PDF export functionality

### Phase 3 - Faculty Features 📋 (Planned)
- [ ] Script assignment workflow
- [ ] Evaluation tracking
- [ ] Result entry interface
- [ ] Analytics dashboard

### Phase 4 - Advanced Features 🔮 (Future)
- [ ] Mobile application (React Native)
- [ ] AI-powered exam scheduling
- [ ] Automated conflict detection
- [ ] Multi-language support
- [ ] Advanced reporting and analytics
- [ ] Integration with LMS platforms

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards
- Follow C# coding conventions for backend
- Use Angular style guide for frontend
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Vignesh** - *Initial work* - [Vignesh777777](https://github.com/Vignesh777777)

---

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Microsoft for .NET and Entity Framework
- Bootstrap Icons for the icon library
- The open-source community for inspiration

---

## 📞 Support

For support, email support@examflow.com or open an issue in the GitHub repository.

---

## 📸 Screenshots

### Admin Dashboard
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

### Exam Scheduler
![Exam Scheduler](docs/screenshots/exam-scheduler.png)

### Student Exams View
![Student Exams](docs/screenshots/student-exams.png)

---

## 🔗 Links

- **Documentation**: [Wiki](https://github.com/Vignesh777777/ExamFlow/wiki)
- **API Reference**: [API Docs](https://github.com/Vignesh777777/ExamFlow/wiki/API-Reference)
- **Bug Reports**: [Issues](https://github.com/Vignesh777777/ExamFlow/issues)
- **Feature Requests**: [Discussions](https://github.com/Vignesh777777/ExamFlow/discussions)

---

<div align="center">

**Made with ❤️ for Educational Institutions**

⭐ Star this repo if you find it helpful!

[Report Bug](https://github.com/Vignesh777777/ExamFlow/issues) • [Request Feature](https://github.com/Vignesh777777/ExamFlow/issues) • [Documentation](https://github.com/Vignesh777777/ExamFlow/wiki)

</div>
