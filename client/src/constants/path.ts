const path = {
  //public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER_MENTEE: "/mentee/register",
  REGISTER_MENTOR: "/mentor/register",
  MENTOR_BROWSE: "/mentor-browse",
  MENTOR_PROFILE: "/mentor-profile",
  PAYMENT_SUCCESS: "/payment/success",

  //mentee routes
  MENTEE: "/mentee",
  MENTEE_DASHBOARD: "dashboard",
  MENTEE_BOOKING: "booking",

  //mentor routes
  MENTOR: "/mentor",
  MENTOR_DASHBOARD: "dashboard",
  MENTOR_PLANS: "plans",

  //admin routes
  ADMIN: "/admin",

  //Default
  ALL: "*",
};

export default path;
