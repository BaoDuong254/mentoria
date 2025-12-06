import path from "@/constants/path";

export const ROUTES = {
  MENTEE: path.MENTEE,
  MENTOR: path.MENTOR,
  ADMIN: path.ADMIN,
};

export const getBaseUrlByRole = (role?: string) => {
  if (!role) return "";

  switch (role.toLowerCase()) {
    case "mentee":
      return ROUTES.MENTEE;
    case "mentor":
      return ROUTES.MENTOR;
    case "admin":
      return ROUTES.ADMIN;
  }
};
