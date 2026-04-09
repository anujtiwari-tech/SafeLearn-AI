import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Shield, Calendar, Edit2, Save, X, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/auth");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditedName(parsedUser.full_name || parsedUser.name || parsedUser.email?.split('@')[0] || "User");
    }
  }, [navigate]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Update user in localStorage
      const updatedUser = { ...user, name: editedName };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      
      // Force refresh to update header
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedName(user?.full_name || user?.name || user?.email?.split('@')[0] || "User");
    setIsEditing(false);
  };

  if (!user) return null;

  const getInitials = () => {
    const name = user.full_name || user.name || user.email?.split('@')[0] || "User";
    return name.charAt(0).toUpperCase();
  };

  const getMemberSince = () => {
    // You can store this during signup
    const memberSince = localStorage.getItem("memberSince");
    if (memberSince) return new Date(memberSince).toLocaleDateString();
    return "April 2026";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card - Left Sidebar */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              {/* Large Avatar */}
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl font-bold shadow-lg">
                {getInitials()}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                {user.full_name || user.name || user.email?.split('@')[0]}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              {/* {user.mode === "guest" && (
                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700">
                  Guest Mode
                </span>
              )} */}
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Account Type: {user.mode === "guest" ? "Demo" : "Registered"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>Member Since: {getMemberSince()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Right Side */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile} disabled={loading}>
                      <Save className="w-4 h-4 mr-1" />
                      {loading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Email Field (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="pl-10 bg-gray-50 dark:bg-slate-800/50"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your password regularly</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled={user.mode === "guest"}>
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled={user.mode === "guest"}>
                  Setup
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone - Only for registered users */}
          {user.mode !== "guest" && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}