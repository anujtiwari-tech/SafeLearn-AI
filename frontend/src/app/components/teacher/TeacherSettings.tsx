import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { 
  Settings, 
  Copy, 
  RotateCcw, 
  Save, 
  Check, 
  GraduationCap, 
  Info,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { teacherApi } from "../../../api/teacher";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";

export function TeacherSettings() {
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [approvalMode, setApprovalMode] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await teacherApi.updateSettings({}); // Empty object to just get current
      setClassroom(response.data);
      setName(response.data.name);
      setApprovalMode(response.data.approval_mode);
    } catch (error) {
      console.error("Failed to fetch classroom settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCopyCode = () => {
    if (classroom?.unique_code) {
      navigator.clipboard.writeText(classroom.unique_code);
      setCopied(true);
      toast.success("Classroom code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await teacherApi.updateSettings({
        classroom_name: name,
        approval_mode: approvalMode
      });
      setClassroom(response.data);
      toast.success("Classroom settings updated successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm("Are you sure? Old classroom code will no longer work for new students.")) return;
    
    try {
      setSaving(true);
      const response = await teacherApi.updateSettings({
        regenerate_code: true
      });
      setClassroom(response.data);
      toast.success("New classroom code generated");
    } catch (error) {
      toast.error("Failed to regenerate code");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-6">
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>;
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Classroom Settings</h1>
        <p className="text-muted-foreground">Manage your classroom identity and joining policies.</p>
      </div>

      {/* Code Card */}
      <Card className="bg-blue-600 text-white border-none shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle>Classroom Access Code</CardTitle>
          <CardDescription className="text-blue-100">Share this code with your students to have them join your class.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="flex-1 text-4xl font-mono font-bold tracking-[0.2em]">
              {classroom?.unique_code}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="gap-2"
                onClick={handleCopyCode}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/10"
                onClick={handleRegenerate}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Regenerate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            General Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="className">Classroom Name</Label>
            <Input 
              id="className" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. CS101 - Cybersecurity Fundamentals"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border">
            <div className="space-y-0.5">
              <Label className="text-base">Manual Approval</Label>
              <p className="text-sm text-muted-foreground">Require teacher approval for students who join using your code.</p>
            </div>
            <Switch 
              checked={approvalMode} 
              onCheckedChange={setApprovalMode} 
            />
          </div>
          
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 flex gap-3 text-amber-800 dark:text-amber-200">
             <Info className="w-5 h-5 shrink-0 mt-0.5" />
             <div className="text-sm">
               <p className="font-semibold">Important about classroom codes:</p>
               <p className="opacity-80">Students can join using the code. If Manual Approval is OFF, they will be granted access immediately. If it's ON, you'll need to approve them in the Requests tab.</p>
             </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button 
            className="ml-auto gap-2 bg-blue-600" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </Button>
        </CardFooter>
      </Card>
      
      {/* Help Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-green-100 dark:border-green-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-400">
              <ShieldCheck className="w-4 h-4" /> Security Tip
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Regularly monitor the student tracking board. If a student's security score drops below 50%, consider assigning them specific learning modules in the Learning Hub.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
