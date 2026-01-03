import React from 'react';
import { Send, CheckCircle, Edit, Lock } from 'lucide-react';
import { Button } from './ui/button';

import { can } from "../utils/permissions";

interface ActionButtonsProps {
  userRole: 'Advisor' | 'Staff' | 'CR' | 'Student' | 'Admin';
  approvalStatus: 'Pending' | 'Approved' | 'Locked';
  onSubmitAttendance: () => void;
  onApproveAttendance: () => void;
  onEditAttendance: () => void;
  onLockAttendance: () => void;
}

export function ActionButtons({
  userRole,
  approvalStatus,
  onSubmitAttendance,
  onApproveAttendance,
  onEditAttendance,
  onLockAttendance,
}: ActionButtonsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-sm text-gray-600">
          {(userRole === 'Staff' || userRole === 'CR') && (
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Attendance will be sent for advisor approval
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {can(userRole, "attendance", "mark_fn") || can(userRole, "attendance", "mark_an") ? (
            <Button
              onClick={onSubmitAttendance}
              disabled={approvalStatus === 'Locked'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Attendance
            </Button>
          ) : null}

          {can(userRole, "attendance", "approve") && (
            <>
              <Button
                onClick={onApproveAttendance}
                disabled={approvalStatus === 'Approved' || approvalStatus === 'Locked'}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve Attendance
              </Button>

              <Button
                onClick={onEditAttendance}
                disabled={approvalStatus === 'Locked'}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Attendance
              </Button>

              {can(userRole, "attendance", "lock") && (
                <Button
                  onClick={onLockAttendance}
                  disabled={approvalStatus === 'Locked'}
                  variant="outline"
                  className="border-gray-600 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Lock Attendance
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}