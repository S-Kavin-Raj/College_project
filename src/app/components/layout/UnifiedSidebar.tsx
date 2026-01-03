
import React from 'react';
import {
    LayoutDashboard,
    ClipboardCheck,
    BookOpen,
    FileText,
    BarChart,
    Settings,
    ChevronLeft,
    ChevronRight,
    GraduationCap
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { SIDEBAR_MENU } from "../../config/sidebarPermissions";

export type PageId = 'dashboard' | 'attendance' | 'assignments' | 'syllabus' | 'monitor' | 'submit' | 'reports' | 'settings' | 'cr-management';

interface SidebarProps {
    activePage: PageId;
    onNavigate: (page: PageId) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
    className?: string;
    userRole: string;
}

export function UnifiedSidebar({
    activePage,
    onNavigate,
    collapsed,
    onToggleCollapse,
    className,
    userRole
}: SidebarProps) {

    // Build nav items from config (single source of truth for sidebar visibility)
    // Normalise user role to uppercase (frontend uses TitleCase in places)
    const roleNormalized = (userRole || "").toString().toUpperCase();

    const filteredNavItems = SIDEBAR_MENU.filter((item: any) => {
        return item.allowedRoles.includes(roleNormalized);
    });

    return (
        <aside
            className={cn(
                "h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-40",
                collapsed ? "w-20" : "w-64",
                className
            )}
        >
            {/* Logo Section */}
            <div className={cn(
                "h-16 flex items-center border-b border-gray-100 px-4",
                collapsed ? "justify-center" : "justify-between"
            )}>
                <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-10 h-10 shrink-0">
                        <img
                            src="/assets/college_logo.png"
                            alt="College Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 leading-tight text-sm">Kathir College of Engineering</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Academic System</span>
                        </div>
                    )}
                </div>

                {!collapsed && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleCollapse}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {filteredNavItems.map((item) => {
                    const isActive = activePage === item.id || (item.id === 'assignments' && (activePage === 'monitor' || activePage === 'submit'));
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id as PageId)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative",
                                isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon className={cn(
                                "w-5 h-5 shrink-0 transition-colors",
                                isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                            )} />

                            {!collapsed && (
                                <span className="font-medium text-sm">{item.label}</span>
                            )}

                            {/* Active Indicator Strip */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Collapse Button (Mobile/Desktop alternate position) */}
            {collapsed && (
                <div className="p-4 border-t border-gray-100 flex justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleCollapse}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            )}
        </aside>
    );
}
