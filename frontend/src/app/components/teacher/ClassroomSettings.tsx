import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Settings, Loader2, ArrowLeft, Copy, Check, RefreshCw, Shield, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Link } from "react-router-dom";
import classroomApi from "../../api/classroom";
import { toast } from "sonner";

interface Classroom {
  id: number;
  name: string;
  description: string;
  unique_code: string;
  approval_mode: boolean;
}

export function ClassroomSettings() {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [approvalMode, setApprovalMode] = useState(true);

  useEffect(() => {
    const fetchClassroom = async () => {
      try {
        const data = await classroomApi.getMyClassroom();
        setClassroom(data);
        if (data) {
          setName(data.name);
          setDescription(data.description || "");
          setApprovalMode(data.approval_mode);
        }
      } catch (error) {
        console.error("Failed to fetch classroom:", error);
        toast.error("Failed to load classroom settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassroom();
  }, []);

  const handleCopyCode = () => {
    if (classroom?.unique_code) {
      navigator.clipboard.writeText(classroom.unique_code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Code copied to clipboard");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!classroom) {
        const data = await classroomApi.createClassroom({
           name,
           description,
           approval_mode: approvalMode
        });
        setClassroom(data);
        toast.success("Classroom created successfully!");
      } else {
        // Placeholder for update logic
        toast.info("Classroom updates will be available in the next version.");
      }
    } catch (error) {
      console.error("Failed to save classroom:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Classroom Settings</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your classroom identity and invitation codes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle>Global Identity</CardTitle>
              <CardDescription>How students identify your classroom</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Classroom Name</Label>
                  <Input 
                    id="className" 
                    placeholder="e.g. CS101 - Cybersecurity Fundamentals" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classDesc">Description (Optional)</Label>
                  <textarea 
                    id="classDesc"
                    className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Short description of your class..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="approvalMode" 
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={approvalMode}
                    onChange={(e) => setApprovalMode(e.target.checked)}
                  />
                  <Label htmlFor="approvalMode" className="text-sm font-medium cursor-pointer">
                    Require teacher approval for new students
                  </Label>
                </div>

                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
                  {classroom ? "Save Settings" : "Create Classroom"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-red-200 bg-red-50/30 dark:bg-red-900/10 dark:border-red-900/30">
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your classroom</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-100">
                Archive Classroom
              </Button>
              <p className="text-xs text-red-500 mt-2">Archiving will disconnect all students and stop tracking.</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-2 shadow-sm bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-blue-100 dark:border-slate-700 overflow-hidden">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Invitation Code</CardTitle>
              <CardDescription>Share this code with your students</CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              {classroom ? (
                <div className="space-y-4">
                  <div className="text-4xl font-mono font-black tracking-widest text-blue-700 dark:text-blue-400 py-4 bg-white/50 dark:bg-slate-950/50 rounded-lg border border-blue-200 dark:border-slate-700">
                    {classroom.unique_code}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 bg-white/80 dark:bg-slate-800"
                      onClick={handleCopyCode}
                    >
                      {isCopied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                      {isCopied ? "Copied" : "Copy Code"}
                    </Button>
                    <Button variant="outline" className="w-12 px-0 bg-white/80 dark:bg-slate-800" title="Regenerate Code">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-gray-500">
                  <Info className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Create a classroom first to generate an invitation code.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Integration Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-800">
                <p className="font-bold mb-1">Step 1:</p>
                <p>Ensure students select the "Student" role during registration.</p>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-800">
                <p className="font-bold mb-1">Step 2:</p>
                <p>Ask them to enter your invitation code in their dashboard.</p>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-900 p-3 rounded border dark:border-slate-800">
                <p className="font-bold mb-1">Step 3:</p>
                <p>Approve their requests in the "Join Requests" tab.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}