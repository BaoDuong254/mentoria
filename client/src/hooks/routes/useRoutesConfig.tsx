import { useRoutes } from "react-router-dom";
import path from "@/constants/path";

import PublicLayout from "@/layouts/PublicLayout";
import MentorLayout from "@/layouts/MentorLayout";
import MenteeLayout from "@/layouts/MenteeLayout";

import Home from "@/pages/public/Home";
import LoginMentee from "@/pages/public/LoginMentee";
import LoginMentor from "@/pages/public/LoginMentor";
import MentorBrowse from "@/pages/public/MentorBrowse";
import MentorProfile from "@/pages/public/MentorProfile";
import RegisterMentee from "@/pages/public/RegisterMentee";
import RegisterMentor from "@/pages/public/RegisterMentor";

import MentorDashboard from "@/pages/mentor/MentorDashboard";

import Booking from "@/pages/mentee/Booking";
import MenteeDashboard from "@/pages/mentee/MenteeDashboard";

export default function useRoutesConfig() {
  const routes = [
    {
      path: path.PUBLIC,
      element: <PublicLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: path.LOGIN_MENTEE, element: <LoginMentee /> },
        { path: path.LOGIN_MENTOR, element: <LoginMentor /> },
        { path: path.REGISTER_MENTEE, element: <RegisterMentee /> },
        { path: path.REGISTER_MENTOR, element: <RegisterMentor /> },
        { path: path.MENTOR_BROWSE, element: <MentorBrowse /> },
        { path: path.MENTOR_PROFILE, element: <MentorProfile /> },
      ],
    },
    {
      path: path.MENTOR,
      element: <MentorLayout />,
      children: [{ index: true, element: <MentorDashboard /> }],
    },
    {
      path: path.MENTEE,
      element: <MenteeLayout />,
      children: [
        { index: true, element: <MenteeDashboard /> },
        { path: path.MENTEE_BOOKING, element: <Booking /> },
      ],
    },
  ];

  return useRoutes(routes);
}
