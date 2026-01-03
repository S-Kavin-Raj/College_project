import React from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';

interface AttendanceHeaderProps {
  department: string;
  year: string;
  section: string;
  userRole: 'Advisor' | 'Staff' | 'CR';
  onBack: () => void;
}

export function AttendanceHeader({ department, year, section, userRole, onBack }: AttendanceHeaderProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  const roleColors = {
    Staff: 'bg-blue-100 text-blue-800 border-blue-300',
    Advisor: 'bg-purple-100 text-purple-800 border-purple-300',
    CR: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-gray-900 mb-2">
              Attendance – {department} {year} {section}
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Date: {formattedDate}</span>
            </div>
          </div>
        </div>

        <Badge className={`${roleColors[userRole]} border px-4 py-2 self-start md:self-auto`}>
          {userRole}
        </Badge>
      </div>
    </div>
  );
}