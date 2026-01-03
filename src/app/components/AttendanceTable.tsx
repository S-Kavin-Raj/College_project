import React from 'react';
import { Card } from './ui/card';

type AttendanceStatus = 'Present' | 'Absent';

interface Student {
  rollNo: string;
  name: string;
  fn: AttendanceStatus;
  an: AttendanceStatus;
  dayResult?: string;
}

interface AttendanceTableProps {
  students: Student[];
  onAttendanceChange: (rollNo: string, period: 'fn' | 'an', value: AttendanceStatus) => void;
  isLocked: boolean;
  lockedPeriods?: { fn?: boolean; an?: boolean };
}

const getDayStatusColor = (status: string) => {
  if (status === 'FULL_DAY') return 'text-green-700 bg-green-50 border-green-200';
  if (status === 'HALF_DAY') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
  if (status === 'ABSENT') return 'text-red-700 bg-red-50 border-red-200';
  return 'text-gray-700 bg-gray-50 border-gray-200';
};

export function AttendanceTable({ students, onAttendanceChange, isLocked, lockedPeriods }: AttendanceTableProps) {
  const getAttendanceButtonClass = (status: AttendanceStatus, isActive: boolean) => {
    if (isActive) {
      return status === 'Present'
        ? 'bg-green-600 text-white border-green-600'
        : 'bg-red-600 text-white border-red-600';
    }
    return 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-gray-900 mb-4">Student Attendance</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="py-3 px-4 text-gray-700">Roll No</th>
              <th className="py-3 px-4 text-gray-700">Student Name</th>
              <th className="text-center py-3 px-4 text-gray-700">FN Status</th>
              <th className="text-center py-3 px-4 text-gray-700">AN Status</th>
              <th className="text-center py-3 px-4 text-gray-700">Result (DB)</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.rollNo} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">{student.rollNo}</td>
                <td className="py-4 px-4 font-medium">{student.name}</td>
                <td className="py-4 px-4 text-center">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => onAttendanceChange(student.rollNo, 'fn', 'Present')}
                      disabled={isLocked || !!lockedPeriods?.fn}
                      className={`px-3 py-1 text-sm rounded border ${getAttendanceButtonClass('Present', student.fn === 'Present')}`}
                    >P</button>
                    <button
                      onClick={() => onAttendanceChange(student.rollNo, 'fn', 'Absent')}
                      disabled={isLocked || !!lockedPeriods?.fn}
                      className={`px-3 py-1 text-sm rounded border ${getAttendanceButtonClass('Absent', student.fn === 'Absent')}`}
                    >A</button>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="inline-flex gap-2">
                    <button
                      onClick={() => onAttendanceChange(student.rollNo, 'an', 'Present')}
                      disabled={isLocked || !!lockedPeriods?.an}
                      className={`px-3 py-1 text-sm rounded border ${getAttendanceButtonClass('Present', student.an === 'Present')}`}
                    >P</button>
                    <button
                      onClick={() => onAttendanceChange(student.rollNo, 'an', 'Absent')}
                      disabled={isLocked || !!lockedPeriods?.an}
                      className={`px-3 py-1 text-sm rounded border ${getAttendanceButtonClass('Absent', student.an === 'Absent')}`}
                    >A</button>
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-2 py-1 text-xs font-bold rounded border uppercase ${getDayStatusColor(student.dayResult || '')}`}>
                    {student.dayResult?.replace('_', ' ') || "NO DATA"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}