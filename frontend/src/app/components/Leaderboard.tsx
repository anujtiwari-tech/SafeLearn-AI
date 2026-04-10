import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  BookOpen, 
  Shield,
  Star,
  Loader2
} from "lucide-react";
import api from "../../api/axios";

interface LeaderboardStudent {
  id: string;
  name: string;
  email: string;
  security_score: number;
  lessons_completed: number;
  total_points: number;
  streak: number;
  badges_count: number;
  rank?: number;
}

interface LeaderboardProps {
  limit?: number;
}

export function Leaderboard({ limit = 10 }: LeaderboardProps) {
  const [students, setStudents] = useState<LeaderboardStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFrame]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/learning/leaderboard", {
        params: { timeframe: timeFrame, limit }
      });
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      // Fallback to mock data if API not ready
      setStudents(getMockLeaderboardData());
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 70) return "text-blue-600 dark:text-blue-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Student Leaderboard
            </CardTitle>
            <CardDescription>
              Top performers ranked by security score and lessons completed
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFrame('all')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeFrame === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFrame('month')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeFrame === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeFrame('week')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeFrame === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              This Week
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Security Score
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lessons
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Streak
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Badges
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {students.map((student, index) => (
                <tr 
                  key={student.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    index === 0 ? 'bg-yellow-50/50 dark:bg-yellow-950/10' : ''
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {getRankIcon(index + 1)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                          {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className={`font-bold ${getScoreColor(student.security_score)}`}>
                        {student.security_score}
                      </span>
                      <span className="text-xs text-gray-500">/100</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <BookOpen className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {student.lessons_completed}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-purple-500" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {student.total_points.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30">
                      🔥 {student.streak} days
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      🏆 {student.badges_count}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Mock data for fallback when API is not ready
function getMockLeaderboardData(): LeaderboardStudent[] {
  return [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex.j@example.com",
      security_score: 98,
      lessons_completed: 24,
      total_points: 2850,
      streak: 15,
      badges_count: 8
    },
    {
      id: "2",
      name: "Sarah Williams",
      email: "sarah.w@example.com",
      security_score: 95,
      lessons_completed: 22,
      total_points: 2670,
      streak: 12,
      badges_count: 7
    },
    {
      id: "3",
      name: "Michael Chen",
      email: "michael.c@example.com",
      security_score: 92,
      lessons_completed: 21,
      total_points: 2490,
      streak: 10,
      badges_count: 6
    },
    {
      id: "4",
      name: "Emma Davis",
      email: "emma.d@example.com",
      security_score: 88,
      lessons_completed: 19,
      total_points: 2210,
      streak: 8,
      badges_count: 5
    },
    {
      id: "5",
      name: "James Wilson",
      email: "james.w@example.com",
      security_score: 85,
      lessons_completed: 18,
      total_points: 2080,
      streak: 7,
      badges_count: 5
    },
    {
      id: "6",
      name: "Lisa Brown",
      email: "lisa.b@example.com",
      security_score: 82,
      lessons_completed: 17,
      total_points: 1950,
      streak: 6,
      badges_count: 4
    },
    {
      id: "7",
      name: "David Lee",
      email: "david.l@example.com",
      security_score: 78,
      lessons_completed: 15,
      total_points: 1780,
      streak: 4,
      badges_count: 4
    },
    {
      id: "8",
      name: "Maria Garcia",
      email: "maria.g@example.com",
      security_score: 75,
      lessons_completed: 14,
      total_points: 1620,
      streak: 3,
      badges_count: 3
    },
    {
      id: "9",
      name: "Thomas Anderson",
      email: "thomas.a@example.com",
      security_score: 70,
      lessons_completed: 12,
      total_points: 1450,
      streak: 2,
      badges_count: 3
    },
    {
      id: "10",
      name: "Olivia Martinez",
      email: "olivia.m@example.com",
      security_score: 65,
      lessons_completed: 10,
      total_points: 1280,
      streak: 1,
      badges_count: 2
    }
  ];
}