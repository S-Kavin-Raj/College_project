import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { GraduationCap, BookOpen, ShieldCheck, Mail, Lock, Eye, EyeOff, Building2, Calendar, UserCheck, Users, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";


type LoginType = "student" | "teacher" | "admin";
type TeacherRole = "Advisor" | "Staff" | "CR";

interface LoginFormProps {
  onLogin?: (role: string, email: string, department: string, academicYear: string, password: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [activeTab, setActiveTab] = useState<LoginType>("student");
  const [teacherRole, setTeacherRole] = useState<TeacherRole>("Staff");

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [department, setDepartment] = useState<string>("BE CSE");
  const [academicYear, setAcademicYear] = useState<string>("1st Year");

  const departments = [
    "BE CSE",
    "B.Tech AIDS",
    "BE AI-ML",
    "BE EEE",
    "BE ECE",
    "BE CCE"
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine the final role to send to backend
    let finalRole = "";
    if (activeTab === "admin") finalRole = "Admin";
    else if (activeTab === "student") finalRole = "Student";
    else if (activeTab === "teacher") finalRole = teacherRole; // Advisor, Staff, or CR

    console.log(`Logging in as ${finalRole} (Type: ${activeTab})`, formData);

    const yearPayload = activeTab === 'admin' ? "" : academicYear;

    if (onLogin) {
      onLogin(finalRole, formData.email, department, yearPayload, formData.password);
    }
  };

  const getHeaderIcon = () => {
    if (activeTab === 'student') return GraduationCap;
    if (activeTab === 'admin') return ShieldCheck;
    // For Teacher tab, vary icon by selected sub-role
    if (teacherRole === 'Advisor') return UserCheck; // Advisor icon
    if (teacherRole === 'CR') return Users; // CR icon
    return BookOpen; // Staff default
  };

  const IconComponent = getHeaderIcon();

  // Colors for visual distinction
  const getThemeColor = () => {
    if (activeTab === 'student') return "text-blue-600 bg-blue-50";
    if (activeTab === 'admin') return "text-red-600 bg-red-50";
    if (teacherRole === 'CR') return "text-indigo-600 bg-indigo-50"; // Distinct for CR
    if (teacherRole === 'Advisor') return "text-pink-600 bg-pink-50";
    return "text-purple-600 bg-purple-50";
  };
  const themeClasses = getThemeColor();
  const [iconColor, bgColor] = themeClasses.split(' ');

  return (
    <Card className="w-full max-w-md shadow-2xl border-0">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-center">
          <div className={`p-4 rounded-full ${bgColor}`}>
            <IconComponent className={`size-12 ${iconColor}`} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <CardTitle className="text-3xl">College Portal</CardTitle>
          <CardDescription>
            {activeTab === 'teacher' && teacherRole === 'CR'
              ? "Class Representative Access"
              : "Sign in to your account"}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LoginType)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="student" className="gap-2">
              <GraduationCap className="size-4" />
              <span className="hidden sm:inline">Student</span>
            </TabsTrigger>
            <TabsTrigger value="teacher" className="gap-2">
              <BookOpen className="size-4" />
              <span className="hidden sm:inline">Teacher</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <ShieldCheck className="size-4" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* TEACHER SUB-ROLE SELECTOR */}
            {activeTab === 'teacher' && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                <Label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Teacher Role</Label>
                <Select value={teacherRole} onValueChange={(v) => setTeacherRole(v as TeacherRole)}>
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Staff">Staff / Faculty</SelectItem>
                    <SelectItem value="Advisor">Class Advisor</SelectItem>
                    <SelectItem value="CR">Class Representative</SelectItem>
                  </SelectContent>
                </Select>
                {teacherRole === 'CR' && (
                  <div className="flex items-center gap-2 text-[11px] text-indigo-700 bg-indigo-50 px-2 py-1.5 rounded border border-indigo-100">
                    <Users className="w-3 h-3" />
                    <span>Student assistant with limited attendance access</span>
                  </div>
                )}
              </div>
            )}

            {/* DEPARTMENT SELECTION */}
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <SelectValue placeholder="Select Department" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ACADEMIC YEAR (Hidden for Admin) */}
            {activeTab !== 'admin' && (
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <SelectValue placeholder="Select Year" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={activeTab === 'teacher' ? `${teacherRole.toLowerCase()}@college.edu` : `${activeTab}@college.edu`}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="size-4 rounded border-gray-300"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full">
              {activeTab === 'teacher' ? `Login as ${teacherRole}` : `Login as ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Need help?{" "}
                <a href="#" className="text-primary hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
