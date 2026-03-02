import { lazy, Suspense, type ReactElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";
import { RouteLoader } from "./RouteLoader";

const LoginPage = lazy(() => import("../features/auth/pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() =>
  import("../features/auth/pages/RegisterPage").then((module) => ({ default: module.RegisterPage })),
);
const FeedPage = lazy(() => import("../features/feed/pages/FeedPage").then((module) => ({ default: module.FeedPage })));
const PostDetailPage = lazy(() =>
  import("../features/post/pages/PostDetailPage").then((module) => ({ default: module.PostDetailPage })),
);
const GraphPage = lazy(() => import("../features/graph/pages/GraphPage").then((module) => ({ default: module.GraphPage })));
const UserProfilePage = lazy(() =>
  import("../features/profile/pages/UserProfilePage").then((module) => ({ default: module.default })),
);

function withSuspense(element: ReactElement) {
  return <Suspense fallback={<RouteLoader />}>{element}</Suspense>;
}

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
    element: withSuspense(<LoginPage />),
  },
  {
    path: "/register",
    element: withSuspense(<RegisterPage />),
  },
  {
    path: "/feed",
    element: withSuspense(
      <ProtectedRoute>
        <FeedPage />
      </ProtectedRoute>,
    ),
  },
  {
    path: "/post/:id",
    element: withSuspense(
      <ProtectedRoute>
        <PostDetailPage />
      </ProtectedRoute>,
    ),
  },
  {
    path: "/graph/:rootId",
    element: withSuspense(
      <ProtectedRoute>
        <GraphPage />
      </ProtectedRoute>,
    ),
  },
  {
    path: "/profile/:username",
    element: withSuspense(
      <ProtectedRoute>
        <UserProfilePage />
      </ProtectedRoute>,
    ),
  },
]);
