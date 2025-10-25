import axios from "axios";
import { useState, type ReactNode, useEffect } from "react";
import { type User, type LoginResponse } from "@/types";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get<User>("http://localhost:3000/api/auth/me", {
          withCredentials: true,
        });
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    void fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>(
        "http://localhost:3000/api/auth/login",
        new URLSearchParams({
          email,
          password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          withCredentials: true,
          validateStatus: () => true,
        }
      );
      console.log(response.data);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const getMe = await axios.get<User>("http://localhost:3000/api/auth/me", {
        withCredentials: true,
      });
      setUser(getMe.data);
      console.log(getMe.data);

      return response.data;
    } catch (error) {
      console.log("Login failed: ", error);
      throw error;
    }
  };

  return <AuthContext.Provider value={{ user, login, loading }}>{children}</AuthContext.Provider>;
};
