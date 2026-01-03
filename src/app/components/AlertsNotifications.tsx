import React from 'react';
import { AlertCircle, CheckCircle, Lock, Clock } from 'lucide-react';
import type { ClassData, UserRole } from '../App';

interface AlertsNotificationsProps {
  pendingCount: number;
  userRole: UserRole;
  classes: ClassData[];
}

export function AlertsNotifications({ pendingCount, userRole, classes }: AlertsNotificationsProps) {
  const lockedCount = classes.filter(c => c.status === 'Locked').length;
  const notMarkedCount = classes.length - classes.filter(c => c.status === 'Approved' || c.status === 'Pending' || c.status === 'Locked').length;
  const approvedCount = classes.filter(c => c.status === 'Approved').length;

  const alerts = [];

  // For Advisors
  if (userRole === 'Advisor' && pendingCount > 0) {
    alerts.push({
      type: 'warning',
      icon: Clock,
      title: 'Attendance Pending Approval',
      message: `${pendingCount} ${pendingCount === 1 ? 'class needs' : 'classes need'} your approval`,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
    });
  }

  // For CR
  if (userRole === 'CR' && notMarkedCount > 0) {
    alerts.push({
      type: 'warning',
      icon: AlertCircle,
      title: 'Attendance Not Marked Yet',
      message: `Please mark today's attendance for your class`,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
    });
  }

  // Locked status
  if (lockedCount > 0) {
    alerts.push({
      type: 'info',
      icon: Lock,
      title: 'Attendance Locked',
      message: `${lockedCount} ${lockedCount === 1 ? 'class has' : 'classes have'} been locked by advisor`,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      iconColor: 'text-gray-600',
    });
  }

  // Success message
  if (approvedCount === classes.length && classes.length > 0) {
    alerts.push({
      type: 'success',
      icon: CheckCircle,
      title: 'All Attendance Approved',
      message: `All classes have been approved for today`,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      {alerts.map((alert, index) => {
        const Icon = alert.icon;
        return (
          <div
            key={index}
            className={`${alert.bgColor} border ${alert.borderColor} rounded-lg p-4 flex items-start gap-3`}
          >
            <Icon className={`w-5 h-5 ${alert.iconColor} mt-0.5 flex-shrink-0`} />
            <div className="flex-1">
              <p className="text-gray-900 mb-1">{alert.title}</p>
              <p className="text-sm text-gray-700">{alert.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
