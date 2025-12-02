import { useRoutes } from "react-router-dom";
import path from "@/constants/path";

import PublicLayout from "@/layouts/PublicLayout";

import Home from "@/pages/public/Home";
import Login from "@/pages/public/Login";
import MentorBrowse from "@/pages/public/MentorBrowse";
import MentorProfile from "@/pages/public/MentorProfile";
import RegisterMentee from "@/pages/public/RegisterMentee";
import RegisterMentor from "@/pages/public/RegisterMentor";
import PaymentSuccess from "@/pages/public/PaymentSuccess";
import PaymentCancel from "@/pages/public/PaymentCancel";
import Settings from "@/pages/public/Settings";

import MentorDashboard from "@/pages/mentor/MentorDashboard";

import Booking from "@/pages/mentee/Booking";
import MenteeDashboard from "@/pages/mentee/MenteeDashboard";
import Invoice from "@/pages/mentee/Invoice";

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
    // Payment routes (public, no auth required for redirect from Stripe)
    {
      path: path.PAYMENT,
      children: [
        { path: path.PAYMENT_SUCCESS, element: <PaymentSuccess /> },
        { path: path.PAYMENT_CANCEL, element: <PaymentCancel /> },
      ],
    },
    // Settings route (requires auth - handled in component)
    {
      path: path.SETTINGS,
      element: <PublicLayout />,
      children: [{ index: true, element: <Settings /> }],
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
            { path: `${path.MENTEE_BOOKING}/:planId`, element: <Booking /> },
            { path: `${path.MENTEE_INVOICE}/:requestId`, element: <Invoice /> },
          ],
        },
      ],
    },
  ];

  return useRoutes(routes);
}
