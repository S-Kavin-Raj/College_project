import { Plus, ListFilter } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { departments, subjects } from "../data/mockData";
import type { UserRole } from "../types";
import { can } from "../utils/permissions";

interface DashboardHeaderProps {
  currentRole: UserRole;
  filters: {
    department: string;
    year: number;
    section: string;
    semester: number;
    subject: string;
  };
  onFiltersChange: (filters: any) => void;
  onCreateAssignment: () => void;
}

export function AssignmentDashboardHeader({
  currentRole,
  filters,
  onFiltersChange,
  onCreateAssignment,
}: DashboardHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Assignment Management Dashboard</h2>
          <p className="text-gray-600 mt-1">Create, track, and evaluate assignments</p>
        </div>

        {can(currentRole, "assignments", "create") && (
          <Button onClick={onCreateAssignment} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Assignment
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <ListFilter className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Department</label>
          <Select
            value={filters.department}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, department: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Year</label>
          <Select
            value={filters.year?.toString() || ""}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, year: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1st Year</SelectItem>
              <SelectItem value="2">2nd Year</SelectItem>
              <SelectItem value="3">3rd Year</SelectItem>
              <SelectItem value="4">4th Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Section</label>
          <Select
            value={filters.section}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, section: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A">Section A</SelectItem>
              <SelectItem value="B">Section B</SelectItem>
              <SelectItem value="C">Section C</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Semester</label>
          <Select
            value={filters.semester?.toString() || ""}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, semester: parseInt(value) })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Semester 1</SelectItem>
              <SelectItem value="2">Semester 2</SelectItem>
              <SelectItem value="3">Semester 3</SelectItem>
              <SelectItem value="4">Semester 4</SelectItem>
              <SelectItem value="5">Semester 5</SelectItem>
              <SelectItem value="6">Semester 6</SelectItem>
              <SelectItem value="7">Semester 7</SelectItem>
              <SelectItem value="8">Semester 8</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-gray-600 mb-1 block">Subject</label>
          <Select
            value={filters.subject}
            onValueChange={(value) =>
              onFiltersChange({ ...filters, subject: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}