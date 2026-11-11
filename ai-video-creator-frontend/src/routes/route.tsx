import { createBrowserRouter, Navigate } from "react-router-dom";
import { Signup } from "../pages/general/signup/Signup";
import { Signin } from "../pages/general/signin/signin";
import App from "../App";
import { Home } from "../home/Home";
import { Profile } from "../pages/auth/profile/Profile";

import { Account } from "../pages/auth/profile/Account";
import { Settings } from "../settings/Settings";
import { Project } from "../pages/project/Project";
import { CreateVideo } from "../pages/project/CreateVideo";
import { Dashboard } from "../pages/dashboard/Dashboard";

export const router = createBrowserRouter([
    {
        path: '',
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            { path: '/signup', element: <Signup /> },
            { path: '/login', element: <Signin /> }
        ]
    },
    {
        path: '/me',
        element: <Profile />,
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: "dashboard", element: <Dashboard /> },
            { path: "account", element: <Account /> },
            { path: "settings", element: <Settings /> },
            { path: "projects", element: <Project /> },
            { path: "create-video", element: <CreateVideo /> },
        ]

    },

])
