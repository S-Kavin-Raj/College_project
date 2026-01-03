import type { Assignment, Submission } from "../App";

export const mockAssignments: Assignment[] = [
  {
    id: "A001",
    title: "Web Development Project - E-commerce Website",
    subject: "Web Technologies",
    description: "Design and develop a fully functional e-commerce website with user authentication, product catalog, shopping cart, and payment integration.",
    deadline: "2025-01-15",
    maxMarks: 100,
    createdBy: "Dr. Rajesh Kumar",
    createdDate: "2024-12-01",
    year: 3,
    section: "A",
    semester: 5,
    department: "BE CSE",
  },
  {
    id: "A002",
    title: "Machine Learning Model - Image Classification",
    subject: "Machine Learning",
    description: "Build an image classification model using CNN to classify images into 10 different categories with at least 85% accuracy.",
    deadline: "2025-01-20",
    maxMarks: 100,
    createdBy: "Prof. Meera Singh",
    createdDate: "2024-12-05",
    year: 3,
    section: "A",
    semester: 5,
    department: "BE CSE",
  },
  {
    id: "A003",
    title: "Database Design - Library Management System",
    subject: "Database Management",
    description: "Design a complete database schema for a library management system with ER diagrams, normalization, and SQL queries.",
    deadline: "2024-12-28",
    maxMarks: 50,
    createdBy: "Dr. Anita Sharma",
    createdDate: "2024-12-10",
    year: 3,
    section: "A",
    semester: 5,
    department: "BE CSE",
  },
  {
    id: "A004",
    title: "Algorithm Analysis - Sorting Comparison",
    subject: "Design and Analysis of Algorithms",
    description: "Implement and analyze time complexity of different sorting algorithms with graphical representation of results.",
    deadline: "2025-01-05",
    maxMarks: 50,
    createdBy: "Dr. Vijay Reddy",
    createdDate: "2024-12-08",
    year: 3,
    section: "A",
    semester: 5,
    department: "BE CSE",
  },
  {
    id: "A005",
    title: "Mobile App Development - Task Manager",
    subject: "Mobile Application Development",
    description: "Create a cross-platform mobile application for task management with offline support and cloud sync.",
    deadline: "2025-01-25",
    maxMarks: 100,
    createdBy: "Prof. Priya Nair",
    createdDate: "2024-12-12",
    year: 3,
    section: "A",
    semester: 5,
    department: "BE CSE",
  },
  {
    id: "A006",
    title: "Cloud Computing - AWS Deployment Project",
    subject: "Cloud Computing",
    description: "Deploy a web application on AWS using EC2, S3, and RDS with proper security configurations.",
    deadline: "2024-12-30",
    maxMarks: 75,
    createdBy: "Dr. Rajesh Kumar",
    createdDate: "2024-12-15",
    year: 3,
    section: "A",
    semester: 5,
    department: "BE CSE",
  },
];

export const mockStudents = [
  { rollNo: "CS21A001", name: "Aarav Sharma" },
  { rollNo: "CS21A002", name: "Aditi Patel" },
  { rollNo: "CS21A003", name: "Arjun Reddy" },
  { rollNo: "CS21A004", name: "Diya Verma" },
  { rollNo: "CS21A005", name: "Ishaan Kumar" },
  { rollNo: "CS21A006", name: "Kavya Singh" },
  { rollNo: "CS21A007", name: "Rohan Mehta" },
  { rollNo: "CS21A008", name: "Sanya Gupta" },
  { rollNo: "CS21A009", name: "Vihaan Nair" },
  { rollNo: "CS21A010", name: "Zara Khan" },
  { rollNo: "CS21A011", name: "Ananya Desai" },
  { rollNo: "CS21A012", name: "Kabir Joshi" },
  { rollNo: "CS21A013", name: "Myra Agarwal" },
  { rollNo: "CS21A014", name: "Nikhil Rao" },
  { rollNo: "CS21A015", name: "Prisha Iyer" },
];

// Generate submissions for assignments
export const generateSubmissions = (assignmentId: string): Submission[] => {
  const today = new Date();
  const assignment = mockAssignments.find((a) => a.id === assignmentId);
  if (!assignment) return [];

  const deadline = new Date(assignment.deadline);

  return mockStudents.map((student, index) => {
    // Randomize submission status
    const rand = Math.random();
    let status: Submission["status"];
    let submittedDate: string | undefined;
    let marksObtained: number | undefined;
    let remarks: string | undefined;

    if (rand < 0.15) {
      // 15% not submitted
      status = "not-submitted";
    } else if (rand < 0.25) {
      // 10% late submission
      status = "late";
      const lateDate = new Date(deadline);
      lateDate.setDate(lateDate.getDate() + Math.floor(Math.random() * 5) + 1);
      submittedDate = lateDate.toISOString().split("T")[0];
    } else if (rand < 0.7) {
      // 45% evaluated
      status = "evaluated";
      const submitDate = new Date(deadline);
      submitDate.setDate(submitDate.getDate() - Math.floor(Math.random() * 7) - 1);
      submittedDate = submitDate.toISOString().split("T")[0];
      marksObtained = Math.floor(Math.random() * 30) + 60; // 60-90 marks

      if (marksObtained >= 80) {
        remarks = "Excellent work! Well structured and complete.";
      } else if (marksObtained >= 70) {
        remarks = "Good effort. Minor improvements needed.";
      } else {
        remarks = "Satisfactory. Focus on code quality and documentation.";
      }
    } else {
      // 30% submitted but not evaluated
      status = "submitted";
      const submitDate = new Date(deadline);
      submitDate.setDate(submitDate.getDate() - Math.floor(Math.random() * 5) - 1);
      submittedDate = submitDate.toISOString().split("T")[0];
    }

    return {
      assignmentId,
      rollNo: student.rollNo,
      studentName: student.name,
      status,
      submittedDate,
      marksObtained,
      remarks,
    };
  });
};

export const departments = [
  "BE CSE",
  "B.Tech AIDS",
  "BE AI-ML",
  "BE EEE",
  "BE ECE",
  "BE CCE"
];

export const subjects = [
  "All Subjects",
  "Web Technologies",
  "Machine Learning",
  "Database Management",
  "Design and Analysis of Algorithms",
  "Mobile Application Development",
  "Cloud Computing",
  "Computer Networks",
  "Operating Systems",
  "Software Engineering",
];
