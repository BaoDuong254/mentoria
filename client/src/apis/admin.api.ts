import axios from "axios";
import envConfig from "@/lib/env";
import type {
  AdminListResponse,
  AdminMenteeItem,
  AdminMentorItem,
  AdminResponse,
  InvoiceStatsData,
  SystemStats,
  UpdateAdminMenteeRequest,
  UpdateAdminMentorRequest,
  DashboardStatsParams,
  DashboardStatsData,
} from "@/types/admin.type";

const BASE_URL = envConfig.VITE_API_ENDPOINT + "/api/admin";

// ==================== MENTEE APIS ====================

// 1. Lấy danh sách Mentee (Phân trang)
export const getAdminMentees = async (page = 1, limit = 10) => {
  const res = await axios.get<AdminListResponse<AdminMenteeItem>>(`${BASE_URL}/mentees`, {
    params: { page, limit },
    withCredentials: true,
  });
  return res.data;
};

// 2. Lấy chi tiết 1 Mentee theo ID (Mới thêm)
export const getAdminMentee = async (userId: number) => {
  const res = await axios.get<AdminResponse<AdminMenteeItem>>(`${BASE_URL}/mentees/${String(userId)}`, {
    withCredentials: true,
  });
  return res.data;
};

// 3. Cập nhật thông tin Mentee (Mới thêm)
export const updateAdminMentee = async (userId: number, data: UpdateAdminMenteeRequest) => {
  const res = await axios.put<AdminResponse>(`${BASE_URL}/mentees/${String(userId)}`, data, { withCredentials: true });
  return res.data;
};

// 4. Xóa Mentee
export const deleteAdminMentee = async (userId: number) => {
  const res = await axios.delete<AdminResponse>(`${BASE_URL}/mentees/${String(userId)}`, { withCredentials: true });
  return res.data;
};

// ==================== MENTOR APIS ====================

// 5. Lấy danh sách Mentor
export const getAdminMentors = async (page = 1, limit = 10) => {
  const res = await axios.get<AdminListResponse<AdminMentorItem>>(`${BASE_URL}/mentors`, {
    params: { page, limit },
    withCredentials: true,
  });
  return res.data;
};

// 6. Lấy danh sách Mentor chờ duyệt (Pending)
export const getPendingMentors = async (page = 1, limit = 10) => {
  const res = await axios.get<AdminListResponse<AdminMentorItem>>(`${BASE_URL}/mentors/pending`, {
    params: { page, limit },
    withCredentials: true,
  });
  return res.data;
};

// 7. Lấy chi tiết 1 Mentor
export const getAdminMentor = async (userId: number) => {
  const res = await axios.get<AdminResponse<AdminMentorItem>>(`${BASE_URL}/mentors/${String(userId)}`, {
    withCredentials: true,
  });
  return res.data;
};

// 8. Cập nhật Mentor
export const updateAdminMentor = async (userId: number, data: UpdateAdminMentorRequest) => {
  const res = await axios.put<AdminResponse>(`${BASE_URL}/mentors/${String(userId)}`, data, {
    withCredentials: true,
  });
  return res.data;
};

// 9. Duyệt/Từ chối Mentor
export const reviewMentorApplication = async (userId: number, action: "accept" | "reject") => {
  const res = await axios.post<AdminResponse>(
    `${BASE_URL}/mentors/${String(userId)}/review`,
    { action },
    { withCredentials: true }
  );
  return res.data;
};

// 10. Xóa Mentor
export const deleteAdminMentor = async (userId: number) => {
  const res = await axios.delete<AdminResponse>(`${BASE_URL}/mentors/${String(userId)}`, {
    withCredentials: true,
  });
  return res.data;
};

// ==================== GENERAL APIS ====================

// 11. Xóa User (Wrapper)
export const deleteUser = async (userId: number, role: "mentee" | "mentor") => {
  if (role === "mentee") {
    return deleteAdminMentee(userId);
  } else {
    return deleteAdminMentor(userId);
  }
};

// --- Invoices ---
export const getAdminInvoices = async (params: {
  page?: number;
  limit?: number;
  year?: number;
  month?: number;
  userId?: number;
  userType?: "mentee" | "mentor";
}) => {
  const res = await axios.get<AdminResponse<InvoiceStatsData>>(`${BASE_URL}/invoices`, {
    params,
    withCredentials: true,
  });
  return res.data;
};

// --- Stats ---
export const getSystemStats = async () => {
  const res = await axios.get<AdminResponse<SystemStats>>(`${BASE_URL}/stats`, { withCredentials: true });
  return res.data;
};

// --- Goi sp_DashboardStatistics ---
export const getDashboardStats = async (params: DashboardStatsParams = {}) => {
  const res = await axios.get<AdminResponse<DashboardStatsData>>(`${BASE_URL}/dashboard-stats`, {
    params,
    withCredentials: true,
  });
  return res.data;
};
