export type UserRole = "Admin" | "Staff" | "Advisor" | "CR" | "Student";

export interface Assignment {
    id: string;
    title: string;
    subject: string;
    description: string;
    deadline: string;
    maxMarks: number;
    createdBy: string;
    createdDate: string;
    year: number;
    section: string;
    semester: number;
    department: string;
}

export interface Submission {
    assignmentId: string;
    rollNo: string;
    studentName: string;
    status: "not-submitted" | "submitted" | "late" | "evaluated";
    submittedDate?: string;
    marksObtained?: number;
    remarks?: string;
}
