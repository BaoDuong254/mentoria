import { useRoutes } from "react-router-dom";
import path from "@/constants/path";

import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";

import Home from "@/pages/public/Home";
import Login from "@/pages/public/Login";
import MentorBrowse from "@/pages/public/MentorBrowse";
import MentorProfile from "@/pages/public/MentorProfile";
import RegisterMentee from "@/pages/public/RegisterMentee";
import RegisterMentor from "@/pages/public/RegisterMentor";

import MentorDashboard from "@/pages/mentor/MentorDashboard";
import Profile from "@/pages/mentor/Profile";

import Booking from "@/pages/mentee/Booking";
import MenteeDashboard from "@/pages/mentee/MenteeDashboard";

import ProtectedMenteeRoute from "@/layouts/ProtectedMenteeRoute";
import ProtectedMentorRoute from "@/layouts/ProtectedMentorRoute";
import PaymentSuccessPage from "@/pages/public/Payment";
import ProtectedAdminRoute from "@/layouts/ProtectedAdminRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminInvoices from "@/pages/admin/AdminInvoices";
import MentorPlans from "@/pages/mentor/MentorPlans/MentorPlans";

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
        { path: path.PAYMENT_SUCCESS, element: <PaymentSuccessPage /> },
      ],
    },
    {
      element: <ProtectedMentorRoute />,
      children: [
        {
          path: path.MENTOR,
          element: <PublicLayout />,
          children: [
            { path: path.MENTOR_DASHBOARD, element: <MentorDashboard /> },
            { path: path.MENTOR_PLANS, element: <MentorPlans /> },
            { path: path.PROFILE, element: <Profile /> },
          ],
        },
      ],
    },
    {
      element: <ProtectedAdminRoute />,
      children: [
        {
          path: path.ADMIN,
          element: <AdminLayout />,
          children: [
            { index: true, element: <AdminDashboard /> },
            { path: path.ADMIN_DASHBOARD, element: <AdminDashboard /> },
            { path: path.ADMIN_USERS, element: <AdminUsers /> },
            { path: path.ADMIN_INVOICES, element: <AdminInvoices /> },
            { path: path.PROFILE, element: <Profile /> },
          ],
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
          ],
        },
      ],
    },
  ];

  return useRoutes(routes);
}
