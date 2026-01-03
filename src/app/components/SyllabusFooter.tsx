import React from 'react';
import { Shield } from 'lucide-react';

export function SyllabusFooter() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
      <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-blue-900">
        <p>
          <strong>Important:</strong> Syllabus progress is updated by subject staff and monitored by class advisors.
          All updates are logged for academic tracking.
        </p>
      </div>
    </div>
  );
}
