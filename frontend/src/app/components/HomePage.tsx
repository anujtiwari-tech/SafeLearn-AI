import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { 
  AlertTriangle, 
  GraduationCap, 
  Trophy, 
  Zap,
  FileSearch,
  ShieldCheck,
  Lock,
  Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import api from "../../api/axios";
import { formatDistanceToNow } from "date-fns";

// Data types as fed by outlet context
interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  points: number;
  avatar?: string;
}

interface DashboardStats {
  threats_blocked_today: number;
  threats_blocked_week: number;
  lessons_completed: number;
  total_quizzes_passed: number;
  security_score: number;
  focus_streak: number;
  password_breaches_found: number;
}

interface ThreatItem {
  id: number;
  url: string;
  threat_type: string;
  explanation: string;
  timestamp: string;
  is_helpful?: boolean;
}

export function HomePage() {
  const { user, stats: layoutStats } = useOutletContext<{ user: UserData; stats: DashboardStats | null }>();
  const [stats, setStats] = useState<DashboardStats | null>(layoutStats);
  const [history, setHistory] = useState<ThreatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If stats come from layout, use them immediately
    if (layoutStats) {
      setStats(layoutStats);
      setIsLoading(false);
    }
  }, [layoutStats]);

  useEffect(() => {
    const fetchFullData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/history")
        ]);
        setStats(statsRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullData();
    const intervalId = setInterval(fetchFullData, 25000);
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.threats_blocked_today || 0}</span>
          </div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Threats Blocked Today</h3>
          <p className="text-xs text-gray-500 mt-1">+{stats?.threats_blocked_week || 0} this week</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.lessons_completed || 0}</span>
          </div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Lessons Completed</h3>
          <p className="text-xs text-gray-500 mt-1">Keep going! 🎯</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{user?.points || (stats as any)?.total_points || 0}</span>
          </div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Total Points</h3>
          <p className="text-xs text-gray-500 mt-1">Keep learning to earn more! ⭐</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-slate-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.focus_streak || (stats as any)?.learning_streak || 0}</span>
          </div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300">Day Streak</h3>
          <p className="text-xs text-gray-500 mt-1">Stay focused! 🔥</p>
        </div>
      </div>

      {/* Security Score Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">Your Security Score</h3>
            <p className="text-indigo-100 text-sm mt-1">Based on your activity and learning progress</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{stats?.security_score || 0}%</div>
              <div className="text-xs text-indigo-200 mt-1">Security Score</div>
            </div>
            <div className="w-32 hidden sm:block">
              <Progress value={stats?.security_score || 0} className="h-2 bg-white/30" />
            </div>
            <Link to="/dashboard/learn">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                Improve Score
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link to="/scan">
              <Button className="w-full justify-start gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                <FileSearch className="w-4 h-4" />
                Scan a File
              </Button>
            </Link>
            <Link to="/dashboard/learn">
              <Button variant="outline" className="w-full justify-start gap-3">
                <GraduationCap className="w-4 h-4" />
                Continue Learning
              </Button>
            </Link>
            <Link to="/dashboard/blocked-sites">
              <Button variant="outline" className="w-full justify-start gap-3">
                <ShieldCheck className="w-4 h-4" />
                Manage Focus Mode
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Threats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Recent Threats Blocked
          </h3>
          <div className="space-y-3">
            {history.length > 0 ? (
              history.slice(0, 3).map((threat) => (
                <div key={threat.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 dark:border-slate-800 last:border-0">
                  <span className="text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{threat.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                  <Badge variant="outline" className={
                    threat.threat_type.toLowerCase() === 'phishing' ? 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20' : 
                    threat.threat_type.toLowerCase() === 'malware' ? 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20' : 
                    'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20'
                  }>
                    {threat.threat_type}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400 italic">
                No threats detected recently.
              </div>
            )}
            
            <Link to="/dashboard/threats" className="block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-4 pt-2">
              View all threats →
            </Link>
          </div>
        </div>

        {/* Password Health */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-slate-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-500" />
            Password Health
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Breached passwords found</span>
              {stats?.password_breaches_found && stats?.password_breaches_found > 0 ? (
                <span className="font-bold text-red-600">{stats.password_breaches_found}</span>
              ) : (
                <span className="font-bold text-green-600">0</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Strong passwords</span>
              <span className="font-bold text-green-600">85%</span>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700">
              Run Password Scan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}