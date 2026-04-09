import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Shield, Lock, Mail, User, Loader2 } from "lucide-react";
import { authApi } from "../../api/auth";
import { toast } from "sonner";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await authApi.login(email, password);
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else {
        await authApi.register({ email, password, full_name: fullName });
        toast.success("Account created! Please sign in.");
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Handle FastAPI validation error detail (often an array)
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

  // const handleGuestMode = () => {
  //   // Set guest mode
  //   localStorage.setItem("user", JSON.stringify({ email: "guest@demo.com", mode: "guest", token: "guest-token" }));
  //   toast.info("Continuing in Demo Mode");
  //   navigate("/dashboard");
  // };

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

              {/* Privacy Badge */}
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">Privacy Promise</p>
                  <p className="text-green-700">We never sell your data. End-to-end encrypted.</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3">
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
