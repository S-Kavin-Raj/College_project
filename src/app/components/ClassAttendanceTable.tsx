import React from 'react';
import { Eye, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { ClassData, UserRole } from '../App';

interface ClassAttendanceTableProps {
  classes: ClassData[];
  userRole: UserRole;
  onViewAttendance: (classId: string) => void;
}

export function ClassAttendanceTable({ classes, userRole, onViewAttendance }: ClassAttendanceTableProps) {
  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Approved: 'bg-green-100 text-green-800 border-green-300',
    Locked: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const pendingClasses = classes.filter(c => c.status === 'Pending');

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-gray-900 mb-1">Class Attendance Overview</h2>
          <p className="text-sm text-gray-600">View and manage attendance for all classes</p>
        </div>

        {userRole === 'Advisor' && pendingClasses.length > 0 && (
          <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mt-4 md:mt-0">
            <CheckCircle className="w-4 h-4" />
            Approve All Pending ({pendingClasses.length})
          </Button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-700">Class</th>
              <th className="text-center py-3 px-4 text-gray-700">Total Students</th>
              <th className="text-center py-3 px-4 text-gray-700">Present</th>
              <th className="text-center py-3 px-4 text-gray-700">Absent</th>
              <th className="text-left py-3 px-4 text-gray-700">Marked By</th>
              <th className="text-center py-3 px-4 text-gray-700">Status</th>
              <th className="text-center py-3 px-4 text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classData) => (
              <tr key={classData.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="text-gray-900">{classData.department}</p>
                    <p className="text-sm text-gray-600">
                      {classData.year} Year - Section {classData.section}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-4 text-center text-gray-900">
                  {classData.totalStudents}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-green-700">{classData.present}</span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-red-700">{classData.absent}</span>
                </td>
                <td className="py-4 px-4 text-gray-900">{classData.markedBy}</td>
                <td className="py-4 px-4">
                  <div className="flex justify-center">
                    <Badge className={`${statusColors[classData.status]} border px-3 py-1`}>
                      {classData.status}
                    </Badge>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-center">
                    <Button
                      onClick={() => onViewAttendance(classData.id)}
                      variant="outline"
                      className="px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {classes.map((classData) => (
          <Card key={classData.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-900 mb-1">{classData.department}</p>
                <p className="text-sm text-gray-600">
                  {classData.year} Year - Section {classData.section}
                </p>
              </div>
              <Badge className={`${statusColors[classData.status]} border px-3 py-1`}>
                {classData.status}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-gray-900">{classData.totalStudents}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-green-700">{classData.present}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-red-700">{classData.absent}</p>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600">Marked by</p>
              <p className="text-gray-900">{classData.markedBy}</p>
            </div>

            <Button
              onClick={() => onViewAttendance(classData.id)}
              variant="outline"
              className="w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Attendance
            </Button>
          </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No classes found</p>
        </div>
      )}
    </div>
  );
}
