import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Globe, 
  Plus, 
  Trash2, 
  Loader2, 
  Shield, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Twitch,
  MessageCircle as RedditIcon,
  Search
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";

interface BlockedSite {
  id: number;
  domain: string;
  reason?: string;
  created_at: string;
  is_active: boolean;
}

// Popular distracting websites
const suggestedSites = [
  { name: "Instagram", url: "instagram.com", icon: Instagram, color: "text-pink-600" },
  { name: "YouTube", url: "youtube.com", icon: Youtube, color: "text-red-600" },
  { name: "Facebook", url: "facebook.com", icon: Facebook, color: "text-blue-600" },
  { name: "Twitter", url: "twitter.com", icon: Twitter, color: "text-sky-500" },
  { name: "Twitch", url: "twitch.tv", icon: Twitch, color: "text-purple-600" },
  { name: "Reddit", url: "reddit.com", icon: RedditIcon, color: "text-orange-600" },
];

export function BlockedWebsites() {
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [reason, setReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBlockedSites();
  }, []);

  const fetchBlockedSites = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/student/blocked-sites");
      setBlockedSites(response.data);
    } catch (error) {
      console.error("Failed to fetch blocked sites:", error);
      toast.error("Failed to load blocked websites");
    } finally {
      setIsLoading(false);
    }
  };

  const addBlockedSite = async (domain: string, customReason?: string) => {
    try {
      const response = await api.post("/student/blocked-sites", {
        url: domain,
        reason: customReason || "Blocked by student"
      });
      setBlockedSites([response.data, ...blockedSites]);
      toast.success(`✅ ${domain} has been blocked`);
      return true;
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error(`⚠️ ${domain} is already blocked`);
      } else {
        toast.error("Failed to block website");
      }
      return false;
    }
  };

  const removeBlockedSite = async (id: number, domain: string) => {
    try {
      await api.delete(`/student/blocked-sites/${id}`);
      setBlockedSites(blockedSites.filter(site => site.id !== id));
      toast.success(`🔓 ${domain} has been unblocked`);
    } catch (error) {
      console.error("Failed to remove blocked site:", error);
      toast.error("Failed to unblock website");
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      toast.error("Please enter a website URL or domain");
      return;
    }

    // Clean the URL
    let cleanUrl = newUrl.trim().toLowerCase();
    cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
    cleanUrl = cleanUrl.replace(/^www\./, '');
    cleanUrl = cleanUrl.split('/')[0]; // Remove path

    setIsAdding(true);
    await addBlockedSite(cleanUrl, reason);
    setIsAdding(false);
    setNewUrl("");
    setReason("");
  };

  const filteredSites = blockedSites.filter(site =>
    site.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Blocked Websites</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Block distracting websites to stay focused. These sites will be blocked when the extension is active.
        </p>
      </div>

      {/* Stats Card */}
      <Card className="border-2 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-red-200 dark:border-red-800/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{blockedSites.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Websites Blocked</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {blockedSites.length === 0 ? "No sites blocked yet" : "Stay focused! 🎯"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Site Form */}
      <Card className="border-2 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Block a New Website
          </CardTitle>
          <CardDescription>
            Enter a website URL or domain (e.g., instagram.com, youtube.com)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSite} className="space-y-4">
            <div>
              <Label htmlFor="url">Website URL</Label>
              <div className="relative mt-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="url"
                  placeholder="e.g., instagram.com, tiktok.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                placeholder="e.g., Too distracting, Exam preparation"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isAdding} className="bg-green-600 hover:bg-green-700">
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Block Website
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Suggested Websites to Block */}
      <Card className="border-2 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Popular Distracting Websites
          </CardTitle>
          <CardDescription>Quickly block common distracting sites</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {suggestedSites.map((site) => {
              const isBlocked = blockedSites.some(s => s.domain === site.url);
              const Icon = site.icon;
              return (
                <button
                  key={site.name}
                  onClick={() => !isBlocked && addBlockedSite(site.url, `Blocked ${site.name}`)}
                  disabled={isBlocked}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    isBlocked
                      ? "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-800 cursor-default"
                      : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-red-300 hover:shadow-md cursor-pointer"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${site.color}`} />
                  <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">
                    {site.name}
                  </span>
                  {isBlocked ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Blocked Sites List */}
      <Card className="border-2 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/50 dark:bg-slate-900/50 border-b dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Blocked Websites ({blockedSites.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search blocked sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredSites.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No blocked websites</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {searchTerm ? "No matching websites found" : "Add websites above to block them"}
              </p>
            </div>
          ) : (
            <div className="divide-y dark:divide-slate-800">
              {filteredSites.map((site) => (
                <div
                  key={site.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{site.domain}</p>
                      {site.reason && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{site.reason}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Blocked on {new Date(site.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBlockedSite(site.id, site.domain)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800/30">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-400">How It Works</h4>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                Blocked websites will be inaccessible when your SafeLearn AI browser extension is active.
                You can unblock any site at any time. This helps you stay focused during study sessions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}