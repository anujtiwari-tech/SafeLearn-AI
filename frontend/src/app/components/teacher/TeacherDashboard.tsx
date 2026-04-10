import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  ArrowUpRight, 
  TrendingUp, 
  Clock,
  UserPlus,
  RefreshCcw
} from "lucide-react";
import { teacherApi } from "../../../api/teacher";
import { usePolling } from "../../hooks/usePolling";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";

export function TeacherDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchStats = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await teacherApi.getStats(days);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch teacher stats:", error);
      toast.error("Failed to update dashboard data");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true);
  }, [days]);

  // Poll for updates every 30 seconds
  usePolling(() => fetchStats(false), 30000);

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats?.total_students || 0,
      icon: Users,
      description: "Active in classroom",
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Avg. Security Score",
      value: `${stats?.avg_security_score || 0}%`,
      icon: CheckCircle,
      description: "Classroom average",
      color: "text-green-600 bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Pending Requests",
      value: stats?.pending_requests_count || 0,
      icon: UserPlus,
      description: "Awaiting approval",
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
    },
    {
      title: "Threats Blocked",
      value: stats?.threats_blocked_today || 0,
      icon: ShieldAlert,
      description: "In the last 24h",
      color: "text-red-600 bg-red-50 dark:bg-red-900/20"
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Monitor class security and student progress in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" onClick={() => fetchStats(true)} className="gap-2">
            <RefreshCcw className="w-4 h-4" /> Refresh
          </Button>
          <select 
            className="h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analytics Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Security Overview
            </CardTitle>
            <CardDescription>Classwide security trends and performance over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">Classroom Activity Visualization</p>
                <div className="flex justify-center gap-1">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-3 bg-blue-500 rounded-t-sm" 
                      style={{ height: `${20 + Math.random() * 60}%`, opacity: 0.3 + (i/20) }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest alerts and joins.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent_activity?.length > 0 ? (
                stats.recent_activity.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 text-sm border-l-2 border-blue-100 dark:border-blue-900/50 pl-4 py-1">
                    <div className="space-y-1">
                      <p className="font-medium">{item.user}</p>
                      <p className="text-muted-foreground">{item.detail}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                   No recent activity to show.
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-4 gap-2 text-blue-600">
              View All Activity <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
