import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

// Define types
interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  points: number;
  questions: QuizQuestion[];
  passingScore: number;
}

// Quiz data
const quizzes: Quiz[] = [
  {
    id: "quiz-phishing",
    title: "Phishing Detection Quiz",
    description: "Learn to identify fake emails and phishing attempts",
    icon: "🎣",
    duration: "5 min",
    points: 20,
    passingScore: 70,
    questions: [
      {
        id: 1,
        text: "What is a common sign of a phishing email?",
        options: [
          "Professional grammar",
          "Urgent language demanding immediate action",
          "Known sender address",
          "Personalized greeting"
        ],
        correctAnswer: 1,
        explanation: "Phishing emails often create urgency to trick you into acting quickly without thinking."
      },
      {
        id: 2,
        text: "What should you do before clicking a link in an email?",
        options: [
          "Click it immediately",
          "Forward to friends first",
          "Hover over it to see the real URL",
          "Copy and paste without checking"
        ],
        correctAnswer: 2,
        explanation: "Always hover over links to see where they actually lead."
      },
      {
        id: 3,
        text: "Which email address is MOST suspicious?",
        options: [
          "support@amazon.com",
          "noreply@paypal.com",
          "security@yourbank-secure.xyz",
          "updates@microsoft.com"
        ],
        correctAnswer: 2,
        explanation: "The domain 'yourbank-secure.xyz' is suspicious because legitimate banks use official domains."
      },
      {
        id: 4,
        text: "What information should you NEVER share via email?",
        options: [
          "Your favorite color",
          "Your password",
          "Your name",
          "Your email address"
        ],
        correctAnswer: 1,
        explanation: "Legitimate companies will NEVER ask for your password via email."
      },
      {
        id: 5,
        text: "What does 'https://' indicate?",
        options: [
          "Website is from India",
          "Website has secure connection",
          "Website is free",
          "Website is verified by Google"
        ],
        correctAnswer: 1,
        explanation: "HTTPS means encrypted connection. Look for the padlock icon."
      }
    ]
  },
  {
    id: "quiz-password",
    title: "Password Security Quiz",
    description: "Test your knowledge about strong passwords",
    icon: "🔐",
    duration: "4 min",
    points: 15,
    passingScore: 70,
    questions: [
      {
        id: 1,
        text: "Which password is the STRONGEST?",
        options: [
          "password123",
          "BlueElephant$Jumps42!",
          "qwerty123",
          "John1980"
        ],
        correctAnswer: 1,
        explanation: "It's long and uses uppercase, lowercase, numbers, and special characters."
      },
      {
        id: 2,
        text: "Should you use the same password for multiple accounts?",
        options: [
          "Yes, it's easier",
          "Only for unimportant accounts",
          "No, it's very risky",
          "Yes, if you change it yearly"
        ],
        correctAnswer: 2,
        explanation: "If one site gets hacked, ALL your accounts are at risk."
      },
      {
        id: 3,
        text: "What is a password manager?",
        options: [
          "A person who remembers passwords",
          "Software that creates and stores strong passwords",
          "A notebook for passwords",
          "A tool to hack passwords"
        ],
        correctAnswer: 1,
        explanation: "Password managers securely store and generate strong passwords."
      },
      {
        id: 4,
        text: "What makes a password easy to crack?",
        options: [
          "Using dictionary words",
          "Using mix of characters",
          "Using 15+ characters",
          "Using special symbols"
        ],
        correctAnswer: 0,
        explanation: "Dictionary words are easy for automated programs to guess."
      },
      {
        id: 5,
        text: "How often should you change your passwords?",
        options: [
          "Every week",
          "Never",
          "Only when you suspect a breach",
          "Every day"
        ],
        correctAnswer: 2,
        explanation: "Change passwords only when you suspect a breach."
      }
    ]
  },
  {
    id: "quiz-social",
    title: "Social Engineering Quiz",
    description: "Recognize manipulation tactics used by attackers",
    icon: "🎭",
    duration: "3 min",
    points: 15,
    passingScore: 70,
    questions: [
      {
        id: 1,
        text: "What is social engineering?",
        options: [
          "Building social media profiles",
          "Manipulating people to reveal information",
          "Engineering social networks",
          "Creating social events"
        ],
        correctAnswer: 1,
        explanation: "Social engineering is psychological manipulation to get information."
      },
      {
        id: 2,
        text: "A caller claims to be from 'Tech Support' asking for remote access. What do you do?",
        options: [
          "Give them access immediately",
          "Ask for employee ID",
          "Hang up and call official number",
          "Let them fix the problem"
        ],
        correctAnswer: 2,
        explanation: "Always verify by hanging up and calling the official number."
      },
      {
        id: 3,
        text: "What is 'pretexting'?",
        options: [
          "Creating a fake scenario to get information",
          "Texting someone repeatedly",
          "Previewing text messages",
          "Writing fake texts"
        ],
        correctAnswer: 0,
        explanation: "Pretexting uses a fabricated story to trick someone."
      },
      {
        id: 4,
        text: "Which is a sign of a social engineering attack?",
        options: [
          "Asking for personal information",
          "Offering help",
          "Asking for time",
          "Being polite"
        ],
        correctAnswer: 0,
        explanation: "Attackers ask for personal information like passwords."
      },
      {
        id: 5,
        text: "What should you do if someone asks for your password?",
        options: [
          "Give it if they seem nice",
          "Never share it with anyone",
          "Share only half of it",
          "Write it down for them"
        ],
        correctAnswer: 1,
        explanation: "Your password is private. Never share it with anyone."
      }
    ]
  },
  {
    id: "quiz-2fa",
    title: "Two-Factor Authentication Quiz",
    description: "Learn how 2FA protects your accounts",
    icon: "📱",
    duration: "3 min",
    points: 10,
    passingScore: 70,
    questions: [
      {
        id: 1,
        text: "What is Two-Factor Authentication (2FA)?",
        options: [
          "Two passwords",
          "Two-step verification process",
          "Two accounts",
          "Two devices"
        ],
        correctAnswer: 1,
        explanation: "2FA requires both password and a second factor like a code from your phone."
      },
      {
        id: 2,
        text: "Which is an example of 2FA?",
        options: [
          "Password only",
          "Password + SMS code",
          "Username only",
          "Email only"
        ],
        correctAnswer: 1,
        explanation: "2FA requires something you know AND something you have."
      },
      {
        id: 3,
        text: "Is SMS-based 2FA secure?",
        options: [
          "Perfectly secure",
          "Better than nothing but has risks",
          "Completely useless",
          "Best option available"
        ],
        correctAnswer: 1,
        explanation: "SMS is better than nothing, but authenticator apps are more secure."
      },
      {
        id: 4,
        text: "Where should you enable 2FA?",
        options: [
          "Only on social media",
          "Only on banking apps",
          "On all important accounts",
          "Nowhere"
        ],
        correctAnswer: 2,
        explanation: "Enable 2FA on email, banking, and social media accounts."
      },
      {
        id: 5,
        text: "What are backup codes for?",
        options: [
          "To reset password",
          "To access account if you lose your phone",
          "To share with friends",
          "To bypass security"
        ],
        correctAnswer: 1,
        explanation: "Backup codes let you access your account if you lose your phone."
      }
    ]
  },
  {
    id: "quiz-ssl",
    title: "SSL Certificate Quiz",
    description: "Understand website security indicators",
    icon: "🔒",
    duration: "3 min",
    points: 10,
    passingScore: 70,
    questions: [
      {
        id: 1,
        text: "What does SSL stand for?",
        options: [
          "Secure Socket Layer",
          "Simple Security Lock",
          "Safe Site Label",
          "Secure Login Link"
        ],
        correctAnswer: 0,
        explanation: "SSL encrypts data between your browser and websites."
      },
      {
        id: 2,
        text: "How to identify a secure website?",
        options: [
          "Green color",
          "Padlock icon in address bar",
          "Shield icon",
          "Checkmark"
        ],
        correctAnswer: 1,
        explanation: "Look for the padlock icon and 'https://' in the address bar."
      },
      {
        id: 3,
        text: "Why is SSL important?",
        options: [
          "Makes website faster",
          "Encrypts your data",
          "Shows ads",
          "Saves passwords"
        ],
        correctAnswer: 1,
        explanation: "SSL encrypts information you send to websites."
      },
      {
        id: 4,
        text: "What happens on a website without SSL?",
        options: [
          "It loads faster",
          "Data can be intercepted",
          "It's free",
          "No issues"
        ],
        correctAnswer: 1,
        explanation: "Without SSL, anyone can see the information you send."
      },
      {
        id: 5,
        text: "Should you enter credit card info on non-HTTPS site?",
        options: [
          "Yes, if it looks legit",
          "Never",
          "Only for small amounts",
          "If site has logo"
        ],
        correctAnswer: 1,
        explanation: "Never enter sensitive information on websites without HTTPS."
      }
    ]
  }
];

// Helper functions
const saveQuizResult = (quizId: string, score: number, totalQuestions: number) => {
  const userData = localStorage.getItem("user");
  const userId = userData ? JSON.parse(userData).email : "anonymous";
  const percentage = (score / totalQuestions) * 100;
  const passed = percentage >= 70;
  
  const result = {
    quizId,
    userId,
    score,
    totalQuestions,
    percentage,
    passed,
    completedAt: new Date().toISOString()
  };
  
  const existingResults = localStorage.getItem('quizResults');
  const results = existingResults ? JSON.parse(existingResults) : [];
  results.push(result);
  localStorage.setItem('quizResults', JSON.stringify(results));
  
  if (passed) {
    localStorage.setItem(`quiz_${quizId}_completed`, 'true');
  }
  
  return result;
};

const isQuizCompleted = (quizId: string): boolean => {
  return localStorage.getItem(`quiz_${quizId}_completed`) === 'true';
};

export function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const foundQuiz = quizzes.find(q => q.id === quizId);
    if (foundQuiz) {
      setQuiz(foundQuiz);
      setAnswers(new Array(foundQuiz.questions.length).fill(-1));
      if (foundQuiz.duration === "5 min") setTimeLeft(300);
      else if (foundQuiz.duration === "4 min") setTimeLeft(240);
      else if (foundQuiz.duration === "3 min") setTimeLeft(180);
    } else {
      navigate("/dashboard/learn");
    }
  }, [quizId, navigate]);

  useEffect(() => {
    if (quizStarted && timeLeft !== null && timeLeft > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            clearInterval(timer);
            setShowResults(true);
            return 0;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizStarted, timeLeft, showResults]);

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading quiz...</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      let score = 0;
      quiz.questions.forEach((question, idx) => {
        if (answers[idx] === question.correctAnswer) {
          score++;
        }
      });
      saveQuizResult(quiz.id, score, quiz.questions.length);
      setShowResults(true);
      const percentage = (score / quiz.questions.length) * 100;
      if (percentage >= quiz.passingScore) {
        toast.success(`🎉 You passed with ${score}/${quiz.questions.length}!`);
      } else {
        toast.warning(`Score: ${score}/${quiz.questions.length}. Try again!`);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleRetry = () => {
    setAnswers(new Array(quiz.questions.length).fill(-1));
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setQuizStarted(false);
    localStorage.removeItem(`quiz_${quiz.id}_completed`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const score = showResults ? answers.filter((ans, idx) => ans === quiz.questions[idx].correctAnswer).length : 0;
  const percentage = (score / quiz.questions.length) * 100;
  const passed = percentage >= quiz.passingScore;
  const alreadyCompleted = isQuizCompleted(quiz.id);

  // Already completed view
  if (alreadyCompleted && !quizStarted && !showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Quiz Already Completed! 🎉</h3>
            <p className="text-gray-600 mb-6">You've already passed this quiz.</p>
            <div className="flex gap-4">
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                Take Again
              </Button>
              <Button onClick={() => navigate("/dashboard/learn")} className="flex-1">
                Back to Learning Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Start screen
  if (!quizStarted && !showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="text-center">
              <span className="text-6xl mb-4 block">{quiz.icon}</span>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              <p className="text-gray-600 mt-2">{quiz.description}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Quiz Information:</h3>
                <ul className="space-y-2 text-sm">
                  <li>📝 {quiz.questions.length} Questions</li>
                  <li>✅ Passing Score: {quiz.passingScore}%</li>
                  <li>⏱️ Duration: {quiz.duration}</li>
                  <li>🏆 Points: {quiz.points}</li>
                </ul>
              </div>
              <Button onClick={handleStartQuiz} className="w-full">
                Start Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results screen
  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${passed ? 'bg-green-100' : 'bg-red-100'} mb-4`}>
                {passed ? <CheckCircle className="w-12 h-12 text-green-600" /> : <XCircle className="w-12 h-12 text-red-600" />}
              </div>
              <h2 className="text-3xl font-bold mb-2">{score}/{quiz.questions.length}</h2>
              <p className="text-gray-600 mb-2">Score: {percentage.toFixed(0)}%</p>
              {passed && <p className="text-green-600 font-semibold">🎉 You earned {quiz.points} points!</p>}
              {!passed && <p className="text-red-600 font-semibold">Need {quiz.passingScore}% to pass. Try again!</p>}
            </div>
            <div className="flex gap-4">
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => navigate("/dashboard/learn")} className="flex-1">
                Back to Hub
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active quiz screen
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">{quiz.title}</CardTitle>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft || 0)}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <div 
                key={idx}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                  answers[currentQuestionIndex] === idx ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleAnswer(idx)}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                  answers[currentQuestionIndex] === idx ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {answers[currentQuestionIndex] === idx && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="flex-1">{option}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} variant="outline">
              Previous
            </Button>
            <Button onClick={handleNext} disabled={answers[currentQuestionIndex] === -1}>
              {isLastQuestion ? "Submit Quiz" : "Next Question"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}