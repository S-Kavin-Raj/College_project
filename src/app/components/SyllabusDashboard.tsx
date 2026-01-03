import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { SyllabusSummaryCards } from './SyllabusSummaryCards';
import { SyllabusFilters } from './SyllabusFilters';
import { SubjectList } from './SubjectList';
import { SyllabusDetailPanel } from './SyllabusDetailPanel';

import { SyllabusFooter } from './SyllabusFooter';
import type { UserRole } from '../App';

export type SyllabusStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface Subject {
  id: string;
  code: string;
  name: string;
  assignedStaff: string;
  totalUnits: number;
  completedUnits: number;
  status: SyllabusStatus;
  year: string;
  semester: string;
  units: Unit[];
}

export interface Unit {
  unitNumber: number;
  name: string;
  completed: boolean;
  completionDate?: string;
  remarks?: string;
}

interface SyllabusDashboardProps {
  userRole: UserRole;
  userDept: string;
  userYear: string;
  onBack: () => void;
  onSwitchToSyllabus: () => void;
}

const getYearShort = (fullYear: string) => {
  switch (fullYear) {
    case "1st Year": return "1st";
    case "2nd Year": return "2nd";
    case "3rd Year": return "3rd";
    case "4th Year": return "4th";
    default: return "3rd";
  }
}

export function SyllabusDashboard({ userRole, userDept, userYear, onBack, onSwitchToSyllabus }: SyllabusDashboardProps) {
  const [selectedDepartment, setSelectedDepartment] = useState(userDept);
  const [selectedYear, setSelectedYear] = useState(getYearShort(userYear));

  // Sync state with props when they change
  React.useEffect(() => {
    if (userRole !== 'Admin') {
      setSelectedDepartment(userDept);
      setSelectedYear(getYearShort(userYear));
    }
  }, [userDept, userYear, userRole]);
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('odd');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH SYLLABUS FROM DB
  React.useEffect(() => {
    const fetchSyllabus = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('dam_token');
        const cRes = await fetch('/classes', { headers: { 'Authorization': token || '' } });
        const classes = cRes.ok ? await cRes.json() : [];
        const targetClass = classes.find((c: any) => c.year === `${selectedYear}${selectedYear === '1st' ? '' : ' Year'}`); // Helper for year mismatch

        // Better year matching
        const yearMap: any = { '1st': '1st Year', '2nd': '2nd Year', '3rd': '3rd Year', '4th': '4th Year' };
        const match = classes.find((c: any) => c.year === (yearMap[selectedYear] || selectedYear));

        if (match) {
          const sRes = await fetch(`/syllabus?class_id=${match.id}`, {
            headers: { 'Authorization': token || '' }
          });
          if (sRes.ok) {
            const data = await sRes.json();
            // Group flat units into Subjects
            const grouped: any = {};
            data.forEach((row: any) => {
              if (!grouped[row.subject_id]) {
                grouped[row.subject_id] = {
                  id: String(row.subject_id),
                  code: `CS${row.subject_id}`,
                  name: row.name,
                  assignedStaff: 'Assigned Staff',
                  totalUnits: 0,
                  completedUnits: 0,
                  status: 'Not Started',
                  year: selectedYear,
                  semester: selectedSemester,
                  units: []
                };
              }
              if (row.unit_id) {
                grouped[row.subject_id].units.push({
                  id: row.unit_id,
                  unitNumber: row.unit_no,
                  name: row.unit_title,
                  completed: row.status === 'COMPLETED'
                });
                grouped[row.subject_id].totalUnits++;
                if (row.status === 'COMPLETED') grouped[row.subject_id].completedUnits++;
              }
            });

            const list = Object.values(grouped).map((s: any) => ({
              ...s,
              status: s.completedUnits === 0 ? 'Not Started' : (s.completedUnits === s.totalUnits ? 'Completed' : 'In Progress')
            }));
            setSubjects(list as Subject[]);
          }
        } else {
          setSubjects([]);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchSyllabus();
  }, [selectedDepartment, selectedYear, selectedSemester]);

  // Filter subjects based on role
  const getFilteredSubjects = () => {
    let filtered = subjects;

    // Strict Department Isolation
    // Fallback to userDept/BE CSE if data is missing department field
    filtered = filtered.filter((s: any) =>
      (s.department || 'BE CSE') === (userRole === 'Admin' ? selectedDepartment : userDept)
    );

    // Role-based filtering
    if (userRole === 'Staff') {
      // Staff sees only their assigned subjects
      filtered = filtered.filter(s => s.assignedStaff === 'Dr. Rajesh Kumar');
    }

    // Filter by year
    const targetYear = userRole === 'Admin' ? selectedYear : getYearShort(userYear);
    if (targetYear !== 'all') {
      filtered = filtered.filter(s => s.year === targetYear);
    }

    // Filter by semester
    filtered = filtered.filter(s => s.semester === selectedSemester);

    return filtered;
  };

  const filteredSubjects = getFilteredSubjects();

  // Calculate summary stats
  const totalSubjects = filteredSubjects.length;
  const completedSubjects = filteredSubjects.filter(s => s.status === 'Completed').length;
  const inProgressSubjects = filteredSubjects.filter(s => s.status === 'In Progress').length;
  const pendingSubjects = filteredSubjects.filter(s => s.status === 'Not Started').length;

  const handleViewSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowDetailPanel(true);
  };

  const handleClosePanel = () => {
    setShowDetailPanel(false);
    setSelectedSubject(null);
  };

  const handleUpdateUnit = (subjectId: string, unitNumber: number, completed: boolean, remarks?: string) => {
    setSubjects(prevSubjects =>
      prevSubjects.map(subject => {
        if (subject.id === subjectId) {
          const updatedUnits = subject.units.map(unit =>
            unit.unitNumber === unitNumber
              ? {
                ...unit,
                completed,
                completionDate: completed ? new Date().toISOString().split('T')[0] : undefined,
                remarks,
              }
              : unit
          );

          const completedCount = updatedUnits.filter(u => u.completed).length;
          const newStatus: SyllabusStatus =
            completedCount === 0
              ? 'Not Started'
              : completedCount === subject.totalUnits
                ? 'Completed'
                : 'In Progress';

          return {
            ...subject,
            units: updatedUnits,
            completedUnits: completedCount,
            status: newStatus,
          };
        }
        return subject;
      })
    );

    // Update selected subject if it's currently open
    if (selectedSubject && selectedSubject.id === subjectId) {
      const updatedSubject = subjects.find(s => s.id === subjectId);
      if (updatedSubject) {
        setSelectedSubject({
          ...updatedSubject,
          units: updatedSubject.units.map(unit =>
            unit.unitNumber === unitNumber
              ? {
                ...unit,
                completed,
                completionDate: completed ? new Date().toISOString().split('T')[0] : undefined,
                remarks,
              }
              : unit
          ),
        });
      }
    }
  };

  const handleAddSyllabus = () => {
    alert('Add Syllabus functionality - Form to add new subject syllabus');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="p-2 bg-blue-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-gray-900 hidden sm:block">Syllabus Management</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-gray-900 mb-2">Syllabus Management Dashboard</h1>
              <p className="text-gray-600">Track syllabus coverage and progress</p>
            </div>

            {(userRole === 'Staff' || userRole === 'Advisor') && (
              <Button
                onClick={handleAddSyllabus}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Syllabus
              </Button>
            )}
          </div>

          <SyllabusFilters
            selectedDepartment={selectedDepartment}
            selectedYear={selectedYear}
            selectedSection={selectedSection}
            selectedSemester={selectedSemester}
            onDepartmentChange={setSelectedDepartment}
            onYearChange={setSelectedYear}
            onSectionChange={setSelectedSection}
            onSemesterChange={setSelectedSemester}
          />
        </div>

        <SyllabusSummaryCards
          totalSubjects={totalSubjects}
          completedSubjects={completedSubjects}
          inProgressSubjects={inProgressSubjects}
          pendingSubjects={pendingSubjects}
        />



        <SubjectList
          subjects={filteredSubjects}
          userRole={userRole}
          onViewSubject={handleViewSubject}
        />

        <SyllabusFooter />
      </div>

      {/* Detail Panel */}
      {showDetailPanel && selectedSubject && (
        <SyllabusDetailPanel
          subject={selectedSubject}
          userRole={userRole}
          onClose={handleClosePanel}
          onUpdateUnit={handleUpdateUnit}
        />
      )}
    </div>
  );
}
