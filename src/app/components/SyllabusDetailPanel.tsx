import React, { useState } from 'react';
import { X, CheckCircle, Circle, Lock, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Subject } from './SyllabusDashboard';
import type { UserRole } from '../App';

interface SyllabusDetailPanelProps {
  subject: Subject;
  userRole: UserRole;
  onClose: () => void;
  onUpdateUnit: (subjectId: string, unitNumber: number, completed: boolean, remarks?: string) => void;
}

export function SyllabusDetailPanel({ subject, userRole, onClose, onUpdateUnit }: SyllabusDetailPanelProps) {
  const [isLocked, setIsLocked] = useState(subject.status === 'Completed' && userRole === 'Advisor');
  const [editingUnit, setEditingUnit] = useState<number | null>(null);
  const [tempRemarks, setTempRemarks] = useState('');

  const handleToggleUnit = (unitNumber: number, currentStatus: boolean) => {
    if (userRole === 'CR' || isLocked) return; // CR and locked syllabus can't edit
    
    onUpdateUnit(subject.id, unitNumber, !currentStatus);
    setEditingUnit(null);
  };

  const handleSaveRemarks = (unitNumber: number, completed: boolean) => {
    onUpdateUnit(subject.id, unitNumber, completed, tempRemarks);
    setEditingUnit(null);
    setTempRemarks('');
  };

  const handleLockSyllabus = () => {
    if (subject.completedUnits === subject.totalUnits) {
      setIsLocked(true);
      alert('Syllabus has been locked. No further changes allowed.');
    } else {
      alert('Cannot lock syllabus. All units must be completed first.');
    }
  };

  const progressPercentage = subject.totalUnits > 0 
    ? Math.round((subject.completedUnits / subject.totalUnits) * 100) 
    : 0;

  const statusColors = {
    'Not Started': 'bg-gray-100 text-gray-800 border-gray-300',
    'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Completed': 'bg-green-100 text-green-800 border-green-300',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-gray-900">{subject.code}</h2>
              <Badge className={`${statusColors[subject.status]} border px-3 py-1`}>
                {subject.status}
              </Badge>
              {isLocked && (
                <Badge className="bg-red-100 text-red-800 border-red-300 border px-3 py-1 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Locked
                </Badge>
              )}
            </div>
            <p className="text-gray-900 mb-2">{subject.name}</p>
            <p className="text-sm text-gray-600">Assigned to: {subject.assignedStaff}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Progress Overview */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">Overall Progress</span>
            <span className="text-gray-900">{subject.completedUnits} / {subject.totalUnits} Units</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercentage === 100 ? 'bg-green-500' : 
                progressPercentage >= 50 ? 'bg-yellow-500' : 
                progressPercentage > 0 ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{progressPercentage}% Complete</p>
        </div>

        {/* Units List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-gray-900 mb-4">Unit-wise Progress</h3>
          <div className="space-y-3">
            {subject.units.map((unit) => (
              <div
                key={unit.unitNumber}
                className={`border rounded-lg p-4 transition-all ${
                  unit.completed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleUnit(unit.unitNumber, unit.completed)}
                    disabled={userRole === 'CR' || isLocked}
                    className={`mt-1 flex-shrink-0 ${
                      userRole === 'CR' || isLocked 
                        ? 'cursor-not-allowed opacity-50' 
                        : 'cursor-pointer hover:opacity-80'
                    }`}
                  >
                    {unit.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-gray-900">Unit {unit.unitNumber}</p>
                        <p className="text-sm text-gray-700">{unit.name}</p>
                      </div>
                      {unit.completed && unit.completionDate && (
                        <span className="text-xs text-gray-600">
                          {new Date(unit.completionDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>

                    {/* Remarks Section */}
                    {(userRole === 'Staff' || userRole === 'Advisor') && !isLocked && (
                      <div className="mt-2">
                        {editingUnit === unit.unitNumber ? (
                          <div className="space-y-2">
                            <textarea
                              value={tempRemarks}
                              onChange={(e) => setTempRemarks(e.target.value)}
                              placeholder="Add remarks or notes..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSaveRemarks(unit.unitNumber, unit.completed)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                              >
                                <Save className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button
                                onClick={() => {
                                  setEditingUnit(null);
                                  setTempRemarks('');
                                }}
                                variant="outline"
                                className="px-3 py-1 rounded text-sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {unit.remarks && (
                              <p className="text-sm text-gray-600 italic mb-1">
                                Remarks: {unit.remarks}
                              </p>
                            )}
                            {userRole === 'Staff' && (
                              <button
                                onClick={() => {
                                  setEditingUnit(unit.unitNumber);
                                  setTempRemarks(unit.remarks || '');
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700"
                              >
                                {unit.remarks ? 'Edit remarks' : 'Add remarks'}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Display remarks for read-only users */}
                    {(userRole === 'CR' || isLocked) && unit.remarks && (
                      <p className="text-sm text-gray-600 italic mt-2">
                        Remarks: {unit.remarks}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="text-sm text-gray-600">
              {userRole === 'Staff' && !isLocked && (
                <p>Click on units to mark as complete/incomplete</p>
              )}
              {userRole === 'Advisor' && !isLocked && subject.completedUnits === subject.totalUnits && (
                <p className="text-green-700">All units completed - Ready to lock</p>
              )}
              {isLocked && (
                <p className="text-red-700">Syllabus is locked - No changes allowed</p>
              )}
            </div>

            <div className="flex gap-3">
              {userRole === 'Advisor' && !isLocked && (
                <Button
                  onClick={handleLockSyllabus}
                  disabled={subject.completedUnits !== subject.totalUnits}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Lock Syllabus
                </Button>
              )}
              
              <Button
                onClick={onClose}
                variant="outline"
                className="px-6 py-2 rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
