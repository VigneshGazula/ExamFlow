namespace ExamFlowWebApi.Models
{
    public static class BranchSubjects
    {
        public static readonly Dictionary<string, List<string>> Subjects = new()
        {
            { "CSE", new List<string> { "Mathematics", "Physics", "Operating Systems", "Database Management Systems", "Data Structures", "Computer Networks" } },
            { "ECE", new List<string> { "Circuits", "Signals and Systems", "Networks", "Electronic Devices", "Communication Systems" } },
            { "IT", new List<string> { "Mathematics", "Web Technologies", "Software Engineering", "Database Systems", "Cloud Computing" } },
            { "EEE", new List<string> { "Electrical Circuits", "Power Systems", "Control Systems", "Electric Machines", "Power Electronics" } },
            { "MECH", new List<string> { "Thermodynamics", "Fluid Mechanics", "Machine Design", "Manufacturing Processes", "Heat Transfer" } },
            { "CIVIL", new List<string> { "Structural Analysis", "Concrete Technology", "Surveying", "Geotechnical Engineering", "Transportation Engineering" } },
            { "CHEM", new List<string> { "Chemical Process Principles", "Unit Operations", "Process Control", "Chemical Reaction Engineering", "Thermodynamics" } }
        };

        public static readonly List<string> AllBranches = new()
        {
            "CSE", "ECE", "IT", "EEE", "MECH", "CIVIL", "CHEM"
        };

        // Map full department names to branch codes
        public static readonly Dictionary<string, string> DepartmentToBranch = new()
        {
            { "Computer Science", "CSE" },
            { "Information Technology", "IT" },
            { "Electronics and Communication", "ECE" },
            { "Electrical Engineering", "EEE" },
            { "Mechanical Engineering", "MECH" },
            { "Civil Engineering", "CIVIL" },
            { "Chemical Engineering", "CHEM" }
        };

        public static List<string> GetSubjects(string branch)
        {
            return Subjects.ContainsKey(branch) ? Subjects[branch] : new List<string>();
        }

        public static bool IsValidBranch(string branch)
        {
            return AllBranches.Contains(branch);
        }

        public static string GetBranchCode(string departmentName)
        {
            return DepartmentToBranch.ContainsKey(departmentName) 
                ? DepartmentToBranch[departmentName] 
                : departmentName;
        }
    }
}
