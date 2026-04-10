import { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Shield, Home, History, GraduationCap, Settings, LogOut, FileSearch, AlertTriangle, User, Users, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import api from "../../api/axios";
import { ThemeToggle } from "./theme-toggle";

interface DashboardStats {
  threats_blocked_today: number;
  threats_blocked_week: number;
  lessons_completed: number;
  total_quizzes_passed: number;
  security_score: number;
  focus_streak: number;
  password_breaches_found: number;
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Fetch fresh complete user profile
      api.get("/auth/me").then(res => {
        const fullUser = { ...parsedUser, ...res.data };
        setUser(fullUser);
        localStorage.setItem("user", JSON.stringify(fullUser));
      }).catch(err => console.error("Failed to sync profile:", err));
    } catch (e) {
      // Corrupted localStorage data — force re-login
      console.error("Failed to parse user data:", e);
      localStorage.removeItem("user");
      navigate("/auth");
    }
  }, [navigate]);

  // Fetch dashboard stats for child routes (only for students)
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role === "teacher") return;
    fetchStats();
    const intervalId = setInterval(fetchStats, 30000);
    return () => clearInterval(intervalId);
  }, [user, fetchStats]);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;

  const navItems = user.role === "teacher" 
    ? [
        { path: "/teacher/dashboard", icon: Home, label: "Dashboard" },
        { path: "/teacher/students", icon: Users, label: "Students" },
        { path: "/teacher/requests", icon: AlertTriangle, label: "Requests" },
        { path: "/teacher/settings", icon: Settings, label: "Classroom" },
      ]
    : [
        { path: "/dashboard", icon: Home, label: "Home" },
        { path: "/dashboard/threats", icon: History, label: "Threats" },
        { path: "/dashboard/learn", icon: GraduationCap, label: "Learn" },
        { path: "/dashboard/settings", icon: Settings, label: "Settings" },
      ];

  const profilePath = user.role === "teacher" ? "/teacher/dashboard" : "/dashboard/profile";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={user.role === "teacher" ? "/teacher/dashboard" : "/dashboard"} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Trust & Learning Hub</h1>
                <div className="flex items-center gap-2">
                  {user.protection_paused_until && new Date(user.protection_paused_until) > new Date() && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-800/50">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Paused
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant="ghost"
                      className={`flex items-center gap-2 ${
                        isActive ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="text-right hidden sm:block">
                <Link to={profilePath} className="text-sm font-medium text-gray-900 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {user.full_name || user.name || user.email?.split('@')[0] || "User"}
                </Link>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                <span className="ml-2 hidden sm:inline">Logout</span>
              </Button>

              {/* Mobile menu toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-2 ${
                        isActive ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ user, stats }} />
      </main>
    </div>
  );
}
