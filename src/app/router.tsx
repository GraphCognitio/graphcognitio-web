import { createBrowserRouter, Navigate } from "react-router-dom";
import { GraphPage } from "../features/graph/pages/GraphPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { FeedPage } from "../features/feed/pages/FeedPage";
import { PostDetailPage } from "../features/post/pages/PostDetailPage";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Navigate to="/feed" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/feed",
    element: (
      <ProtectedRoute>
        <FeedPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/post/:id",
    element: (
      <ProtectedRoute>
        <PostDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/graph/:rootId",
    element: (
      <ProtectedRoute>
        <GraphPage />
      </ProtectedRoute>
    ),
  },
]);
