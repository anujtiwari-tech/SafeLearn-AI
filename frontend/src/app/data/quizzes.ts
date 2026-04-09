export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  points: number;
  questions: QuizQuestion[];
  passingScore: number;
}

export const quizzes: Quiz[] = [
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
        explanation: "Phishing emails often create urgency (like 'Your account will be closed!') to trick you into acting quickly without thinking."
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
        explanation: "Always hover over links to see where they actually lead. Fake links often show different URLs than what's written."
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
        explanation: "The domain 'yourbank-secure.xyz' is suspicious because legitimate banks use their official domain (.com, .in), not unusual extensions."
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
        explanation: "Legitimate companies will NEVER ask for your password via email. This is always a scam."
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
        explanation: "HTTPS means encrypted connection. Always look for the padlock icon before entering personal information."
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
        explanation: "BlueElephant$Jumps42! is strongest because it's long, uses uppercase, lowercase, numbers, and special characters."
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
        explanation: "Using same password everywhere is dangerous. If one site gets hacked, ALL your accounts are at risk."
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
        explanation: "Password managers securely store all your passwords and generate strong, unique passwords for each account."
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
        explanation: "Dictionary words are easy for automated programs to guess. Use random combinations or passphrases instead."
      },
      {
        id: 5,
        text: "How often should you change passwords?",
        options: [
          "Every week",
          "Never",
          "Only when you suspect a breach",
          "Every day"
        ],
        correctAnswer: 2,
        explanation: "Change passwords only when you suspect a breach or if the service tells you to. Frequent changes can lead to weaker passwords."
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
        explanation: "Social engineering is psychological manipulation to trick people into giving up confidential information."
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
        explanation: "Always verify unsolicited calls by hanging up and calling the company's official number."
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
        explanation: "Pretexting involves creating a fabricated story to trick someone into sharing information."
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
        explanation: "Attackers often ask for personal information like passwords, bank details, or sensitive data."
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
        explanation: "Your password is private. Never share it with anyone, no matter who they claim to be."
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
        explanation: "2FA adds an extra security layer requiring both password and second factor like a code from your phone."
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
        explanation: "2FA requires something you know (password) AND something you have (SMS code, authenticator app)."
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
        explanation: "SMS 2FA is better than nothing, but authenticator apps are more secure because SMS can be intercepted."
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
        explanation: "Enable 2FA on all accounts that support it, especially email, banking, and social media."
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
        explanation: "Backup codes let you access your account if you lose your phone or can't receive 2FA codes."
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
        explanation: "SSL (Secure Socket Layer) encrypts data between your browser and websites."
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
        explanation: "Look for the padlock icon and 'https://' in the address bar for secure connections."
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
        explanation: "SSL encrypts information you send to websites, protecting it from hackers."
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
        explanation: "Without SSL, anyone on the same network can see the information you send to that website."
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
        explanation: "Never enter sensitive information like credit cards on websites without HTTPS. Your data could be stolen."
      }
    ]
  }
];

// Save quiz result
export const saveQuizResult = (quizId: string, score: number, totalQuestions: number) => {
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
  
  // Mark as completed
  if (passed) {
    localStorage.setItem(`quiz_${quizId}_completed`, 'true');
  }
  
  return result;
};

// Get quiz completion status
export const isQuizCompleted = (quizId: string): boolean => {
  return localStorage.getItem(`quiz_${quizId}_completed`) === 'true';
};