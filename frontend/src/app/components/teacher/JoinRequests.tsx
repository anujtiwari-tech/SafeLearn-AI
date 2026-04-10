import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Users, Loader2, ArrowLeft, Check, X, Clock, Mail, Shield } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import teacherApi from "../../api/teacher";  // ← FIXED PATH
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface JoinRequest {
  id: number;
  student_id: number;
  student_name: string | null;
  student_email: string;
  status: string;
  requested_at: string;
}

export function JoinRequests() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      const data = await teacherApi.getRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
      toast.error("Failed to load join requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (id: number, status: 'approved' | 'rejected') => {
    setIsProcessing(id);
    try {
      await teacherApi.reviewRequest(id, status);
      toast.success(`Request ${status} successfully`);
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error(`Failed to ${status} request:`, error);
      toast.error(`Failed to ${status} request`);
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-gray-500">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </Button>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Join Requests</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Manage students waiting to join your classroom</p>
      </div>

      <Card className="border-2 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/50 dark:bg-slate-900/50 border-b dark:border-slate-800">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Pending Approval ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y dark:divide-slate-800">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                      {(request.student_name || request.student_email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">{request.student_name || "New Student"}</h4>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {request.student_email}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Requested {formatDistanceToNow(new Date(request.requested_at))} ago
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleReview(request.id, 'rejected')}
                      disabled={isProcessing === request.id}
                    >
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleReview(request.id, 'approved')}
                      disabled={isProcessing === request.id}
                    >
                      {isProcessing === request.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                      Approve
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">All caught up!</h3>
                <p className="text-gray-500">There are no pending join requests at the moment.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-4 rounded-xl">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-900 dark:text-blue-400">About Approvals</h4>
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              Once approved, students will appear in your Tracking list and you'll be able to see their real-time security alerts. You can change to automatic approval in your classroom settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}