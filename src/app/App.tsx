
import { useState } from "react";
import { MainLayout } from "./components/layout/MainLayout";
import { PageId } from "./components/layout/UnifiedSidebar";
import { AttendancePage } from "../attendance-page/AttendancePage";
import { AssignmentsPage } from "../assignment-page/AssignmentsPage";
import { SyllabusPage } from "../syllabus-page/SyllabusPage";
import { ReportsPage } from "./pages/OtherPages";
import { SettingsPage } from "../settings-page/SettingsPage";
import { LoginPage } from "./LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

import type { UserRole, Assignment, Submission } from "./types";



export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('Student');
  const [userDept, setUserDept] = useState<string>("BE CSE");
  const [userYear, setUserYear] = useState<string>("3rd Year");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async (role: string, email: string, department: string, academicYear: string, password: string) => {
    try {
      // Call backend login - send names (backend resolves to ids for security)
      // Note: We send 'claimed_role' so the backend can enforce intent (e.g. denying Student login if they claim CR but aren't assigned)
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimed_role: role, email, password, department_id: department, academic_year_id: academicYear })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Login failed');

      // Save token securely; here we store in localStorage for demo (use HttpOnly cookies in production)
      localStorage.setItem('dam_token', payload.token);

      // Map server role to app role
      const serverRole = payload.profile.role || role.toUpperCase();
      let appRole: UserRole = 'Student';
      switch (serverRole) {
        case 'STUDENT': appRole = 'Student'; break;
        case 'CR': appRole = 'CR'; break;
        case 'STAFF': appRole = 'Staff'; break;
        case 'ADVISOR': appRole = 'Advisor'; break;
        case 'ADMIN': appRole = 'Admin'; break;
        default: appRole = 'Student';
      }

      setUserRole(appRole);
      setUserDept(department);
      setUserYear(academicYear);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Login error', err);
      alert(err.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActivePage('dashboard'); // Reset page on logout
  };

  // Mock user name based on role
  const getUserName = () => {
    const prefix = userRole === 'Admin' ? '' : `[${userDept} - ${userYear}] `; // Show dept and year for clarity
    switch (userRole) {
      case 'Staff': return `${prefix}Dr. Rajesh Kumar`;
      case 'Advisor': return `${prefix}Prof. Meera Singh`;
      case 'Student': return `${prefix}Kavin Raj S`;
      case 'Admin': return 'System Administrator';
      case 'CR': return `${prefix}Rahul Verma`;
      default: return 'User';
    }
  };

  const renderContent = () => {
    // 1. Define Permission Rules (Single Source of Truth)
    const permissions: Record<string, UserRole[]> = {
      'dashboard': ['Student', 'CR', 'Staff', 'Advisor', 'Admin'],
      'attendance': ['Student', 'CR', 'Staff', 'Advisor', 'Admin'],
      'assignments': ['Student', 'Staff', 'Advisor', 'Admin'],
      'monitor': ['Student', 'Staff', 'Advisor', 'Admin'], // Sub-page of assignments
      'submit': ['Student', 'Staff', 'Advisor', 'Admin'],  // Sub-page of assignments
      'syllabus': ['Student', 'Staff', 'Advisor', 'Admin'],
      'reports': ['Advisor', 'Admin'],
      'settings': ['Admin']
    };

    // 2. Check Access
    const allowedRoles = permissions[activePage] || [];
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              Your role <strong>({userRole})</strong> does not have permission to access the
              <strong> {activePage.charAt(0).toUpperCase() + activePage.slice(1)}</strong> module.
            </p>
            <p className="text-sm text-gray-500">
              This attempt has been logged.
            </p>
            <button
              onClick={() => setActivePage('dashboard')}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    // 3. Render Page
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage userRole={userRole} userDept={userDept} userYear={userYear} userName={getUserName()} />;
      case 'attendance':
        return <AttendancePage userRole={userRole} userDept={userDept} userYear={userYear} />;
      case 'assignments':
      case 'monitor':
      case 'submit':
        return <AssignmentsPage userRole={userRole} userDept={userDept} userYear={userYear} />;
      case 'syllabus':
        return <SyllabusPage userRole={userRole} userDept={userDept} userYear={userYear} />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage userRole={userRole} />;
      default:
        return <DashboardPage userRole={userRole} userDept={userDept} userYear={userYear} userName={getUserName()} />;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <MainLayout
      activePage={activePage}
      onNavigate={setActivePage}
      userRole={userRole}
      onRoleChange={(role) => setUserRole(role as UserRole)}
      userName={getUserName()}
      onLogout={handleLogout}
    >
      {renderContent()}
    </MainLayout>
  );
}