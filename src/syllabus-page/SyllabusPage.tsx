
import React from 'react';
import { SyllabusDashboard } from '../app/components/SyllabusDashboard';

interface SyllabusPageProps {
    userRole: string;
    userDept: string;
    userYear: string;
}

export function SyllabusPage({ userRole, userDept, userYear }: SyllabusPageProps) {
    return (
        <SyllabusDashboard
            userRole={userRole as any}
            userDept={userDept}
            userYear={userYear}
            onBack={() => { }} // No back action needed in sidebar layout
            onSwitchToSyllabus={() => { }}
        />
    );
}
