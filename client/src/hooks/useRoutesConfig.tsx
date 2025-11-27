import { useRoutes } from "react-router-dom";
import path from "@/constants/path";

import PublicLayout from "@/layouts/PublicLayout";

import Home from "@/pages/public/Home";
import Login from "@/pages/public/Login";
import MentorBrowse from "@/pages/public/MentorBrowse";
import MentorProfile from "@/pages/public/MentorProfile";
import RegisterMentee from "@/pages/public/RegisterMentee";
import RegisterMentor from "@/pages/public/RegisterMentor";

import MentorDashboard from "@/pages/mentor/MentorDashboard";

import Booking from "@/pages/mentee/Booking";
import MenteeDashboard from "@/pages/mentee/MenteeDashboard";

import ProtectedMenteeRoute from "@/layouts/ProtectedMenteeRoute";
import ProtectedMentorRoute from "@/layouts/ProtectedMentorRoute";

export default function useRoutesConfig() {
  const routes = [
    {
      path: "",
      element: <PublicLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: path.LOGIN, element: <Login /> },
        { path: path.REGISTER_MENTEE, element: <RegisterMentee /> },
        { path: path.REGISTER_MENTOR, element: <RegisterMentor /> },
        { path: path.MENTOR_BROWSE, element: <MentorBrowse /> },
        { path: `${path.MENTOR_PROFILE}/:id`, element: <MentorProfile /> },
      ],
    },
    {
      element: <ProtectedMentorRoute />,
      children: [
        {
          path: path.MENTOR,
          element: <PublicLayout />,
          children: [{ path: path.MENTOR_DASHBOARD, element: <MentorDashboard /> }],
        },
      ],
    },
    {
      element: <ProtectedMenteeRoute />,
      children: [
        {
          path: path.MENTEE,
          element: <PublicLayout />,
          children: [
            { path: path.MENTEE_DASHBOARD, element: <MenteeDashboard /> },
            { path: path.MENTEE_BOOKING, element: <Booking /> },
          ],
        },
      ],
    },
  ];

  return useRoutes(routes);
}
