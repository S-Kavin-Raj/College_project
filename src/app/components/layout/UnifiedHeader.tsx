
import React from 'react';
import {

    Menu,
    User,
    LogOut
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface HeaderProps {
    onMenuToggle: () => void;
    pageTitle: string;
    userName: string;
    userRole: string;
    onLogout: () => void;
    onRoleChange: (role: string) => void;
}

export function UnifiedHeader({
    onMenuToggle,
    pageTitle,
    userName,
    userRole,
    onLogout,
    onRoleChange
}: HeaderProps) {

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "Admin": return "bg-red-600 hover:bg-red-700";
            case "Advisor": return "bg-purple-600 hover:bg-purple-700";
            case "Staff": return "bg-blue-600 hover:bg-blue-700";
            case "CR": return "bg-orange-500 hover:bg-orange-600";
            case "Student": return "bg-emerald-600 hover:bg-emerald-700";
            default: return "bg-gray-600";
        }
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">

            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-gray-500"
                    onClick={onMenuToggle}
                >
                    <Menu className="w-5 h-5" />
                </Button>

                <div className="hidden md:flex flex-col">
                    <h1 className="text-xl font-semibold text-gray-900">{pageTitle}</h1>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">


                <div className="h-8 w-px bg-gray-200 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end hidden sm:flex">
                        <span className="text-sm font-medium text-gray-900">{userName}</span>
                        <Badge className={`${getRoleBadgeColor(userRole)} text-[10px] px-1.5 py-0 h-4`}>
                            {userRole}
                        </Badge>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-gray-200 hover:bg-gray-50">
                                <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-500" />
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
                                <LogOut className="w-4 h-4 mr-2" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
