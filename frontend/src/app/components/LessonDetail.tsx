import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ArrowLeft, CheckCircle, Clock, BookOpen, Award } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";
import { Loader2 } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  type: string;
  points: number;
  duration: string;
  explanation: string;
  keyPoints: string[];
  whatYouWillLearn: string[];
  status: 'not_started' | 'started' | 'completed';
}

export function LessonDetail() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (lessonId) {
      setIsLoading(true);
      api.get(`/learning/modules/${lessonId}`)
        .then(res => {
          setLesson(res.data);
          if (res.data.status === 'completed') {
            setIsCompleted(true);
          }
        })
        .catch(err => {
          console.error("Failed to load lesson", err);
          toast.error("Failed to load lesson details");
        })
        .finally(() => setIsLoading(false));
    }
  }, [lessonId]);

  const handleStart = () => {
    setHasStarted(true);
    // Start timer
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  };

  const handleComplete = async () => {
    if (!isCompleted && hasStarted && lessonId) {
      setIsCompleting(true);
      try {
        const res = await api.post(`/learning/modules/${lessonId}/complete`);
        setIsCompleted(true);
        toast.success(`🎉 Great job! You earned ${lesson?.points} points!`);
        
        // Redirect back after 2 seconds
        setTimeout(() => {
          navigate("/dashboard/learn");
        }, 2000);
      } catch (err) {
        console.error("Failed to complete lesson", err);
        toast.error("Failed to mark lesson as completed");
      } finally {
        setIsCompleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Lesson not found</p>
        <Button onClick={() => navigate("/dashboard/learn")} className="mt-4">
          Back to Learning Hub
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/learn")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Lesson Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  lesson.type === "Quiz" ? "bg-purple-100 text-purple-700" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700"
                }`}>
                  {lesson.type}
                </span>
                {isCompleted && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                  </span>
                )}
              </div>
              <CardTitle className="text-2xl">{lesson.title}</CardTitle>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>{lesson.points} points</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.duration}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!hasStarted && !isCompleted ? (
            // Start Screen
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to learn?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Take about {lesson.duration} to complete this {lesson.type.toLowerCase()}
              </p>
              <Button onClick={handleStart} size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start {lesson.type === "Quiz" ? "Quiz" : "Lesson"}
              </Button>
            </div>
          ) : (
            // Lesson Content
            <>
              <div className="prose max-w-none">
                {lesson.whatYouWillLearn && lesson.whatYouWillLearn.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📖 What you'll learn</h3>
                    <ul className="space-y-2 mb-6">
                      {lesson.whatYouWillLearn.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {lesson.explanation && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📚 Simple Explanation</h3>
                    <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {lesson.explanation}
                      </p>
                    </div>
                  </>
                )}

                {lesson.keyPoints && lesson.keyPoints.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">💡 Key Takeaways</h3>
                    <ul className="space-y-2">
                      {lesson.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <span className="text-blue-500 font-bold">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Complete Button */}
              {!isCompleted && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleComplete}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isCompleting}
                  >
                    {isCompleting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                    Mark as Completed
                  </Button>
                </div>
              )}

              {/* Completion Message */}
              {isCompleted && (
                <div className="text-center py-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-green-800">Congratulations!</h3>
                  <p className="text-green-700">
                    You've completed this {lesson.type.toLowerCase()} and earned {lesson.points} points!
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}