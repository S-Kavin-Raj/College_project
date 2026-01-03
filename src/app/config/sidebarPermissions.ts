import {
  ClipboardCheck,
  FileText,
  BookOpen,
  BarChart,
  Settings,
  GraduationCap,
} from "lucide-react";

export type SidebarRole =
  | "STUDENT"
  | "CR"
  | "STAFF"
  | "ADVISOR"
  | "ADMIN";

export type SidebarItem = {
  id: string;
  label: string;
  icon: any;
  allowedRoles: SidebarRole[];
};

// Single source of truth for sidebar per-role visibility
export const SIDEBAR_MENU: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: GraduationCap,
    allowedRoles: ["STUDENT", "CR", "STAFF", "ADVISOR", "ADMIN"],
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: ClipboardCheck,
    allowedRoles: ["STUDENT", "CR", "STAFF", "ADVISOR", "ADMIN"],
  },
  {
    id: "assignments",
    label: "Assignments",
    icon: FileText,
    allowedRoles: ["STUDENT", "STAFF", "ADVISOR", "ADMIN"],
  },
  {
    id: "syllabus",
    label: "Syllabus",
    icon: BookOpen,
    allowedRoles: ["STUDENT", "STAFF", "ADVISOR", "ADMIN"],
  },
  {
    id: "cr-management",
    label: "CR Management",
    icon: GraduationCap,
    allowedRoles: ["ADVISOR"],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart,
    allowedRoles: ["ADVISOR", "ADMIN"],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    allowedRoles: ["ADMIN"],
  },
];
