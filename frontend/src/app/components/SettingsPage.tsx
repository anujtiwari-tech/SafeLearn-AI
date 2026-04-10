import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  Shield, 
  Bell, 
  Trash2, 
  Eye, 
  EyeOff,
  Download,
  AlertTriangle,
  CheckCircle,
  FileText,
  Loader2,
  Clock,
  History
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";
import { ClassroomInfoCard } from "./dashboard/ClassroomInfoCard";

export function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pauseDuration, setPauseDuration] = useState("60");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
      // Update local storage to keep synced
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, ...res.data }));
    } catch (error) {
      console.error("Fetch profile error:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (field: string, value: any) => {
    setIsUpdating(true);
    try {
      const res = await api.put("/settings/preferences", { [field]: value });
      setUser(res.data);
      toast.success("Settings updated");
    } catch (error) {
      console.error("Update preference error:", error);
      toast.error("Failed to update settings");
    } finally {
      setIsUpdating(false);
    }
  };

  const isPaused = user?.protection_paused_until && new Date(user.protection_paused_until) > new Date();

  const handleTogglePause = async (checked: boolean) => {
    try {
      const duration = checked ? parseInt(pauseDuration) : 0;
      const res = await api.post("/settings/pause", { duration_minutes: duration });
      setUser(res.data);
      
      // Sync pause state to localStorage so the extension content script picks it up
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      stored.protection_paused_until = res.data.protection_paused_until;
      localStorage.setItem("user", JSON.stringify(stored));
      
      if (checked) {
        const label = pauseDuration === "1440" ? "1 day" : pauseDuration === "240" ? "4 hours" : "1 hour";
        toast.success(`Protection paused for ${label}`, {
          description: "The extension will stop scanning until the timer expires.",
        });
      } else {
        toast.success("Protection resumed", {
          description: "Real-time scanning is now active again.",
        });
      }
    } catch (error) {
      console.error("Pause toggle error:", error);
      toast.error("Failed to update protection status");
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.delete("/settings/history");
      toast.success("History cleared", {
        description: "All your security history has been removed from our servers.",
      });
      setShowClearConfirm(false);
    } catch (error) {
      console.error("Clear history error:", error);
      toast.error("Failed to clear history");
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await api.get("/settings/export");
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `safelearn-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings & Privacy</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your preferences and digital footprint</p>
      </div>

      {/* Privacy Control */}
      <Card className="border-2 shadow-sm dark:border-slate-700">
        <CardHeader className="bg-gray-50/50 border-b dark:bg-slate-900 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${isPaused ? "text-yellow-600" : "text-blue-600 dark:text-blue-400"}`} />
            Privacy Control
          </CardTitle>
          <CardDescription>You're in control of your data and real-time monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Pause Tracking */}
          <div className={`p-6 rounded-xl border-2 transition-all ${isPaused ? "bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800" : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800"}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${isPaused ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
                  {isPaused ? (
                    <EyeOff className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isPaused ? "Protection is Paused" : "Enable Stealth Protection"}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Temporarily stop real-time threat scanning and notifications.
                  </p>
                  {isPaused && (
                    <div className="flex items-center gap-2 mt-2 text-sm font-semibold text-yellow-700">
                      <Clock className="w-4 h-4" />
                      <span>Resuming on: {new Date(user.protection_paused_until).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {!isPaused && (
                  <Select value={pauseDuration} onValueChange={setPauseDuration}>
                    <SelectTrigger className="w-[140px] h-10 dark:bg-slate-800 dark:border-slate-600 dark:text-white" >
                      <SelectValue placeholder="Duration" className="dark:bg-black" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 Hour</SelectItem>
                      <SelectItem value="240">4 Hours</SelectItem>
                      <SelectItem value="1440">1 Day</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                
                <Switch
                  checked={isPaused}
                  onCheckedChange={handleTogglePause}
                  disabled={isUpdating}
                  className="scale-125"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800/40">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-300">
                Data used for real-time analysis is processed locally whenever possible. We never store your passwords or financial information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border-2 shadow-sm dark:border-slate-700">
        <CardHeader className="bg-gray-50/50 border-b dark:bg-slate-900 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Notifications
          </CardTitle>
          <CardDescription>Stay informed about your digital security events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div>
              <Label className="text-base font-bold text-gray-900 dark:text-white">Email Alerts</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get notified immediately when severe threats are detected.</p>
            </div>
            <Switch
              checked={user?.email_alerts}
              onCheckedChange={(v) => updatePreference('email_alerts', v)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div>
              <Label className="text-base font-bold text-gray-900 dark:text-white">Browser Push Notifications</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real-time alerts directly in your browser while surfing.</p>
            </div>
            <Switch
              checked={user?.push_notifications}
              onCheckedChange={(v) => updatePreference('push_notifications', v)}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div>
              <Label className="text-base font-bold text-gray-900 dark:text-white">Weekly Security Summary</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">A weekly digest of your points, progress, and threats blocked.</p>
            </div>
            <Switch
              checked={user?.weekly_reports}
              onCheckedChange={(v) => updatePreference('weekly_reports', v)}
              disabled={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-2 shadow-sm dark:border-slate-700">
        <CardHeader className="bg-gray-50/50 border-b dark:bg-slate-900 dark:border-slate-700">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Data Management
          </CardTitle>
          <CardDescription>Review, download, or delete your usage history</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Label className="text-base font-bold text-gray-900 dark:text-white">Download My Data</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download all your threat logs, file scans, and progress in JSON format.</p>
              </div>
            </div>
            <Button onClick={handleExportData} variant="outline" disabled={isExporting}>
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Export"}
            </Button>
          </div>

          {/* Clear History */}
          <div className={`p-4 rounded-xl border-2 transition-all ${showClearConfirm ? "bg-red-50 dark:bg-red-900/20 border-red-200" : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800"}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showClearConfirm ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-slate-800"}`}>
                  <Trash2 className={`w-5 h-5 ${showClearConfirm ? "text-red-600" : "text-gray-500 dark:text-gray-400"}`} />
                </div>
                <div>
                  <Label className="text-base font-bold text-gray-900 dark:text-white">Reset Activity History</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your historical logs. This cannot be undone.</p>
                  {showClearConfirm && (
                    <p className="text-sm text-red-600 font-bold mt-2">Are you sure? This will delete all threat logs and scan results.</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {showClearConfirm ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
                    <Button variant="destructive" size="sm" onClick={handleClearHistory}>Confirm Delete</Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(true)}>Clear History</Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Education Promo */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FileText className="w-32 h-32" />
        </div>
        <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Want to learn more?</h3>
            <p className="text-blue-100 max-w-md">Our transparency report details exactly how we protect your privacy while keeping you safe from digital threats.</p>
          </div>
          <Button className="bg-white text-blue-700 hover:bg-blue-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 font-bold h-12 px-8">
            View Transparency Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
