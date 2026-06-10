import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import App from "../App.jsx";
import Home from "../pages/Home.jsx";
import Practice from "../pages/Practice.jsx";
import SignUp from "../pages/SignUp.jsx";
import Multiplayer from "../pages/Multiplayer.jsx";
import CreateRoom from "../pages/CreateRoom.jsx";
import Login from "../pages/Login.jsx";
import MultiplayerHome from "../pages/MultiplayerHome.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import ResetPasswordForm from "../components/ResetPasswordForm.jsx";
import ProfileDisplay from "../components/dashboard/ProfileDisplay.jsx";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Loader from "../components/ui/Loader.jsx";

function ProtectedRoute() {
  const { user, loading } = useContext(AuthContext);

  if(loading) {
    return <Loader />
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { user, loading } = useContext(AuthContext);

  if(loading) {
    return <Loader />
  }

  return user ? <Navigate to="/" replace /> : <Outlet />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        element: <PublicRoute />,
        children: [
          {
            path: "signup",
            element: <SignUp />,
          },
          {
            path: "login",
            element: <Login />,
          },
        ],
      },

      // Protected Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "practice",
            element: <Practice />,
          },
          {
            path: "multiplayer",
            element: <Multiplayer />,
            children: [
              {
                index: true,
                element: <MultiplayerHome />,
              },
              {
                path: "create",
                element: <CreateRoom />,
              },
            ],
          },
          {
            path: "dashboard",
            element: <Dashboard />,
            children: [
              {
                index: true,
                element: <ProfileDisplay />,
              },
              {
                path: "reset-password",
                element: <ResetPasswordForm />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
