import { createBrowserRouter, Navigate } from "react-router-dom";
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
import { BlockedWebsites } from "./components/BlockedWebsites";

// Teacher Components (Lazy or placeholders for now)
import { TeacherDashboard } from "./components/teacher/TeacherDashboard";
import { StudentTrackingTable } from "./components/teacher/StudentTrackingTable";
import { RequestManagement } from "./components/teacher/RequestManagement";
import { TeacherSettings } from "./components/teacher/TeacherSettings";

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
      <ProtectedRoute allowedRoles={["student"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: HomePage },
      { path: "threats", Component: ThreatHistoryPage },
      { path: "learn", Component: LearningHubPage },
      { path: "learn/:lessonId", Component: LessonDetail },
      { path: "quiz/:quizId", Component: QuizPage },
      { path: "blocked-sites", Component: BlockedWebsites },
      { path: "settings", Component: SettingsPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
  {
    path: "/teacher",
    element: (
      <ProtectedRoute allowedRoles={["teacher"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", Component: TeacherDashboard },
      { path: "students", Component: StudentTrackingTable },
      { path: "requests", Component: RequestManagement },
      { path: "settings", Component: TeacherSettings },
      { index: true, element: <Navigate to="/teacher/dashboard" replace /> },
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