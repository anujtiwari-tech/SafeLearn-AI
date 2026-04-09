import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Shield, AlertTriangle, Lock, TrendingUp, Lightbulb, CheckCircle, History, Loader2, Trophy } from "lucide-react";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import api from "../../api/axios";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface DashboardData {
  security_score: number;
  threats_blocked_today: number;
  threats_blocked_month: number;
  learning_streak: number;
  learning_progress: number;
  badges_earned: string[];
  total_points: number;
  total_scans: number;
  last_activity?: string;
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<ThreatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/history")
        ]);
        setData(statsRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        // Don't show toast on background refresh to avoid annoying the user
        if (isLoading) toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Auto-refresh every 25 seconds for real-time updates
    const intervalId = setInterval(fetchDashboardData, 25000);

    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const securityScore = data?.security_score ?? 50;

  // Determine score color and status
  const getScoreColor = (score: number) => {
    if (score >= 80) return { color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30", ring: "ring-green-600", status: "Safe" };
    if (score >= 50) return { color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30", ring: "ring-yellow-600", status: "Caution" };
    return { color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30", ring: "ring-red-600", status: "Risk" };
  };

  const scoreStyle = getScoreColor(securityScore);

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "phishing": return { icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" };
      case "malware": return { icon: Lock, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30" };
      case "safe": return { icon: CheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" };
      default: return { icon: Shield, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back!</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Here's your real-time security overview</p>
      </div>

      {/* Security Score Gauge - Large Circular */}
      <Card className="border-2 shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
           {data?.badges_earned?.map((badge, idx) => (
             <span key={idx} className="inline-block ml-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold rounded-full border border-yellow-200 dark:border-yellow-800/50 shadow-sm">
               {badge}
             </span>
           ))}
        </div>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Circular Gauge */}
            <div className="flex-shrink-0">
              <div className="relative">
                <svg className="w-48 h-48 transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-100 dark:text-slate-800"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(securityScore / 100) * 553} 553`}
                    className={
                      securityScore >= 80
                        ? "text-green-500"
                        : securityScore >= 50
                        ? "text-yellow-500"
                        : "text-red-500"
                    }
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
                  />
                </svg>
                {/* Score Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-5xl font-bold ${scoreStyle.color}`}>{securityScore}</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide dark:text-white">Security Score</div>
                </div>
              </div>
            </div>

            {/* Score Details */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className={`w-8 h-8 ${scoreStyle.color}`} />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{scoreStyle.status} Status</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {securityScore >= 80 ? "Your digital life is well protected!" : "There are some steps you can take to improve."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-white">Threat Protection</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{securityScore}%</span>
                  </div>
                  <Progress value={securityScore} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-white">Learning Completion</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.min(100, Math.round((data?.learning_progress ?? 0) / 6 * 100))}%</span>
                  </div>
                  <Progress value={Math.min(100, Math.round((data?.learning_progress ?? 0) / 6 * 100))} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threat Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 hover:shadow-lg transition-all hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{data?.threats_blocked_today ?? 0}</p>
                <p className="text-sm text-gray-600 dark:text-white">Threats Blocked Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all hover:-translate-y-1 ">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{data?.threats_blocked_month ?? 0}</p>
                <p className="text-sm text-gray-600 dark:text-white">Blocked This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{data?.total_scans ?? 0}</p>
                <p className="text-sm text-gray-600 dark:text-white">Total Pages Protected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-lg transition-all hover:-translate-y-1 border-purple-100 bg-purple-50/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{data?.total_points ?? 0}</p>
                <p className="text-sm text-gray-600 dark:text-white">Total Reward Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Daily Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <Card className="border-2 lg:col-span-2 shadow-sm">
          <CardHeader className="border-b bg-gray-50/50 dark:bg-slate-900/50 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest digital safety events</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {history.length > 0 ? (
                history.map((activity) => {
                  const { icon: ActivityIcon, color, bg } = getActivityIcon(activity.threat_type);
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/50 hover:shadow-sm transition-all">
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full ${bg} flex-shrink-0`}>
                        <ActivityIcon className={`w-6 h-6 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{activity.threat_type} Triggered</p>
                          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap ml-2">
                             {new Date(activity.timestamp).toLocaleString([], { 
                               month: 'short', 
                               day: 'numeric', 
                               hour: '2-digit', 
                               minute: '2-digit' 
                             })}
                           </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-1">{activity.url}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 italic">{activity.explanation}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No activity recorded yet.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Your security logs will appear here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Daily Security Tip */}
        <Card className="border-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900/50 dark:to-slate-800/50 border-blue-100 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              Security Pro Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl backdrop-blur-sm border border-white/40 dark:border-slate-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Check sender addresses!</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                   Always verify the email address matches the organization's official domain. Scammers often use similar-looking addresses like <span className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1">support@google.security.com</span> instead of <span className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-1">support@google.com</span>.
                </p>
              </div>
              <Button variant="outline" size="sm" className="w-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-slate-700">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                Got it, thanks!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}