import React from 'react';
import { AlertCircle, Save } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface AdvisorEditSectionProps {
  editReason: string;
  onEditReasonChange: (value: string) => void;
  onSaveChanges: () => void;
}

export function AdvisorEditSection({ editReason, onEditReasonChange, onSaveChanges }: AdvisorEditSectionProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
        <div>
          <h3 className="text-amber-900 mb-1">Edit Mode Enabled</h3>
          <p className="text-sm text-amber-700">
            Please provide a reason for editing the attendance records.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="editReason" className="block text-sm text-gray-700 mb-2">
            Edit Reason (Required)
          </label>
          <Textarea
            id="editReason"
            value={editReason}
            onChange={(e) => onEditReasonChange(e.target.value)}
            placeholder="Enter the reason for editing attendance..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          />
        </div>

        <Button
          onClick={onSaveChanges}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
