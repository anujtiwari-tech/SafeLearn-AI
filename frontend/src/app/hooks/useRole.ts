import { useState, useEffect } from "react";

export function useRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setRole(user.role || "student");
      } catch (e) {
        console.error("Failed to parse user role");
      }
    }
    setLoading(false);
  }, []);

  const isTeacher = role === "teacher";
  const isStudent = role === "student";
  const isAdmin = role === "admin";

  return { role, isTeacher, isStudent, isAdmin, loading };
}
