import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Users, UserPlus, LogOut, CheckCircle, Clock, Loader2 } from "lucide-react";
import { classroomApi } from "../../../api/classroom";
import { toast } from "sonner";

export function ClassroomInfoCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await classroomApi.getStatus();
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch classroom status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setIsJoining(true);
    try {
      const response = await classroomApi.join(code.toUpperCase());
      toast.success(response.data.status === "approved" ? "Joined classroom!" : "Join request sent!");
      fetchStatus();
    } catch (error: any) {
      toast.error(error.detail || "Failed to join classroom");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this classroom?")) return;
    
    try {
      await classroomApi.leave();
      toast.info("Left classroom");
      setData(null);
      fetchStatus();
    } catch (error) {
      toast.error("Failed to leave classroom");
    }
  };

  if (loading) return <div className="h-32 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />;

  const classroom = data?.classroom;
  const status = data?.request_status;

  if (classroom && status === "approved") {
    return (
      <Card className="border-2 border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Your Classroom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{classroom.name}</h3>
              <p className="text-xs text-muted-foreground">Managed by your instructor</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 gap-1">
                <CheckCircle className="w-3 h-3" /> Active
              </Badge>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 p-0" onClick={handleLeave}>
                 Leave Class
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (classroom && status === "pending") {
    return (
      <Card className="border-2 border-amber-100 bg-amber-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
            <Clock className="w-4 h-4" />
            Join Request Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-amber-800">Your request to join <strong>{classroom.name}</strong> is waiting for teacher approval.</p>
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={fetchStatus}>
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-gray-500" />
          Join a Classroom
        </CardTitle>
        <CardDescription className="text-xs">Connect with your teacher for guided learning.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleJoin} className="flex gap-2">
          <Input 
            placeholder="Enter Code" 
            value={code} 
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="h-9 text-sm font-mono tracking-widest"
          />
          <Button type="submit" size="sm" disabled={isJoining || !code} className="bg-blue-600">
            {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
