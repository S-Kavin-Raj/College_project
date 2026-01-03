import React, { useState } from 'react';
import { AttendanceHeader } from './AttendanceHeader';
import { ClassInfoBar } from './ClassInfoBar';
import { AttendanceTable } from './AttendanceTable';
import { ActionButtons } from './ActionButtons';
import { AdvisorEditSection } from './AdvisorEditSection';
import { FooterInfo } from './FooterInfo';
import type { ClassData, UserRole, AttendanceStatus as Status } from '../App';

export type AttendanceStatus = 'Present' | 'Absent';
export type DayStatus = 'Full Day' | 'Half Day' | 'Absent';

export interface Student {
  rollNo: string;
  name: string;
  fn: AttendanceStatus;
  an: AttendanceStatus;
}

interface AttendanceClassViewProps {
  classData: ClassData;
  userRole: UserRole;
  onBack: () => void;
}

export function AttendanceClassView({ classData, userRole, onBack }: AttendanceClassViewProps) {
  const [approvalStatus, setApprovalStatus] = useState<Status>(classData.status);
  const [editReason, setEditReason] = useState('');
  const [showEditSection, setShowEditSection] = useState(false);

  /* Updated with real class list */
  const realStudentsList = [
    "Aabitha S", "Abinandhaa A", "Anitha R", "Aravind Krishnan G", "Ashlyn K L",
    "Baladharshini M", "Balamurugan K", "Chandru P", "Deepak M", "Deepankumar R",
    "Deepashtika S", "Dhanvanthini R", "Dharaneshwaran A", "Dharanikumar P", "Dharineesh R K",
    "Divyadharshini T M", "Divyasvarani T S", "Ferdinand J Wesley", "Gobinath S", "Gowshik R B",
    "Gunaseelan G", "Hariharan K", "Harini S", "Hemalatha S", "Jeyaruba P",
    "Karthick S", "Karunagaran S", "Kavin Raj S", "Kirubalini P", "Likhitaa N J",
    "Maathew Caleb J", "Maindhan Kumar I", "Manjula B", "Marushni G O", "Monish J",
    "Nickle Mathew J", "NikhilSuresh S", "Nithish Bharath S", "Padmanathan R", "Pranesh A",
    "Prathiyuja K", "Preethika R", "Preethikasri S", "Priyadharshini V", "Rajesh Kannan S",
    "Rithik V", "Sakthishree S", "Saminathan B", "Sanjai Sri Saran S", "Sanjai S",
    "Sanjaykumar V", "Sanmathi D", "Sarojan K", "Selvarani C", "Selvin S",
    "Shanmuga Prakash K", "Sherwin Samuel S", "Siva Gokul B", "Suryaprakash A", "Tamil Kumaran A",
    "Vishnu Prasath A", "Karthiga S", "Manikandan C", "Manojkumar A", "Rathnavel B",
    "Santhoshkumar CM", "Yeswanthbabu M", "Teja S"
  ];

  const [students, setStudents] = useState<Student[]>(realStudentsList.map((name, idx) => ({
    rollNo: (idx + 1).toString(),
    name: name,
    fn: 'Present',
    an: 'Present'
  })));

  const handleAttendanceChange = (rollNo: string, period: 'fn' | 'an', value: AttendanceStatus) => {
    setStudents(students.map(student =>
      student.rollNo === rollNo
        ? { ...student, [period]: value }
        : student
    ));
  };

  const handleSubmitAttendance = () => {
    alert('Attendance submitted for advisor approval!');
    setApprovalStatus('Pending');
  };

  const handleApproveAttendance = () => {
    alert('Attendance approved successfully!');
    setApprovalStatus('Approved');
  };

  const handleLockAttendance = () => {
    alert('Attendance locked! No further changes allowed.');
    setApprovalStatus('Locked');
  };

  const handleEditAttendance = () => {
    setShowEditSection(!showEditSection);
  };

  const handleSaveChanges = () => {
    if (!editReason.trim()) {
      alert('Please provide an edit reason');
      return;
    }
    alert(`Changes saved with reason: ${editReason}`);
    setEditReason('');
    setShowEditSection(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <AttendanceHeader
          department={classData.department}
          year={classData.year}
          section={classData.section}
          userRole={userRole}
          onBack={onBack}
        />

        <ClassInfoBar
          department={classData.department}
          year={classData.year}
          section={classData.section}
          advisors={['Dr. Rajesh Kumar', 'Prof. Sunita Mehta']}
          approvalStatus={approvalStatus}
        />

        <AttendanceTable
          students={students}
          onAttendanceChange={handleAttendanceChange}
          isLocked={approvalStatus === 'Locked'}
        />

        {showEditSection && userRole === 'Advisor' && (
          <AdvisorEditSection
            editReason={editReason}
            onEditReasonChange={setEditReason}
            onSaveChanges={handleSaveChanges}
          />
        )}

        <ActionButtons
          userRole={userRole}
          approvalStatus={approvalStatus}
          onSubmitAttendance={handleSubmitAttendance}
          onApproveAttendance={handleApproveAttendance}
          onEditAttendance={handleEditAttendance}
          onLockAttendance={handleLockAttendance}
        />

        <FooterInfo />
      </div>
    </div>
  );
}
