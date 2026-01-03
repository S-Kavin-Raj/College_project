import React from 'react';
import { Info } from 'lucide-react';

export function FooterInfo() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-blue-900">
        <p>
          <strong>Note:</strong> Attendance can be entered only for the current day. 
          Final approval is handled by class advisors. Once locked, no further changes are allowed.
        </p>
      </div>
    </div>
  );
}
