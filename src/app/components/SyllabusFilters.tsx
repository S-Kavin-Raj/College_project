import React from 'react';
import { Filter } from 'lucide-react';

interface SyllabusFiltersProps {
  selectedDepartment: string;
  selectedYear: string;
  selectedSection: string;
  selectedSemester: string;
  onDepartmentChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
}

export function SyllabusFilters({
  selectedDepartment,
  selectedYear,
  selectedSection,
  selectedSemester,
  onDepartmentChange,
  onYearChange,
  onSectionChange,
  onSemesterChange,
}: SyllabusFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      {/* Department */}
      <div className="relative flex-1 min-w-[200px]">
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="w-full appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="cse">Computer Science & Engineering</option>
          <option value="ece">Electronics & Communication</option>
          <option value="mech">Mechanical Engineering</option>
        </select>
        <Filter className="w-4 h-4 text-gray-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Year */}
      <div className="relative">
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="w-full appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="all">All Years</option>
          <option value="1st">1st Year</option>
          <option value="2nd">2nd Year</option>
          <option value="3rd">3rd Year</option>
          <option value="4th">4th Year</option>
        </select>
        <Filter className="w-4 h-4 text-gray-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Section */}
      <div className="relative">
        <select
          value={selectedSection}
          onChange={(e) => onSectionChange(e.target.value)}
          className="w-full appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="all">All Sections</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          <option value="C">Section C</option>
        </select>
        <Filter className="w-4 h-4 text-gray-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Semester */}
      <div className="relative">
        <select
          value={selectedSemester}
          onChange={(e) => onSemesterChange(e.target.value)}
          className="w-full appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="odd">Odd Semester</option>
          <option value="even">Even Semester</option>
        </select>
        <Filter className="w-4 h-4 text-gray-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
