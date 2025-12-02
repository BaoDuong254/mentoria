const path: {
  HOME: string;
  LOGIN: string;
  REGISTER_MENTEE: string;
  REGISTER_MENTOR: string;
  MENTOR_BROWSE: string;
  MENTOR_PROFILE: string;
  MENTEE: string;
  MENTEE_DASHBOARD: string;
  MENTEE_BOOKING: string;
  MENTEE_INVOICE: string;
  MENTOR: string;
  MENTOR_DASHBOARD: string;
  PAYMENT: string;
  PAYMENT_SUCCESS: string;
  PAYMENT_CANCEL: string;
  SETTINGS: string;
  ALL: string;
} = {
  //public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER_MENTEE: "/mentee/register",
  REGISTER_MENTOR: "/mentor/register",
  MENTOR_BROWSE: "/mentor-browse",
  MENTOR_PROFILE: "/mentor-profile",

  //mentee routes
  MENTEE: "/mentee",
  MENTEE_DASHBOARD: "dashboard",
  MENTEE_BOOKING: "booking",
  MENTEE_INVOICE: "invoice",

  //mentor routes
  MENTOR: "/mentor",
  MENTOR_DASHBOARD: "dashboard",

  //payment routes
  PAYMENT: "/payment",
  PAYMENT_SUCCESS: "success",
  PAYMENT_CANCEL: "cancel",

  //settings
  SETTINGS: "/settings",

  //admin routes

  //Default
  ALL: "*",
};

export default path;
