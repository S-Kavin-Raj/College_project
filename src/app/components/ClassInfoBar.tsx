import React from 'react';
import { GraduationCap, Users, UserCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface ClassInfoBarProps {
  department: string;
  year: string;
  section: string;
  advisors: string[];
  approvalStatus: 'Pending' | 'Approved' | 'Locked';
}

export function ClassInfoBar({ department, year, section, advisors, approvalStatus }: ClassInfoBarProps) {
  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Approved: 'bg-green-100 text-green-800 border-green-300',
    Locked: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <p className="text-gray-900 mt-1">{department}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Year & Section</p>
            <p className="text-gray-900 mt-1">{year} - {section}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <UserCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Class Advisors</p>
            {advisors.map((advisor, index) => (
              <p key={index} className="text-gray-900 mt-1">
                {advisor}
              </p>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div>
            <p className="text-sm text-gray-600 mb-2">Status</p>
            <Badge className={`${statusColors[approvalStatus]} border px-3 py-1`}>
              {approvalStatus}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}