import React, { useState } from 'react';
import { DashboardNav } from './DashboardNav';
import { DashboardHeader } from './DashboardHeader';
import { SummaryCards } from './SummaryCards';
import { TodayAttendanceStatus } from './TodayAttendanceStatus';
import { ClassAttendanceTable } from './ClassAttendanceTable';

import { DashboardFooter } from './DashboardFooter';
import { AttendanceClassView } from './AttendanceClassView';
import { SyllabusDashboard } from './SyllabusDashboard';
import { AssignmentDashboard } from '../AssignmentDashboard';
import { UserRole, ClassData } from '../App';

export interface DashboardLayoutProps {
    handleLogout: () => void;
}

export const DashboardLayout = ({ handleLogout }: DashboardLayoutProps) => {
    const [userRole, setUserRole] = useState<UserRole>('Advisor');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedClass, setSelectedClass] = useState('all');
    const [viewMode, setViewMode] = useState<'dashboard' | 'classview' | 'syllabus' | 'assignments'>('dashboard');
    const [currentClassId, setCurrentClassId] = useState<string | null>(null);

    const userData = {
        name: 'Dr. Rajesh Kumar',
        role: userRole,
    };

    // Mock class data
    const classesData: ClassData[] = [
        {
            id: '1',
            department: 'Computer Science & Engineering',
            year: '3rd',
            section: 'B',
            totalStudents: 60,
            markedBy: 'Prof. Sharma',
            status: 'Pending',
            present: 55,
            absent: 5,
        },
        {
            id: '2',
            department: 'Computer Science & Engineering',
            year: '2nd',
            section: 'A',
            totalStudents: 58,
            markedBy: 'Dr. Patel',
            status: 'Approved',
            present: 56,
            absent: 2,
        },
        {
            id: '3',
            department: 'Computer Science & Engineering',
            year: '4th',
            section: 'C',
            totalStudents: 55,
            markedBy: 'Mr. Verma',
            status: 'Locked',
            present: 52,
            absent: 3,
        },
        {
            id: '4',
            department: 'Computer Science & Engineering',
            year: '1st',
            section: 'A',
            totalStudents: 62,
            markedBy: 'Ms. Iyer',
            status: 'Pending',
            present: 60,
            absent: 2,
        },
    ];

    // Filter classes based on role
    const getFilteredClasses = () => {
        if (userRole === 'CR') {
            return classesData.filter(c => c.id === '1'); // CR sees only their class
        }
        if (userRole === 'Staff') {
            return classesData.filter(c => c.id === '1' || c.id === '2'); // Staff sees assigned classes
        }
        return classesData; // Advisor sees all
    };

    const filteredClasses = getFilteredClasses();

    // Calculate summary stats
    const totalStudents = filteredClasses.reduce((sum, c) => sum + c.totalStudents, 0);
    const markedToday = filteredClasses.filter(c => c.status !== 'Pending').length;
    const pendingApproval = filteredClasses.filter(c => c.status === 'Pending').length;
    const totalPresent = filteredClasses.reduce((sum, c) => sum + c.present, 0);
    const attendancePercentage = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

    const handleViewAttendance = (classId: string) => {
        setCurrentClassId(classId);
        setViewMode('classview');
    };

    const handleBackToDashboard = () => {
        setViewMode('dashboard');
        setCurrentClassId(null);
    };

    if (viewMode === 'classview' && currentClassId) {
        const classData = classesData.find(c => c.id === currentClassId);
        return (
            <AttendanceClassView
                classData={classData!}
                userRole={userRole}
                onBack={handleBackToDashboard}
            />
        );
    }

    if (viewMode === 'syllabus') {
        return (
            <SyllabusDashboard
                userRole={userRole}
                onBack={handleBackToDashboard}
                onSwitchToSyllabus={() => setViewMode('syllabus')}
            />
        );
    }

    if (viewMode === 'assignments') {
        return (
            <AssignmentDashboard onBack={handleBackToDashboard} />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">


            <DashboardNav
                userName={userData.name}
                userRole={userData.role}
                onLogout={handleLogout}
                onSwitchToSyllabus={() => setViewMode('syllabus')}
                onSwitchToAssignments={() => setViewMode('assignments')}
            />

            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                <DashboardHeader
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    selectedClass={selectedClass}
                    onClassChange={setSelectedClass}
                />

                <SummaryCards
                    totalStudents={totalStudents}
                    markedToday={markedToday}
                    pendingApproval={pendingApproval}
                    attendancePercentage={attendancePercentage}
                />

                <TodayAttendanceStatus classes={filteredClasses} />



                <ClassAttendanceTable
                    classes={filteredClasses}
                    userRole={userRole}
                    onViewAttendance={handleViewAttendance}
                />

                <DashboardFooter />
            </div>
        </div>
    );
}
