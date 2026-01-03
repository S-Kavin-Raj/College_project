import React from 'react';
import { GraduationCap, User, LogOut, BookOpen } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { UserRole } from '../App';

interface DashboardNavProps {
  userName: string;
  userRole: UserRole;
  onLogout: () => void;
  onSwitchToSyllabus?: () => void;
  onSwitchToAssignments?: () => void;
}

export function DashboardNav({ userName, userRole, onLogout, onSwitchToSyllabus, onSwitchToAssignments }: DashboardNavProps) {
  const roleColors = {
    Advisor: 'bg-purple-100 text-purple-800 border-purple-300',
    Staff: 'bg-blue-100 text-blue-800 border-blue-300',
    CR: 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* App Name */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-gray-900 hidden sm:block">Department Academic System</h1>
            <h1 className="text-gray-900 sm:hidden">DAS</h1>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            {onSwitchToSyllabus && (
              <Button
                onClick={onSwitchToSyllabus}
                variant="outline"
                className="hidden md:flex items-center gap-2 px-4 py-2"
              >
                <BookOpen className="w-4 h-4" />
                Syllabus
              </Button>
            )}

            {onSwitchToAssignments && (
              <Button
                onClick={onSwitchToAssignments}
                variant="outline"
                className="hidden md:flex items-center gap-2 px-4 py-2 ml-2"
              >
                <BookOpen className="w-4 h-4" />
                Assignments
              </Button>
            )}

            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-900">{userName}</span>
            </div>

            <Badge className={`${roleColors[userRole]} border px-3 py-1`}>
              {userRole}
            </Badge>

            <button
              onClick={onLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}