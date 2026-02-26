import { createBrowserRouter, Navigate } from "react-router-dom";
import { GraphPage } from "../features/graph/pages/GraphPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { FeedPage } from "../features/feed/pages/FeedPage";
import { PostDetailPage } from "../features/post/pages/PostDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/feed" replace />,
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
    element: <FeedPage />,
  },
  {
    path: "/post/:id",
    element: <PostDetailPage />,
  },
  {
    path: "/graph/:rootId",
    element: <GraphPage />,
  },
]);
