import React from 'react';
import { Eye } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { Subject } from './SyllabusDashboard';
import type { UserRole } from '../App';

interface SubjectListProps {
  subjects: Subject[];
  userRole: UserRole;
  onViewSubject: (subject: Subject) => void;
}

export function SubjectList({ subjects, userRole, onViewSubject }: SubjectListProps) {
  const statusColors = {
    'Not Started': 'bg-gray-100 text-gray-800 border-gray-300',
    'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Completed': 'bg-green-100 text-green-800 border-green-300',
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-gray-900 mb-1">Subject-wise Syllabus Progress</h2>
        <p className="text-sm text-gray-600">Track completion status for all subjects</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-700">Subject Code</th>
              <th className="text-left py-3 px-4 text-gray-700">Subject Name</th>
              <th className="text-left py-3 px-4 text-gray-700">Assigned Staff</th>
              <th className="text-center py-3 px-4 text-gray-700">Total Units</th>
              <th className="text-center py-3 px-4 text-gray-700">Completed</th>
              <th className="text-left py-3 px-4 text-gray-700 w-48">Progress</th>
              <th className="text-center py-3 px-4 text-gray-700">Status</th>
              <th className="text-center py-3 px-4 text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => {
              const progressPercentage = subject.totalUnits > 0 
                ? Math.round((subject.completedUnits / subject.totalUnits) * 100) 
                : 0;
              
              return (
                <tr key={subject.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900">{subject.code}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-gray-900">{subject.name}</p>
                      <p className="text-sm text-gray-600">{subject.year} Year</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-900">{subject.assignedStaff}</td>
                  <td className="py-4 px-4 text-center text-gray-900">{subject.totalUnits}</td>
                  <td className="py-4 px-4 text-center text-gray-900">{subject.completedUnits}</td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(progressPercentage)} transition-all duration-300`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-700 w-12 text-right">
                          {progressPercentage}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <Badge className={`${statusColors[subject.status]} border px-3 py-1`}>
                        {subject.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <Button
                        onClick={() => onViewSubject(subject)}
                        variant="outline"
                        className="px-4 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        {userRole === 'Staff' ? 'Update' : 'View'}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {subjects.map((subject) => {
          const progressPercentage = subject.totalUnits > 0 
            ? Math.round((subject.completedUnits / subject.totalUnits) * 100) 
            : 0;

          return (
            <Card key={subject.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-gray-900 mb-1">{subject.code}</p>
                  <p className="text-sm text-gray-900">{subject.name}</p>
                  <p className="text-sm text-gray-600">{subject.year} Year</p>
                </div>
                <Badge className={`${statusColors[subject.status]} border px-3 py-1`}>
                  {subject.status}
                </Badge>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">Assigned Staff</p>
                <p className="text-gray-900">{subject.assignedStaff}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-gray-600">Total Units</p>
                  <p className="text-gray-900">{subject.totalUnits}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-gray-900">{subject.completedUnits}</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm text-gray-900 ml-auto">{progressPercentage}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(progressPercentage)} transition-all duration-300`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <Button
                onClick={() => onViewSubject(subject)}
                variant="outline"
                className="w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {userRole === 'Staff' ? 'Update Progress' : 'View Details'}
              </Button>
            </Card>
          );
        })}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No subjects found for the selected filters</p>
        </div>
      )}
    </div>
  );
}
