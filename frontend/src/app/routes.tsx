import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { AuthPage } from "./components/AuthPage";
import { HomePage } from "./components/HomePage";
import { ThreatHistoryPage } from "./components/ThreatHistoryPage";
import { LearningHubPage } from "./components/LearningHubPage";
import { SettingsPage } from "./components/SettingsPage";
import ManualScan from "./components/ManualScan";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProfilePage } from "./components/ProfilePage";
import { LessonDetail } from "./components/LessonDetail";
import { QuizPage } from "./components/QuizPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/auth",
    Component: AuthPage,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: HomePage },
      { path: "threats", Component: ThreatHistoryPage },
      { path: "learn", Component: LearningHubPage },
      { path: "learn/:lessonId", Component: LessonDetail },
      { path: "quiz/:quizId", Component: QuizPage },  // ← ADD THIS LINE
      { path: "settings", Component: SettingsPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
  {
    path: "/scan",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: ManualScan },
    ],
  },
]);