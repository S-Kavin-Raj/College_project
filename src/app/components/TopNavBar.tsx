import { User, LogOut, GraduationCap } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import type { UserRole } from "../App";

interface TopNavBarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function TopNavBar({ currentRole, onRoleChange }: TopNavBarProps) {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "Staff":
        return "bg-blue-600 hover:bg-blue-700";
      case "Advisor":
        return "bg-green-600 hover:bg-green-700";
      case "Student":
        return "bg-purple-600 hover:bg-purple-700";
    }
  };

  const getUserName = () => {
    switch (currentRole) {
      case "Staff":
        return "Dr. Rajesh Kumar";
      case "Advisor":
        return "Prof. Meera Singh";
      case "Student":
        return "Aarav Sharma";
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Left section - App branding */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Department Academic System</h1>
              <p className="text-sm text-gray-600">Assignment Management</p>
            </div>
          </div>

          {/* Right section - User info */}
          <div className="flex items-center gap-4">
            <Badge className={`${getRoleBadgeColor(currentRole)} text-white`}>
              {currentRole}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="hidden sm:inline">{getUserName()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">

                <DropdownMenuItem className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
