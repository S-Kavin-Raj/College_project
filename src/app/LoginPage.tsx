
import React from 'react';
import { LoginForm } from './components/LoginForm';

interface LoginPageProps {
    onLogin: (role: string, email: string, department: string, academicYear: string, password: string) => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <LoginForm onLogin={onLogin} />
        </div>
    );
}
