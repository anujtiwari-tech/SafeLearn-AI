import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent } from "./ui/dialog";
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
  Zap,
  Skull
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
  consequences?: string;
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
  const [showConsequences, setShowConsequences] = useState(false);
  
  // Filter and Sort States
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [sourceFilter, setSourceFilter] = useState<"all" | "web" | "email">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "3" | "5" | "7" | "30">("all");

  useEffect(() => {
    fetchThreats();
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
      case "critical": return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", badge: "bg-red-600" };
      case "high": return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", badge: "bg-orange-600" };
      case "medium": return { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", badge: "bg-yellow-600" };
      case "low": return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", badge: "bg-blue-600" };
      case "safe": return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", badge: "bg-green-600" };
      default: return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", badge: "bg-gray-600" };
    }
  };

  const getScanSource = (url: string) => {
    const isEmail = url?.startsWith("email://") || 
                   url?.includes("mail.google.com") || 
                   url?.includes("outlook.live.com");
    if (isEmail) {
      return { label: "Email Scanning", icon: Mail, color: "text-purple-600", badge: "bg-purple-100 text-purple-700" };
    }
    return { label: "URL Scanning", icon: Globe, color: "text-blue-600", badge: "bg-blue-100 text-blue-700" };
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

    if (sourceFilter !== "all") {
      result = result.filter(t => {
        const isEmail = t.url?.startsWith("email://");
        return sourceFilter === "email" ? isEmail : !isEmail;
      });
    }

    if (dateFilter !== "all") {
      const days = parseInt(dateFilter);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter(t => new Date(t.timestamp) >= cutoff);
    }

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
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading your security history...</p>
      </div>
    );
  }

  const processedThreats = getProcessedThreats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Threat History</h2>
          <p className="text-gray-600 mt-1">Review detections from your extension in real-time</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
            <SelectTrigger className="w-[140px] bg-white border-gray-200">
              <ArrowUpDown className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={(v: any) => setSourceFilter(v)}>
            <SelectTrigger className="w-[140px] bg-white border-gray-200">
              <Filter className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="web">Web Only</SelectItem>
              <SelectItem value="email">Email Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
            <SelectTrigger className="w-[140px] bg-white border-gray-200">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="3">Last 3 Days</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button onClick={fetchThreats} variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {processedThreats.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">All Clear!</h3>
              <p className="text-gray-600 max-w-xs">No threats detected yet. Your extension is actively monitoring for suspicious activity.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {processedThreats.map((threat) => {
            const Icon = getThreatIcon(threat.threat_type);
            const colors = getThreatColor(threat.threat_level);
            const source = getScanSource(threat.url);
            const SourceIcon = source.icon;
            
            return (
              <Card 
                key={threat.id} 
                className={`border-2 ${colors.border} hover:shadow-lg transition-all cursor-pointer group`}
                onClick={() => {
                  setSelectedThreat(threat);
                  setShowConsequences(false);
                }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${colors.bg} flex-shrink-0 relative`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-sm`}>
                        <SourceIcon className={`w-3 h-3 ${source.color}`} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {formatTitle(threat.threat_type)}
                        </h3>
                        <Badge className={`${colors.badge} text-white text-[10px] px-2`}>
                          {threat.threat_level}
                        </Badge>
                        <Badge className={`${source.badge} text-[10px] border-0`}>
                          {source.label}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-500 font-mono break-all mb-2">
                        {threat.url}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(threat.timestamp).toLocaleString()}
                      </div>

                      <div className={`mt-3 p-3 ${colors.bg} rounded-lg border ${colors.border}`}>
                        <div className="flex items-start gap-2">
                          <Brain className={`w-4 h-4 ${colors.text} flex-shrink-0 mt-0.5`} />
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {threat.explanation || "No explanation provided."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-blue-600 font-medium flex items-center gap-1">
                        View Analysis <ExternalLink className="w-3 h-3" />
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedThreat && (
            <div className="space-y-6">
              {/* Header */}
              <div className={`p-6 rounded-2xl ${getThreatColor(selectedThreat.threat_level).bg}`}>
                <div className="flex items-center gap-3 mb-3">
                  <Badge className={`${getThreatColor(selectedThreat.threat_level).badge} text-white`}>
                    {selectedThreat.threat_level} Priority
                  </Badge>
                  {selectedThreat.action_taken === "block" && (
                    <Badge variant="outline" className="bg-white/50 border-red-200 text-red-700">
                      Blocked
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {formatTitle(selectedThreat.threat_type)}
                </h2>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedThreat.timestamp).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    ID: #{selectedThreat.id}
                  </div>
                </div>
              </div>

              {/* URL Section */}
              <div>
                <h4 className="text-sm font-bold text-gray-500 mb-2">Target URL</h4>
                <div className="p-3 bg-gray-50 rounded-xl font-mono text-sm break-all">
                  {selectedThreat.url}
                </div>
              </div>

              {/* AI Explanation */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5" />
                  <h4 className="font-bold">SafeLearn AI Analysis</h4>
                </div>
                <p className="text-white/90 leading-relaxed">
                  {selectedThreat.explanation || "Analysis in progress..."}
                </p>
              </div>

              {/* Advanced Consequences - NEW */}
              {selectedThreat.consequences && 
               selectedThreat.consequences !== "No consequences - this appears safe" &&
               (selectedThreat.threat_level === "high" || selectedThreat.threat_level === "critical") && (
                <div>
                  <button
                    onClick={() => setShowConsequences(!showConsequences)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {showConsequences ? "Hide consequences" : "⚠️ What happens if you continue?"}
                  </button>

                  {showConsequences && (
                    <div className="mt-3 p-5 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                      <div className="flex items-start gap-3">
                        <Skull className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-red-800 mb-2">If you ignore this warning:</p>
                          <div className="space-y-2">
                            {selectedThreat.consequences.split('\n').map((point, idx) => {
                              const cleanPoint = point.replace(/^[•\-*]\s*/, '').trim();
                              if (cleanPoint && cleanPoint.length > 5 && !cleanPoint.includes("No consequences")) {
                                return (
                                  <div key={idx} className="flex items-start gap-2">
                                    <span className="text-red-500">•</span>
                                    <p className="text-sm text-red-800">{cleanPoint}</p>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                          <div className="mt-3 pt-2 border-t border-red-200">
                            <p className="text-xs text-gray-700">
                              <strong>Recommendation:</strong> Close this tab immediately. Do not proceed.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Risk Indicators */}
              {selectedThreat.risk_indicators && selectedThreat.risk_indicators.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-500 mb-3">Risk Indicators</h4>
                  <div className="grid gap-3">
                    {selectedThreat.risk_indicators.map((risk, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-gray-500">{risk.type}</span>
                          <Badge variant="outline" className="text-xs capitalize">{risk.severity}</Badge>
                        </div>
                        <p className="text-sm text-gray-800">{risk.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <div className="pt-4 border-t">
                <h4 className="font-bold text-gray-900 mb-3">Was this detection correct?</h4>
                <div className="flex items-center gap-3">
                  <Button
                    variant={feedback[selectedThreat.id] === "helpful" ? "default" : "outline"}
                    onClick={() => handleFeedback(selectedThreat.id, "helpful")}
                    className="gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Helpful
                  </Button>
                  <Button
                    variant={feedback[selectedThreat.id] === "false_alarm" ? "default" : "outline"}
                    onClick={() => handleFeedback(selectedThreat.id, "false_alarm")}
                    className="gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    False Alarm
                  </Button>
                </div>
                {feedback[selectedThreat.id] && (
                  <p className="mt-3 text-sm text-green-600">
                    Thank you for your feedback!
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}