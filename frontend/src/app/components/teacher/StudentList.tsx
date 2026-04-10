import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Users, Shield, Loader2, Search, ArrowLeft, Mail, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Link } from "react-router-dom";
import teacherApi from "../../../api/teacher";
import { toast } from "sonner";
import { Progress } from "../ui/progress";

interface Student {
  id: number;
  full_name: string | null;
  email: string;
  security_score: number;
  total_threats: number;
  lessons_completed: number;
  total_lessons: number;
  last_active: string | null;
}

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await teacherApi.getStudents();
        setStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        toast.error("Failed to load students");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    (s.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-gray-500">
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
          </Button>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Student Tracking</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Monitor individual security progress and metrics</p>
        </div>
      </div>

      <Card className="border-2 shadow-sm overflow-hidden">
        <CardHeader className="bg-gray-50/50 dark:bg-slate-900/50 border-b dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Class Roster ({students.length})
            </CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search students..."
                className="pl-9 bg-white dark:bg-slate-950"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-900/30 border-b dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Security Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Learning Progress</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Threats</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const progress = Math.round((student.lessons_completed / student.total_lessons) * 100);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                              {(student.full_name || student.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
                                {student.full_name || "New Student"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             <div className={`text-lg font-bold ${
                               student.security_score >= 80 ? 'text-green-600' : 
                               student.security_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                             }`}>
                               {student.security_score}
                             </div>
                             <div className="w-16">
                               <Progress value={student.security_score} className="h-1.5" />
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">{student.lessons_completed}/{student.total_lessons} lessons</span>
                              <span className="text-xs font-medium text-gray-900 dark:text-white">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.total_threats > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {student.total_threats} alerts
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <ExternalLink className="w-4 h-4 mr-1" /> Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? "No students match your search." : "No students in your classroom yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
