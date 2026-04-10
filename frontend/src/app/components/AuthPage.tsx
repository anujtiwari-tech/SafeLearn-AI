import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Shield, Lock, Mail, User, Loader2, Users, GraduationCap } from "lucide-react";
import { authApi } from "../../api/auth";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [classroomCode, setClassroomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const loginData = await authApi.login(email, password);
        // User data (including role) is now stored in localStorage by authApi.login
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        toast.success(`Welcome back, ${storedUser.role || "User"}!`);
        
        if (storedUser.role === "teacher") {
          navigate("/teacher/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        await authApi.register({ 
          email, 
          password, 
          full_name: fullName, 
          role,
          classroom_code: role === "student" ? classroomCode : undefined
        });
        toast.success("Account created! Please sign in.");
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      let errorMessage = "Authentication failed. Please try again.";
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          errorMessage = error.detail.map((err: any) => err.msg).join(", ");
        } else {
          errorMessage = error.detail;
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SafeLearn AI</h1>
          <p className="text-gray-600 dark:text-gray-400">Secure Learning for Everyone</p>
        </div>

        {/* Auth Card */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin ? "Sign in to access your dashboard" : "Join us to start learning"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {!isLogin && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Join as</Label>
                    <Tabs value={role} onValueChange={(v: any) => setRole(v)} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="student" className="flex items-center gap-2">
                          <Users className="w-4 h-4" /> Student
                        </TabsTrigger>
                        <TabsTrigger value="teacher" className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" /> Teacher
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required={!isLogin}
                      />
                    </div>
                  </div>

                  {role === "student" && (
                    <div className="space-y-2">
                      <Label htmlFor="classroomCode">Classroom Code (Optional)</Label>
                      <Input
                        id="classroomCode"
                        type="text"
                        placeholder="ENTER-CODE"
                        value={classroomCode}
                        onChange={(e) => setClassroomCode(e.target.value.toUpperCase())}
                        maxLength={12}
                      />
                      <p className="text-[10px] text-gray-500 italic">Enter your teacher's code to join their classroom immediately.</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                {!isLogin && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/50 p-2 rounded border border-gray-100 dark:border-slate-800 mt-1">
                    <p className="font-semibold mb-1">Security Requirements:</p>
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                      <li className={password.length >= 8 ? "text-green-600" : ""}>• Min. 8 characters</li>
                      <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>• 1 Upper Case</li>
                      <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>• 1 Lower Case</li>
                      <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>• 1 Number</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isLogin ? "Sign In" : "Sign Up"}
              </Button>
              
              <button
                type="button"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => setIsLogin(!isLogin)}
                disabled={isLoading}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
