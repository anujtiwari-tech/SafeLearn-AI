import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { 
  AlertTriangle, 
  Lock, 
  CheckCircle, 
  Brain, 
  ThumbsUp, 
  ThumbsDown,
  Download,
  Calendar,
  Shield,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCw,
  Globe,
  Mail,
  Filter,
  ArrowUpDown,
  Clock,
  Settings2,
  Zap
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import api from "../../api/axios";
import { toast } from "sonner";

interface RiskIndicator {
  type: string;
  detail: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface Threat {
  id: number;
  url: string;
  threat_type: string;
  threat_level: string;
  action_taken: string;
  explanation?: string;
  confidence_score?: number;
  risk_indicators?: RiskIndicator[];
  performed_checks?: string[];
  scan_metadata?: {
    sender_name?: string;
    subject?: string;
    body_snippet?: string;
    platform?: string;
  };
  timestamp: string;
}

export function ThreatHistoryPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [feedback, setFeedback] = useState<{ [key: number]: "helpful" | "false_alarm" | null }>({});
  
  // Filter and Sort States
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [sourceFilter, setSourceFilter] = useState<"all" | "web" | "email">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "3" | "5" | "7" | "30">("all");

  useEffect(() => {
    fetchThreats();

    // Auto-refresh every 5 seconds as requested
    const interval = setInterval(() => {
      fetchThreats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchThreats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/threats/");
      setThreats(res.data);
    } catch (error) {
      console.error("Fetch threats error:", error);
      toast.error("Failed to load threat history");
    } finally {
      setIsLoading(false);
    }
  };

  const getThreatIcon = (type: string) => {
    const t = type?.toLowerCase() || "";
    if (t.includes("phishing")) return AlertTriangle;
    if (t.includes("privacy")) return Lock;
    if (t.includes("malware")) return AlertCircle;
    if (t.includes("safe")) return CheckCircle;
    return Shield;
  };

  const getThreatColor = (severity: string) => {
    const s = severity?.toLowerCase() || "";
    switch (s) {
      case "critical": return { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700", border: "border-red-200", badge: "bg-red-600", dot: "bg-red-50 dark:bg-red-900/200" };
      case "high": return { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-700", border: "border-orange-200", badge: "bg-orange-600", dot: "bg-orange-50 dark:bg-orange-900/200" };
      case "medium": return { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-700", border: "border-yellow-200", badge: "bg-yellow-600", dot: "bg-yellow-50 dark:bg-yellow-900/200" };
      case "low": return { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-600", dot: "bg-blue-50 dark:bg-blue-900/200" };
      case "safe": return { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-700", border: "border-green-200", badge: "bg-green-600", dot: "bg-green-50 dark:bg-green-900/200" };
      default: return { bg: "bg-gray-50 dark:bg-slate-800/50", text: "text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-slate-700", badge: "bg-gray-600", dot: "bg-gray-50 dark:bg-slate-800/500" };
    }
  };

  const getScanSource = (url: string) => {
    const isEmail = url?.startsWith("email://") || 
                   url?.includes("mail.google.com") || 
                   url?.includes("outlook.live.com") || 
                   url?.includes("outlook.office.com");

    if (isEmail) {
      return { 
        label: "Email Scanning", 
        icon: Mail, 
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200"
      };
    }
    return { 
      label: "URL Scanning", 
      icon: Globe, 
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200"
    };
  };

  const handleExport = () => {
    const report = {
      generatedDate: new Date().toISOString(),
      totalThreats: threats.length,
      threats: threats,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleFeedback = async (threatId: number, type: "helpful" | "false_alarm") => {
    try {
      await api.post("/feedback/submit", {
        threat_log_id: threatId,
        is_helpful: type === "helpful",
        comment: type === "false_alarm" ? "Marked as false alarm" : "Helpful information"
      });
      setFeedback({ ...feedback, [threatId]: type });
      toast.success("Feedback submitted. Thank you!");
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const formatTitle = (type: string) => {
    return type?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || "Security Event";
  };

  const getProcessedThreats = () => {
    let result = [...threats];

    // 1. Source Filtering
    if (sourceFilter !== "all") {
      result = result.filter(t => {
        const isEmail = t.url?.startsWith("email://");
        return sourceFilter === "email" ? isEmail : !isEmail;
      });
    }

    // 2. Date Filtering
    if (dateFilter !== "all") {
      const days = parseInt(dateFilter);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter(t => new Date(t.timestamp) >= cutoff);
    }

    // 3. Sorting
    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return result;
  };

  if (isLoading && threats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your security history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-yellow-500">Threat History</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1 dark:text-white" >Review detections from your extension in real-time</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
              <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                <ArrowUpDown className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source Filter */}
          <Select value={sourceFilter} onValueChange={(v: any) => setSourceFilter(v)}>
            <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="web">Web Only</SelectItem>
              <SelectItem value="email">Email Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
            <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="3">Last 3 Days</SelectItem>
              <SelectItem value="5">Last 5 Days</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 1 Month</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-8 w-[1px] bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          <div className="flex gap-2">
            <Button onClick={fetchThreats} variant="outline" size="icon" className={isLoading ? "animate-spin" : ""}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Showing {getProcessedThreats().length} of {threats.length} detections
        </p>
      </div>

      {getProcessedThreats().length === 0 ? (
        <Card className="border-2 border-dashed bg-black-50">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">All Clear!</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-xs">No threats detected yet. Your extension is actively monitoring for suspicious activity.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {getProcessedThreats().map((threat) => {
            const Icon = getThreatIcon(threat.threat_type);
            const colors = getThreatColor(threat.threat_level);
            
            return (
              <Card 
                key={threat.id} 
                className={`border-2 ${colors.border} hover:shadow-lg transition-all cursor-pointer group`}
                onClick={() => setSelectedThreat(threat)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${colors.bg} flex-shrink-0 transition-transform group-hover:scale-110 relative`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                      {(() => {
                        const source = getScanSource(threat.url);
                        const SourceIcon = source.icon;
                        return (
                          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${source.bg} border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm`}>
                            <SourceIcon className={`w-3 h-3 ${source.color}`} />
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                              {formatTitle(threat.threat_type)}
                            </h3>
                            <Badge className={`${colors.badge} text-white uppercase text-[10px] px-2`}>
                              {threat.threat_level}
                            </Badge>
                            <Badge variant="outline" className={`${getScanSource(threat.url).badge} text-[10px] uppercase font-bold py-0 h-5`}>
                              {getScanSource(threat.url).label}
                            </Badge>
                            {threat.action_taken === "blocked" && (
                              <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 border-red-300">
                                Automatically Blocked
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2">
                            {threat.url.startsWith("email://") ? (
                              <div className="space-y-1.5 bg-purple-50/30 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100/50 dark:border-purple-800/20">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-3.5 h-3.5 text-purple-500" />
                                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">
                                    {threat.scan_metadata?.subject || "Inbox/Platform Scan"}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-5">
                                  From: {threat.scan_metadata?.sender_name || threat.url.split(' - ')[0].replace("email://", "")}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-white font-mono break-all bg-blue-50/50 dark:bg-slate-800/50 p-3 rounded-xl border border-blue-100/20 block w-full">
                                {threat.url}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(threat.timestamp).toLocaleString()}
                      </div>

                      <div className={`mt-3 p-3 ${colors.bg} rounded-lg border ${colors.border} bg-white/50`}>
                        <div className="flex items-start gap-2">
                          <Brain className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 italic">
                            {threat.explanation || "No explanation provided."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Analysis & AI Breakdown <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Threat Detail Modal */}
      <Dialog open={!!selectedThreat} onOpenChange={(open) => !open && setSelectedThreat(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
          {selectedThreat && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in duration-300">
              {/* Modal Header */}
              <div className={`p-8 ${getThreatColor(selectedThreat.threat_level).bg} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  {(() => {
                    const Icon = getThreatIcon(selectedThreat.threat_type);
                    return <Icon className="w-32 h-32 rotate-12" />;
                  })()}
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={`${getThreatColor(selectedThreat.threat_level).badge} text-white px-3 py-1 text-xs font-bold uppercase tracking-wider`}>
                      {selectedThreat.threat_level} Priority
                    </Badge>
                    {selectedThreat.action_taken === "block" && (
                      <Badge variant="outline" className="bg-white/50 backdrop-blur-sm border-red-200 text-red-700 px-3 py-1 text-xs font-bold">
                        Shield Active: Blocked
                      </Badge>
                    )}
                  </div>
                  
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                    {formatTitle(selectedThreat.threat_type)}
                  </h2>
                  
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 font-medium">
                    <div className="flex items-center gap-1.5 bg-white/40 px-3 py-1 dark:text-white rounded-full backdrop-blur-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedThreat.timestamp).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/40 px-3 py-1 dark:text-white rounded-full backdrop-blur-sm">
                      {(() => {
                        const source = getScanSource(selectedThreat.url);
                        const SourceIcon = source.icon;
                        return (
                          <>
                            <SourceIcon className="w-3.5 h-3.5" />
                            {source.label}
                          </>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/40 px-3 py-1 dark:text-white rounded-full backdrop-blur-sm">
                      <Shield className="w-4 h-4" />
                      ID: #{selectedThreat.id}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* URL / Target Destination Section */}
                <div className="group">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    {selectedThreat.url.startsWith("email://") ? 
                      <Mail className="w-4 h-4 text-purple-500" /> : 
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                    }
                    Target Destination
                  </h4>
                  <div className={`p-4 ${selectedThreat.url.startsWith("email://") ? 
                    'bg-purple-50/30 dark:bg-purple-900/10 border-purple-100/50' : 
                    'bg-gray-50 dark:bg-slate-800/50 border-gray-100'
                  } dark:text-white rounded-2xl border dark:border-slate-800 font-mono text-sm break-all group-hover:bg-opacity-80 transition-all`}>
                    {selectedThreat.url}
                  </div>
                </div>

                {/* Email Metadata Section */}
                {selectedThreat.scan_metadata && (selectedThreat.scan_metadata.subject || selectedThreat.scan_metadata.sender_name) && (
                  <div className="bg-purple-50 dark:bg-purple-900/10 rounded-3xl p-6 border border-purple-100 dark:border-purple-800/50 animate-in fade-in slide-in-from-left-4 duration-500">
                    <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Context
                    </h4>
                    <div className="grid gap-4">
                      {selectedThreat.scan_metadata.sender_name && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">From</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedThreat.scan_metadata.sender_name}</p>
                        </div>
                      )}
                      {selectedThreat.scan_metadata.subject && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Subject</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{selectedThreat.scan_metadata.subject}</p>
                        </div>
                      )}
                      {selectedThreat.scan_metadata.body_snippet && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Content Preview</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 italic line-clamp-2 bg-white/50 dark:bg-black/20 p-2 rounded-xl">
                            "{selectedThreat.scan_metadata.body_snippet}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Explanation Box */}
                {(() => {
                  const text = selectedThreat.explanation || "Our AI is currently analyzing this threat pattern...";
                  const isSafe = selectedThreat.threat_level === 'safe';
                  
                  // Simple parsing logic for structured responses
                  let verdict = "";
                  let reasoning = "";
                  let tip = "";
                  
                  if (text.includes("Verdict:") || text.includes("Reasoning:")) {
                    const sections = text.split(/\n?(Verdict:|Reasoning:|Safety Tip:|Tip:)/i);
                    for (let i = 1; i < sections.length; i += 2) {
                      const label = sections[i].toLowerCase();
                      const content = sections[i + 1]?.trim();
                      if (label.includes("verdict")) verdict = content;
                      else if (label.includes("reasoning")) reasoning = content;
                      else if (label.includes("tip")) tip = content;
                    }
                  } else {
                    reasoning = text;
                  }
                  
                  return (
                    <div className="relative">
                      <div className={`absolute -top-4 -left-4 w-12 h-12 ${isSafe ? 'bg-green-600' : 'bg-blue-600'} rounded-2xl flex items-center justify-center shadow-xl transform -rotate-6 z-10 border-4 border-white dark:border-slate-900`}>
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className={`bg-gradient-to-br ${
                        isSafe 
                          ? 'from-green-600 to-emerald-700 shadow-green-200/20 dark:shadow-none' 
                          : 'from-blue-600 to-indigo-700 shadow-blue-200/20 dark:shadow-none'
                      } p-8 pt-12 rounded-3xl text-white shadow-2xl overflow-hidden relative`}>
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                           <Shield className="w-32 h-32 rotate-12" />
                        </div>
                        
                        <h4 className={`${isSafe ? 'text-green-100' : 'text-blue-100'} text-[10px] font-black uppercase tracking-[0.3em] mb-4`}>
                          SafeLearn AI Analysis
                        </h4>
                        
                        {verdict && (
                          <div className="mb-4">
                            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                              isSafe ? 'bg-white/20 text-white' : 'bg-white/20 text-white'
                            } border border-white/20 backdrop-blur-md`}>
                              {verdict.replace(/\*\*/g, '')}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-xl font-bold leading-relaxed mb-8 drop-shadow-sm">
                           {reasoning}
                        </p>
                        
                        {tip && (
                          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-start gap-4">
                             <div className="bg-yellow-400 text-yellow-900 rounded-full p-2 flex-shrink-0 mt-0.5 shadow-lg shadow-yellow-400/20">
                               <Zap className="w-4 h-4 fill-current" />
                             </div>
                             <div>
                               <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSafe ? 'text-green-200' : 'text-blue-200'} mb-1`}>Pro Safety Tip</p>
                               <p className="text-sm font-bold text-white/95 leading-snug">{tip}</p>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Risk Indicators Grid */}
                {selectedThreat.risk_indicators && selectedThreat.risk_indicators.length > 0 && (
                  <div className="grid gap-4">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Risk Indicators Found
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {selectedThreat.risk_indicators.map((risk, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200 hover:shadow-md transition-all group">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">{risk.type}</span>
                            <div className={`w-2 h-2 rounded-full ${getThreatColor(risk.severity).dot}`} />
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 font-semibold leading-snug group-hover:text-blue-700 transition-colors">
                            {risk.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Checklist */}
                {selectedThreat.performed_checks && selectedThreat.performed_checks.length > 0 && (
                  <div className="bg-gray-50 dark:bg-slate-800/50 rounded-3xl p-6">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      What We Checked
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selectedThreat.performed_checks.map((check, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          {check}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback Section */}
                <div className="pt-8 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">Was this detection correct?</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Your feedback helps train our safety AI models.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Button
                        variant={feedback[selectedThreat.id] === "helpful" ? "default" : "outline"}
                        onClick={() => handleFeedback(selectedThreat.id, "helpful")}
                        className="flex-1 sm:flex-none gap-2 h-12 px-6 rounded-2xl"
                      >
                        <ThumbsUp className="w-5 h-5" />
                        Accurate
                      </Button>
                      <Button
                        variant={feedback[selectedThreat.id] === "false_alarm" ? "default" : "outline"}
                        onClick={() => handleFeedback(selectedThreat.id, "false_alarm")}
                        className="flex-1 sm:flex-none gap-2 h-12 px-6 rounded-2xl"
                      >
                        <ThumbsDown className="w-5 h-5" />
                        False Alarm
                      </Button>
                    </div>
                  </div>
                  {feedback[selectedThreat.id] && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 rounded-2xl text-center font-bold border border-green-100 animate-in slide-in-from-bottom-2">
                      ✨ Thank you! Your feedback has been recorded.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
