import React from 'react';
import { AlertCircle, CheckCircle, Clock, Calendar } from 'lucide-react';
import type { UserRole } from '../App';

interface SyllabusAlertsProps {
  pendingSubjects: number;
  inProgressSubjects: number;
  completedSubjects: number;
  userRole: UserRole;
}

export function SyllabusAlerts({ pendingSubjects, inProgressSubjects, completedSubjects, userRole }: SyllabusAlertsProps) {
  const alerts = [];

  // Pending subjects alert
  if (pendingSubjects > 0) {
    alerts.push({
      type: 'warning',
      icon: AlertCircle,
      title: 'Syllabus Pending',
      message: `${pendingSubjects} ${pendingSubjects === 1 ? 'subject has' : 'subjects have'} not started yet`,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
    });
  }

  // In progress alert
  if (inProgressSubjects > 0) {
    alerts.push({
      type: 'info',
      icon: Clock,
      title: 'Syllabus In Progress',
      message: `${inProgressSubjects} ${inProgressSubjects === 1 ? 'subject is' : 'subjects are'} currently being taught`,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
    });
  }

  // Completed subjects
  if (completedSubjects > 0) {
    alerts.push({
      type: 'success',
      icon: CheckCircle,
      title: 'Syllabus Completed',
      message: `${completedSubjects} ${completedSubjects === 1 ? 'subject has' : 'subjects have'} been fully covered`,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
    });
  }

  // Semester end warning (example - could be based on actual dates)
  const today = new Date();
  const semesterEndDate = new Date(today.getFullYear(), today.getMonth() + 2, 0); // 2 months from now
  const daysRemaining = Math.ceil((semesterEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysRemaining < 60 && (pendingSubjects > 0 || inProgressSubjects > 0)) {
    alerts.push({
      type: 'urgent',
      icon: Calendar,
      title: 'Semester End Approaching',
      message: `${daysRemaining} days remaining - Please update pending units`,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      iconColor: 'text-orange-600',
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
