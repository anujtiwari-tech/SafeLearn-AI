import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Trophy, 
  Shield, 
  Target, 
  Zap, 
  Award,
  BookOpen,
  CheckCircle,
  Lock,
  TrendingUp,
  Loader2,
  ArrowRight,
  Sparkles,
  Brain,
  TrophyIcon,
  Video,
  Play
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../../api/axios";
import { toast } from "sonner";
import { quizzes, isQuizCompleted } from "../data/quizzes";
import { VideoModal } from "./VideoModal";

interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  points: number;
  content?: string;
  status: 'not_started' | 'started' | 'completed';
  completed_at?: string;
}

interface LearningProgress {
  total_points: number;
  lessons_completed: number;
  completion_rate: number;
  badges_earned: string[];
  streak: number;
}

// Map of badge names to icons and colors
const badgeMeta: Record<string, { icon: any, color: string, description: string }> = {
  "🛡️ Privacy Guardian": { icon: Shield, color: "bg-green-50 dark:bg-green-900/200", description: "Completed your first security training module." },
  "🏆 Security Expert": { icon: Award, color: "bg-purple-500", description: "Completed 3 or more advanced security modules." },
  "🛡️ Threat Hunter": { icon: Target, color: "bg-red-50 dark:bg-red-900/200", description: "Blocked 5 or more threats this month." },
  "🏆 Security Pro": { icon: Trophy, color: "bg-yellow-50 dark:bg-yellow-900/200", description: "Reached a security score of 80 or higher." },
  "7-Day Streak": { icon: Zap, color: "bg-orange-50 dark:bg-orange-900/200", description: "Maintained a 7-day learning streak." },
  "🎓 Quiz Master": { icon: Brain, color: "bg-indigo-500", description: "Completed all 5 cybersecurity quizzes with 70%+ score." },
  "🏆 Phishing Hunter": { icon: Target, color: "bg-cyan-500", description: "Passed the Phishing Detection Quiz." },
  "🎬 Video Watcher": { icon: Video, color: "bg-red-500", description: "Watched 5 or more animated cybersecurity videos." },
};

const progressData = [
  { date: "Feb 26", score: 65 },
  { date: "Mar 5", score: 70 },
  { date: "Mar 12", score: 75 },
  { date: "Mar 19", score: 82 },
  { date: "Mar 26", score: 87 },
];

// List of all video IDs for tracking
const videoIds = [
  { id: "Jl8E_2tNw5g", title: "What is Phishing?" },
  { id: "e7AbAogEHIM", title: "Strong Passwords" },
  { id: "jBzhNM16KD0", title: "What is Malware?" },
  { id: "Iss2-kXVEYE", title: "Remote Work Security" },
  { id: "", title: "How to be a Cyber Superhero" },
  { id: "", title: "Why Cyber Security Matters" },
  { id: "", title: "How Cyber Professionals Help" },
  { id: "", title: "DIY Password Method" },
  { id: "", title: "GDPR Explained" },
  { id: "", title: "Katie & Tex - Ethical Hacking" },
];

export function LearningHubPage() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quizCompletions, setQuizCompletions] = useState<Record<string, boolean>>({});
  const [videoCompletions, setVideoCompletions] = useState<Record<string, boolean>>({});
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    loadQuizCompletions();
    loadVideoCompletions();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [modulesRes, progressRes] = await Promise.all([
        api.get("/learning/modules"),
        api.get("/learning/progress")
      ]);
      setModules(modulesRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      console.error("Error fetching learning data:", error);
      toast.error("Failed to load learning modules");
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuizCompletions = () => {
    const completions: Record<string, boolean> = {};
    quizzes.forEach(quiz => {
      completions[quiz.id] = isQuizCompleted(quiz.id);
    });
    setQuizCompletions(completions);
  };

  const loadVideoCompletions = () => {
    const saved = localStorage.getItem('videoCompletions');
    if (saved) {
      setVideoCompletions(JSON.parse(saved));
    }
  };

  const markVideoAsWatched = (videoId: string) => {
    if (!videoId) return;
    const updatedCompletions = { ...videoCompletions, [videoId]: true };
    setVideoCompletions(updatedCompletions);
    localStorage.setItem('videoCompletions', JSON.stringify(updatedCompletions));
  };

  const handleQuizClick = (quizId: string) => {
    navigate(`/dashboard/quiz/${quizId}`);
  };

  const openVideoModal = (videoId: string, title: string) => {
    if (!videoId) {
      toast.info("This video is coming soon!");
      return;
    }
    setSelectedVideo({ id: videoId, title });
    markVideoAsWatched(videoId);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const totalQuizzes = quizzes.length;
  const completedQuizzes = Object.values(quizCompletions).filter(v => v === true).length;
  const quizCompletionRate = totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0;
  
  const totalVideos = videoIds.filter(v => v.id).length;
  const videoCompletionsCount = Object.values(videoCompletions).filter(v => v === true).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  let earnedBadgesCount = progress?.badges_earned.length || 0;
  if (completedQuizzes >= 5) earnedBadgesCount += 1;
  if (quizCompletions["quiz-phishing"] === true) earnedBadgesCount += 1;
  if (videoCompletionsCount >= 5) earnedBadgesCount += 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Hub</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Build your security knowledge and earn real-world rewards</p>
        </div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
          <Zap className="w-5 h-5 fill-current" />
          <span className="font-bold">{progress?.streak || 0} Day Streak</span>
        </div>
      </div>

      {/* Stats Overview - 5 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Card 1: Total Points */}
        <Card className="border-2 border-purple-100 bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-100">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{progress?.total_points || 0}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Lessons Completed */}
        <Card className="border-2 border-blue-100 bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{progress?.lessons_completed || 0}/{modules.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lessons</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Quizzes Completed */}
        <Card className="border-2 border-green-100 bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30">
                <Brain className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{completedQuizzes}/{totalQuizzes}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Videos Watched - NEW */}
        <Card className="border-2 border-red-100 bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30">
                <Video className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{videoCompletionsCount}/{totalVideos+6}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Badges Earned */}
        <Card className="border-2 border-yellow-100 bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{earnedBadgesCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Left: Badges + Modules | Right: Progress + Videos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN - Badge Collection + Available Modules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Badge Collection */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b dark:bg-slate-800">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                Your Badge Collection
              </CardTitle>
              <CardDescription>Earn badges by completing lessons, quizzes, and watching videos</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Object.entries(badgeMeta).map(([name, meta]) => {
                  let isEarned = false;
                  if (name === "🎓 Quiz Master") {
                    isEarned = completedQuizzes >= 5;
                  } else if (name === "🏆 Phishing Hunter") {
                    isEarned = quizCompletions["quiz-phishing"] === true;
                  } else if (name === "🎬 Video Watcher") {
                    isEarned = videoCompletionsCount >= 5;
                  } else {
                    isEarned = progress?.badges_earned.includes(name) || false;
                  }
                  const Icon = meta.icon;
                  return (
                    <div 
                      key={name} 
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all relative group ${
                        isEarned 
                          ? "bg-white dark:bg-slate-900 border-blue-100 hover:shadow-md hover:border-blue-300" 
                          : "bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800 opacity-50 grayscale"
                      }`}
                    >
                      <div className={`flex items-center justify-center w-16 h-16 rounded-full ${
                        isEarned ? meta.color : "bg-gray-300 dark:bg-gray-700"
                      } mb-3 shadow-sm`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-sm font-bold text-center text-gray-900 dark:text-white mb-1">
                        {name.replace(/[^\w\s]/g, '').trim()}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center line-clamp-2">
                        {meta.description}
                      </p>
                      {isEarned && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Available Modules */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Available Modules
            </h3>
            <div className="space-y-3">
              {modules.map((module) => (
                <Card 
                  key={module.id}
                  className="border-2 hover:shadow-md transition-all cursor-pointer overflow-hidden hover:border-blue-200"
                  onClick={() => navigate(`/dashboard/learn/${module.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      <div className={`w-2 flex-shrink-0 ${
                        module.status === 'completed' ? "bg-green-500" : "bg-blue-500"
                      }`} />
                      <div className="flex-1 p-4 flex items-center gap-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                          module.status === 'completed' ? "bg-green-50 dark:bg-green-900/20" : "bg-blue-50 dark:bg-blue-900/20"
                        } flex-shrink-0`}>
                          {module.status === 'completed' ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{module.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px]">
                                {module.duration}
                              </Badge>
                              <Badge className="bg-purple-600 text-white text-[10px]">
                                +{module.points} pts
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{module.description}</p>
                        </div>
                        
                        <div className="flex-shrink-0 ml-2">
                          {module.status === 'completed' ? (
                            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700">✅ Done</Badge>
                          ) : (
                            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quizzes Section */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Test Your Knowledge - Quizzes
              </h3>
              <div className="grid gap-3">
                {quizzes.map((quiz) => {
                  const completed = quizCompletions[quiz.id];
                  return (
                    <Card 
                      key={quiz.id}
                      className={`border-2 hover:shadow-md transition-all cursor-pointer overflow-hidden ${
                        completed ? 'border-green-200 bg-green-50/30 dark:bg-green-900/10' : 'hover:border-purple-200'
                      }`}
                      onClick={() => handleQuizClick(quiz.id)}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-stretch">
                          <div className={`w-2 flex-shrink-0 ${completed ? 'bg-green-500' : 'bg-purple-500'}`} />
                          <div className="flex-1 p-4 flex items-center gap-4">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${
                              completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-purple-50 dark:bg-purple-900/20'
                            } flex-shrink-0`}>
                              <span className="text-2xl">{quiz.icon}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 dark:text-white truncate">{quiz.title}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-[10px]">
                                    ⏱️ {quiz.duration}
                                  </Badge>
                                  <Badge className="bg-purple-600 text-white text-[10px]">
                                    +{quiz.points} pts
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{quiz.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline" className="text-[10px] text-purple-600">
                                  {quiz.questions.length} Questions
                                </Badge>
                                <Badge variant="outline" className="text-[10px] text-yellow-600">
                                  Passing: {quiz.passingScore}%
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex-shrink-0 ml-2">
                              {completed ? (
                                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700">✅ Completed</Badge>
                              ) : (
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                  Start Quiz
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Overall Progress + Video Lessons */}
        <div className="space-y-6">
          {/* Overall Progress Card */}
          <Card className="border-2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-24 h-24" />
            </div>
            <CardContent className="pt-6 relative z-10">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Overall Progress
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium opacity-90">
                    <span>Course Completion</span>
                    <span>{progress?.completion_rate || 0}%</span>
                  </div>
                  <Progress value={progress?.completion_rate || 0} className="h-2 bg-white/20" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium opacity-90">
                    <span>Quiz Completion</span>
                    <span>{quizCompletionRate}%</span>
                  </div>
                  <Progress value={quizCompletionRate} className="h-2 bg-white/20" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1 font-medium opacity-90">
                    <span>Video Completion</span>
                    <span>{totalVideos > 0 ? Math.round((videoCompletionsCount / totalVideos) * 100) : 0}%</span>
                  </div>
                  <Progress value={totalVideos > 0 ? (videoCompletionsCount / totalVideos) * 100 : 0} className="h-2 bg-white/20" />
                </div>
                <div className="pt-2">
                  <p className="text-xs opacity-80 leading-relaxed italic">
                    "Knowledge is the best defense. Each lesson, quiz, and video you complete increases your security resilience."
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quiz Achievement Card */}
          {completedQuizzes === totalQuizzes && (
            <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
              <CardContent className="pt-6 text-center">
                <TrophyIcon className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-bold text-gray-900 dark:text-white">Quiz Champion! 🎉</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  You've completed all {totalQuizzes} quizzes!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Video Achievement Card */}
          {videoCompletionsCount === totalVideos && totalVideos > 0 && (
            <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
              <CardContent className="pt-6 text-center">
                <Video className="w-12 h-12 text-red-600 mx-auto mb-2" />
                <h4 className="font-bold text-gray-900 dark:text-white">Video Master! 🎬</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  You've watched all {totalVideos} animated videos!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Animated Video Lessons - All Videos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-red-600" />
                Animated Videos
              </h3>
              <Badge className="bg-red-100 text-red-700">{totalVideos} Videos</Badge>
            </div>
            
            <div className="space-y-3">
              {/* Video 1: Phishing */}
              <Card 
                className={`border-2 overflow-hidden hover:shadow-xl transition-all cursor-pointer group hover:border-red-300 ${
                  videoCompletions["Jl8E_2tNw5g"] ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                }`}
                onClick={() => openVideoModal("Jl8E_2tNw5g", "What is Phishing? - Animated Explanation")}
              >
                <div className="flex items-center p-3 gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎣</span>
                      <h4 className="font-bold text-gray-900 text-sm truncate">What is Phishing?</h4>
                      {videoCompletions["Jl8E_2tNw5g"] && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">1:30 min • Spot fake emails</p>
                  </div>
                  {videoCompletions["Jl8E_2tNw5g"] ? (
                    <Badge className="bg-green-100 text-green-700 text-xs">✓ Watched</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs flex-shrink-0">Watch →</Badge>
                  )}
                </div>
              </Card>

              {/* Video 2: Strong Passwords */}
              <Card 
                className={`border-2 overflow-hidden hover:shadow-xl transition-all cursor-pointer group hover:border-red-300 ${
                  videoCompletions["e7AbAogEHIM"] ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                }`}
                onClick={() => openVideoModal("e7AbAogEHIM", "Strong Passwords - Animated Explanation")}
              >
                <div className="flex items-center p-3 gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔐</span>
                      <h4 className="font-bold text-gray-900 text-sm truncate">Strong Passwords</h4>
                      {videoCompletions["e7AbAogEHIM"] && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">1:30 min • Create secure passwords</p>
                  </div>
                  {videoCompletions["e7AbAogEHIM"] ? (
                    <Badge className="bg-green-100 text-green-700 text-xs">✓ Watched</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs flex-shrink-0">Watch →</Badge>
                  )}
                </div>
              </Card>

              {/* Video 3: Malware */}
              <Card 
                className={`border-2 overflow-hidden hover:shadow-xl transition-all cursor-pointer group hover:border-red-300 ${
                  videoCompletions["jBzhNM16KD0"] ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                }`}
                onClick={() => openVideoModal("jBzhNM16KD0", "What is Malware? - Animated Explanation")}
              >
                <div className="flex items-center p-3 gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🦠</span>
                      <h4 className="font-bold text-gray-900 text-sm truncate">What is Malware?</h4>
                      {videoCompletions["jBzhNM16KD0"] && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">1:30 min • Viruses & ransomware</p>
                  </div>
                  {videoCompletions["jBzhNM16KD0"] ? (
                    <Badge className="bg-green-100 text-green-700 text-xs">✓ Watched</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs flex-shrink-0">Watch →</Badge>
                  )}
                </div>
              </Card>

              {/* Video 4: Remote Work Security */}
              <Card 
                className={`border-2 overflow-hidden hover:shadow-xl transition-all cursor-pointer group hover:border-red-300 ${
                  videoCompletions["Iss2-kXVEYE"] ? 'border-green-300 bg-green-50/30' : 'border-gray-200'
                }`}
                onClick={() => openVideoModal("Iss2-kXVEYE", "Remote Work Security - Animated Explanation")}
              >
                <div className="flex items-center p-3 gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏠</span>
                      <h4 className="font-bold text-gray-900 text-sm truncate">Remote Work Security</h4>
                      {videoCompletions["Iss2-kXVEYE"] && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">1:30 min • Safe home office</p>
                  </div>
                  {videoCompletions["Iss2-kXVEYE"] ? (
                    <Badge className="bg-green-100 text-green-700 text-xs">✓ Watched</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs flex-shrink-0">Watch →</Badge>
                  )}
                </div>
              </Card>

              {/* Video 5-10: Coming Soon Videos */}
              {videoIds.slice(4).map((video, index) => (
                <Card 
                  key={index}
                  className="border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group hover:border-red-300 opacity-60"
                  onClick={() => video.id ? openVideoModal(video.id, video.title) : toast.info("This video is coming soon!")}
                >
                  <div className="flex items-center p-3 gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center flex-shrink-0">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⏳</span>
                        <h4 className="font-bold text-gray-500 text-sm truncate">{video.title}</h4>
                      </div>
                      <p className="text-xs text-gray-400">Coming soon</p>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0 text-gray-400">Soon</Badge>
                  </div>
                </Card>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              🎬 {totalVideos} animated videos • Click any to watch (~90 seconds to 4 minutes each)
            </p>
          </div>
        </div>
      </div>

      {/* Video Modal - Opens when any video card is clicked */}
      {selectedVideo && selectedVideo.id && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={closeVideoModal}
          videoId={selectedVideo.id}
          title={selectedVideo.title}
        />
      )}
    </div>
  );
}