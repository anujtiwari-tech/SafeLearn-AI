import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { UserPlus, Check, X, Mail, Calendar, Loader2 } from "lucide-react";
import { teacherApi } from "../../../api/teacher";
import { Skeleton } from "../ui/skeleton";
import { toast } from "sonner";

export function RequestManagement() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRequests = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await teacherApi.getRequests();
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    setProcessingId(id);
    try {
      if (action === "approve") {
        await teacherApi.approveRequest(id);
        toast.success("Student approved and added to classroom");
      } else {
        await teacherApi.rejectRequest(id);
        toast.info("Request rejected");
      }
      
      // Optimistic update
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (error) {
       console.error(`Failed to ${action} request:`, error);
       toast.error(`Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Classroom Requests</h1>
        <p className="text-muted-foreground">Manage students waiting to join your classroom.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : requests.length > 0 ? (
          requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <h3 className="font-semibold text-lg">{request.student_name || "Unknown Student"}</h3>
                       <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> {request.student_email}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Requested {new Date(request.requested_at).toLocaleDateString()} at {new Date(request.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 flex items-center gap-3 border-t md:border-t-0 md:border-l">
                  <Button 
                    variant="outline" 
                    className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    disabled={processingId === request.id}
                    onClick={() => handleAction(request.id, "reject")}
                  >
                    <X className="w-4 h-4" /> Reject
                  </Button>
                  <Button 
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                    disabled={processingId === request.id}
                    onClick={() => handleAction(request.id, "approve")}
                  >
                    {processingId === request.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve Access
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="border-dashed py-12">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                 <UserPlus className="w-8 h-8 text-slate-400" />
               </div>
               <div className="space-y-1">
                 <h3 className="font-semibold text-xl">No active requests</h3>
                 <p className="text-muted-foreground max-w-xs">When students use your classroom code, they will appear here for approval.</p>
               </div>
               <Button variant="outline" onClick={() => fetchRequests(true)}>Refresh Status</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
