import React from 'react';
import { Card } from './ui/card';
import type { ClassData } from '../App';

interface TodayAttendanceStatusProps {
  classes: ClassData[];
}

export function TodayAttendanceStatus({ classes }: TodayAttendanceStatusProps) {
  const totalClasses = classes.length;
  const approved = classes.filter(c => c.status === 'Approved').length;
  const pending = classes.filter(c => c.status === 'Pending').length;
  const locked = classes.filter(c => c.status === 'Locked').length;
  const notMarked = totalClasses - (approved + pending + locked);

  const approvedPercent = totalClasses > 0 ? (approved / totalClasses) * 100 : 0;
  const pendingPercent = totalClasses > 0 ? (pending / totalClasses) * 100 : 0;
  const lockedPercent = totalClasses > 0 ? (locked / totalClasses) * 100 : 0;
  const notMarkedPercent = totalClasses > 0 ? (notMarked / totalClasses) * 100 : 0;

  return (
    <Card className="p-6 mb-8">
      <div className="mb-4">
        <h2 className="text-gray-900 mb-2">Today's Attendance Status</h2>
        <p className="text-sm text-gray-600">
          Attendance can be entered only for the current day
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-8 flex rounded-lg overflow-hidden bg-gray-200">
          {approvedPercent > 0 && (
            <div 
              className="bg-green-500 flex items-center justify-center text-white text-xs px-2"
              style={{ width: `${approvedPercent}%` }}
            >
              {approvedPercent >= 10 && `${Math.round(approvedPercent)}%`}
            </div>
          )}
          {pendingPercent > 0 && (
            <div 
              className="bg-yellow-500 flex items-center justify-center text-white text-xs px-2"
              style={{ width: `${pendingPercent}%` }}
            >
              {pendingPercent >= 10 && `${Math.round(pendingPercent)}%`}
            </div>
          )}
          {lockedPercent > 0 && (
            <div 
              className="bg-gray-500 flex items-center justify-center text-white text-xs px-2"
              style={{ width: `${lockedPercent}%` }}
            >
              {lockedPercent >= 10 && `${Math.round(lockedPercent)}%`}
            </div>
          )}
          {notMarkedPercent > 0 && (
            <div 
              className="bg-red-500 flex items-center justify-center text-white text-xs px-2"
              style={{ width: `${notMarkedPercent}%` }}
            >
              {notMarkedPercent >= 10 && `${Math.round(notMarkedPercent)}%`}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <div>
            <p className="text-sm text-gray-900">{approved} Approved</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <div>
            <p className="text-sm text-gray-900">{pending} Pending</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <div>
            <p className="text-sm text-gray-900">{locked} Locked</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <div>
            <p className="text-sm text-gray-900">{notMarked} Not Marked</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
