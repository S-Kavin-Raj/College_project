
import React, { useState } from 'react';
import { UnifiedSidebar, PageId } from './UnifiedSidebar';
import { UnifiedHeader } from './UnifiedHeader';
import { cn } from '../ui/utils';

interface MainLayoutProps {
    children: React.ReactNode;
    activePage: PageId;
    onNavigate: (page: PageId) => void;
    userRole: string;
    onRoleChange: (role: string) => void;
    userName: string;
    onLogout: () => void;
}

export function MainLayout({
    children,
    activePage,
    onNavigate,
    userRole,
    onRoleChange,
    userName,
    onLogout
}: MainLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getPageTitle = (page: PageId) => {
        switch (page) {
            case 'dashboard': return 'Academic Dashboard';
            case 'attendance': return 'Attendance Management';
            case 'assignments': return 'Assignment Center';
            case 'monitor': return 'Assignment Monitoring';
            case 'submit': return 'Assignment Submission';
            case 'syllabus': return 'Syllabus Tracker';
            case 'reports': return 'Academic Reports';
            case 'settings': return 'System Settings';
            default: return 'Dashboard';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden glass"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <UnifiedSidebar
                activePage={activePage}
                onNavigate={(page) => {
                    onNavigate(page);
                    setMobileMenuOpen(false);
                }}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={cn(
                    "fixed md:sticky top-0 h-screen z-50 bg-white shadow-xl md:shadow-none transform transition-transform duration-300 ease-in-out",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
                userRole={userRole}
            />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <UnifiedHeader
                    onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
                    pageTitle={getPageTitle(activePage)}
                    userName={userName}
                    userRole={userRole}
                    onLogout={onLogout}
                    onRoleChange={onRoleChange}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
                    <div className="max-w-7xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>

                <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Department Academic Management System. All rights reserved.
                </footer>
            </div>
        </div>
    );
}
