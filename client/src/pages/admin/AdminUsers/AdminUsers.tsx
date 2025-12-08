import { useEffect, useState } from "react";
import {
  getAdminMentees,
  getAdminMentors,
  getPendingMentors,
  reviewMentorApplication,
  deleteUser,
  updateAdminMentee,
  updateAdminMentor,
} from "@/apis/admin.api";
import type { AdminMenteeItem, AdminMentorItem } from "@/types/admin.type";
import { Check, X, Trash2, AlertCircle, Save, Edit2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { showToast } from "@/utils/toast";

type Tab = "mentors" | "mentees" | "pending";

const AdminUsers = () => {
  type ValidStatus = "Active" | "Inactive" | "Banned" | "Pending";
  const [activeTab, setActiveTab] = useState<Tab>("mentors");
  const [data, setData] = useState<(AdminMenteeItem | AdminMentorItem)[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Đã loại bỏ [isUpdatingStatus]

  // --- STATE CHO DELETE MODAL ---
  const [userToDelete, setUserToDelete] = useState<{ id: number; role: "mentee" | "mentor" } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- STATE CHO EDIT MODAL ---
  const [editingUser, setEditingUser] = useState<AdminMenteeItem | AdminMentorItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [statusEditingUser, setStatusEditingUser] = useState<AdminMenteeItem | AdminMentorItem | null>(null);
  const [newStatus, setNewStatus] = useState<ValidStatus | "">(""); // Dùng union type
  // Form Data bao gồm các trường có thể chỉnh sửa trừ Status
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    // Mentor specific fields
    bio: "",
    headline: "",
    response_time: "",
    cv_url: "",
    role: "",
    created_at: "",
    // Bank Info [UPDATED]
    bank_name: "",
    account_number: "",
    account_holder_name: "",
    bank_branch: "",
    swift_code: "",
    // Mentee specific fields
    goal: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === "mentors") res = await getAdminMentors(page);
      else if (activeTab === "mentees") res = await getAdminMentees(page);
      else res = await getPendingMentors(page);

      if (res.success) {
        setData(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page]);

  // [REMOVED FUNCTION] Đã loại bỏ hàm handleStatusChange

  const handleReview = async (id: number, action: "accept" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this mentor?`)) return;
    try {
      await reviewMentorApplication(id, action);
      showToast.success(`Mentor ${action}ed successfully`);
      void fetchData();
    } catch {
      showToast.error("Action failed");
    }
  };

  const confirmDelete = (id: number, role: "mentee" | "mentor") => {
    setUserToDelete({ id, role });
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id, userToDelete.role);
      setData((prev) => prev.filter((u) => u.user_id !== userToDelete.id));
      setUserToDelete(null);
      showToast.success("User deleted successfully");
    } catch (error) {
      console.error("Delete failed", error);
      showToast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRowClick = (user: AdminMenteeItem | AdminMentorItem) => {
    // Không cho phép mở modal khi đang ở tab Pending vì Pending có action riêng
    if (activeTab === "pending") return;

    setEditingUser(user);
    const isMentor = activeTab !== "mentees";

    // Fill data vào form khi mở modal
    if (isMentor) {
      const m = user as AdminMentorItem;
      setEditFormData({
        first_name: m.first_name,
        last_name: m.last_name,
        email: m.email,
        bio: m.bio ?? "",
        headline: m.headline ?? "",
        response_time: m.response_time,
        cv_url: m.cv_url ?? "",
        role: m.role,
        created_at: m.created_at ?? "",
        // Fill Bank Info [UPDATED]
        bank_name: m.bank_name ?? "",
        account_number: m.account_number ?? "",
        account_holder_name: m.account_holder_name ?? "",
        bank_branch: m.bank_branch ?? "",
        swift_code: m.swift_code ?? "",
        // Reset Mentee fields
        goal: "",
      });
    } else {
      const m = user as AdminMenteeItem;
      setEditFormData({
        first_name: m.first_name,
        last_name: m.last_name,
        email: m.email,
        goal: m.goal ?? "",
        // Reset Mentor fields
        bio: "",
        headline: "",
        response_time: "",
        cv_url: "",
        role: "Mentee",
        created_at: "",
        bank_name: "",
        account_number: "",
        account_holder_name: "",
        bank_branch: "",
        swift_code: "",
      });
    }
  };

  const handleStatusUpdate = async (user: AdminMenteeItem | AdminMentorItem, status: string) => {
    setIsSaving(true);
    try {
      const statusToUpdate = status as "Active" | "Inactive" | "Banned" | "Pending";
      if (activeTab === "mentees") {
        await updateAdminMentee(user.user_id, { status: statusToUpdate });
      } else {
        await updateAdminMentor(user.user_id, { status: statusToUpdate });
      }
      showToast.success(`User status updated to ${status}`);
      await fetchData(); // Cập nhật lại bảng
      setStatusEditingUser(null);
      setNewStatus("");
    } catch (error) {
      console.error("Status update failed", error);
      showToast.error("Failed to update status.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    try {
      // Chỉ gửi các trường cơ bản cho Mentee
      if (activeTab === "mentees") {
        await updateAdminMentee(editingUser.user_id, {
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          email: editFormData.email,
          goal: editFormData.goal,
          // KHÔNG gửi status vì nó được quản lý ngoài
        });
      } else {
        // Gửi đầy đủ các trường cho Mentor (bao gồm cả bank info)
        await updateAdminMentor(editingUser.user_id, {
          first_name: editFormData.first_name,
          last_name: editFormData.last_name,
          email: editFormData.email,
          bio: editFormData.bio,
          headline: editFormData.headline,
          response_time: editFormData.response_time,
          // Bank Info [UPDATED]
          bank_name: editFormData.bank_name,
          account_number: editFormData.account_number,
          account_holder_name: editFormData.account_holder_name,
          bank_branch: editFormData.bank_branch,
          swift_code: editFormData.swift_code,
          // KHÔNG gửi status vì nó được quản lý ngoài
        });
      }
      showToast.success("User updated successfully");
      await fetchData(); // Fetch lại dữ liệu để cập nhật bảng
      setEditingUser(null);
    } catch (error) {
      console.error("Update failed", error);
      showToast.error("Failed to update user info.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function để lấy style cho Status (Giữ nguyên)
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-(--green)/10 text-(--green)";
      case "Pending":
        return "bg-yellow-500/10 text-yellow-400";
      case "Banned":
        return "bg-red-500/10 text-red-500";
      case "Inactive":
        return "bg-gray-500/10 text-gray-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <h1 className='text-3xl font-bold text-white'>User Management</h1>
        <div className='flex gap-1 rounded-xl bg-gray-800 p-1'>
          {(["mentors", "mentees", "pending"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                activeTab === tab ? "text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId='activeTab'
                  className='absolute inset-0 rounded-lg bg-(--primary)'
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className='relative z-10'>{tab === "pending" ? "Pending Approvals" : tab}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className='overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-xl'>
        {loading ? (
          <div className='p-12 text-center text-gray-400'>Loading data...</div>
        ) : (
          <table className='w-full text-left'>
            <thead className='border-b border-gray-700 bg-gray-900/50 text-xs font-semibold tracking-wider text-gray-400 uppercase'>
              <tr>
                <th className='px-6 py-4'>Name</th>
                <th className='px-6 py-4'>Email</th>
                <th className='px-6 py-4'>Status</th>
                {activeTab === "mentors" && <th className='px-6 py-4'>Job Title</th>}
                <th className='px-6 py-4 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-700 text-sm text-gray-300'>
              <AnimatePresence mode='popLayout'>
                {data.map((user) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={user.user_id}
                    // Thêm sự kiện click để mở Modal Edit (trừ tab Pending)
                    onClick={() => {
                      if (activeTab !== "pending") {
                        handleRowClick(user);
                      }
                    }}
                    className={`transition-colors hover:bg-gray-700/50 ${activeTab !== "pending" ? "cursor-pointer" : ""}`}
                  >
                    <td className='px-6 py-4 font-medium text-white'>
                      {user.first_name} {user.last_name}
                    </td>
                    <td className='px-6 py-4'>{user.email}</td>

                    {/* [UPDATED] Hiển thị Status tĩnh từ DB (không có dropdown) */}
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(user.status)}`}
                        >
                          {user.status}
                        </span>
                        {activeTab !== "pending" && ( // Không cho sửa status Pending tại đây
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Ngăn chặn mở Edit Info Modal
                              setStatusEditingUser(user);
                              setNewStatus(user.status as ValidStatus);
                            }}
                            className='rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white'
                            title='Edit Status'
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>

                    {activeTab === "mentors" && (
                      <td className='max-w-[200px] truncate px-6 py-4 text-gray-400'>
                        {(user as AdminMentorItem).headline ?? "N/A"}
                      </td>
                    )}
                    <td className='flex justify-end gap-2 px-6 py-4'>
                      {activeTab === "pending" ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleReview(user.user_id, "accept");
                            }}
                            className='rounded-lg bg-(--green)/10 p-2 text-(--green) transition-colors hover:bg-(--green) hover:text-white'
                            title='Approve'
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleReview(user.user_id, "reject");
                            }}
                            className='rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500 hover:text-white'
                            title='Reject'
                          >
                            <X size={18} />
                          </button>
                          {(user as AdminMentorItem).cv_url && (
                            <a
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              href={(user as AdminMentorItem).cv_url ?? ""}
                              target='_blank'
                              rel='noreferrer'
                              className='ml-2 flex items-center text-xs text-(--primary) hover:underline'
                            >
                              View CV
                            </a>
                          )}
                        </>
                      ) : (
                        // Nút Edit và Delete cho Active/Inactive/Banned users
                        <div className='flex gap-2'>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(user);
                            }}
                            className='rounded-lg bg-gray-700 p-2 text-gray-400 transition-colors hover:bg-(--primary) hover:text-white'
                            title='Edit User'
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(user.user_id, activeTab === "mentees" ? "mentee" : "mentor");
                            }}
                            className='rounded-lg bg-gray-700 p-2 text-gray-400 transition-colors hover:bg-red-500 hover:text-white'
                            title='Delete User'
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {data.length === 0 && (
                <tr>
                  <td colSpan={activeTab === "mentors" ? 6 : 5} className='p-8 text-center text-gray-500'>
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Pagination */}
      <div className='flex justify-center gap-2'>
        <button
          disabled={page === 1}
          onClick={() => {
            setPage((p) => p - 1);
          }}
          className='rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-white transition hover:brightness-110 disabled:opacity-50'
        >
          Previous
        </button>
        <span className='flex items-center px-2 py-1 text-sm text-gray-400'>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => {
            setPage((p) => p + 1);
          }}
          className='rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-white transition hover:brightness-110 disabled:opacity-50'
        >
          Next
        </button>
      </div>

      {/* --- EDIT MODAL (Status đã được đưa ra ngoài) --- */}
      <AnimatePresence>
        {editingUser && (
          <div className='fixed inset-0 z-60 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditingUser(null);
              }}
              className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className='scrollbar-thin scrollbar-thumb-gray-600 relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-700 bg-gray-800 shadow-2xl'
            >
              <div className='border-b border-gray-700 px-6 py-4'>
                <h3 className='text-xl font-bold text-white'>Edit User Info</h3>
                {/* Status hiện tại vẫn được hiển thị trong modal */}
                <p className='text-xs text-gray-500'>
                  User ID: {editingUser.user_id} | Current Status: {editingUser.status}
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  void handleSaveEdit(e);
                }}
                className='space-y-4 p-6'
              >
                {/* 1. Basic Info */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-400'>First Name</label>
                    <input
                      type='text'
                      value={editFormData.first_name}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, first_name: e.target.value });
                      }}
                      className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-400'>Last Name</label>
                    <input
                      type='text'
                      value={editFormData.last_name}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, last_name: e.target.value });
                      }}
                      className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-400'>Email</label>
                  <input
                    type='email'
                    value={editFormData.email}
                    onChange={(e) => {
                      setEditFormData({ ...editFormData, email: e.target.value });
                    }}
                    className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                  />
                </div>

                {/* 2. Role Specific Fields - Mentee */}
                {activeTab === "mentees" && (
                  <div>
                    <label className='block text-sm font-medium text-gray-400'>Learning Goal</label>
                    <textarea
                      rows={3}
                      value={editFormData.goal}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, goal: e.target.value });
                      }}
                      className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                    />
                  </div>
                )}

                {/* 3. Role Specific Fields - Mentor */}
                {activeTab !== "mentees" && (
                  <>
                    <h4 className='mt-6 border-b border-gray-700 pb-2 text-sm font-bold text-(--primary) uppercase'>
                      Mentor Profile
                    </h4>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-400'>Role (Read-only)</label>
                        <input
                          type='text'
                          value={editFormData.role}
                          disabled
                          className='mt-1 w-full cursor-not-allowed rounded-lg border border-gray-700 bg-gray-900 p-2.5 text-gray-500'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-400'>Response Time</label>
                        <input
                          type='text'
                          value={editFormData.response_time}
                          onChange={(e) => {
                            setEditFormData({ ...editFormData, response_time: e.target.value });
                          }}
                          className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-400'>Job Title</label>
                      <input
                        type='text'
                        value={editFormData.headline}
                        onChange={(e) => {
                          setEditFormData({ ...editFormData, headline: e.target.value });
                        }}
                        className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-400'>Bio</label>
                      <textarea
                        rows={3}
                        value={editFormData.bio}
                        onChange={(e) => {
                          setEditFormData({ ...editFormData, bio: e.target.value });
                        }}
                        className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                      />
                    </div>

                    {/* Bank Account Info [UPDATED] */}
                    <h4 className='mt-6 border-b border-gray-700 pb-2 text-sm font-bold text-yellow-400 uppercase'>
                      Bank Account Details
                    </h4>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-400'>Account Holder Name</label>
                        <input
                          type='text'
                          value={editFormData.account_holder_name}
                          onChange={(e) => {
                            setEditFormData({ ...editFormData, account_holder_name: e.target.value });
                          }}
                          className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-400'>Account Number</label>
                        <input
                          type='text'
                          value={editFormData.account_number}
                          onChange={(e) => {
                            setEditFormData({ ...editFormData, account_number: e.target.value });
                          }}
                          className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                        />
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-400'>Bank Name</label>
                        <input
                          type='text'
                          value={editFormData.bank_name}
                          onChange={(e) => {
                            setEditFormData({ ...editFormData, bank_name: e.target.value });
                          }}
                          className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-400'>Bank Branch</label>
                        <input
                          type='text'
                          value={editFormData.bank_branch}
                          onChange={(e) => {
                            setEditFormData({ ...editFormData, bank_branch: e.target.value });
                          }}
                          className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                        />
                      </div>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-400'>SWIFT Code</label>
                      <input
                        type='text'
                        value={editFormData.swift_code}
                        onChange={(e) => {
                          setEditFormData({ ...editFormData, swift_code: e.target.value });
                        }}
                        className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                      />
                    </div>

                    {/* CV URL (Read-only) */}
                    <div>
                      <label className='block text-sm font-medium text-gray-400'>CV URL</label>
                      <div className='flex gap-2'>
                        <input
                          type='text'
                          value={editFormData.cv_url}
                          disabled
                          className='mt-1 w-full cursor-not-allowed rounded-lg border border-gray-600 bg-gray-900 p-2.5 text-gray-400'
                        />
                        {editFormData.cv_url && (
                          <a
                            href={editFormData.cv_url}
                            target='_blank'
                            rel='noreferrer'
                            className='mt-1 flex items-center rounded-lg bg-gray-700 px-3 text-xs text-white hover:bg-gray-600'
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {editFormData.created_at && (
                  <div>
                    <label className='block text-sm font-medium text-gray-400'>Joined At (Read-only)</label>
                    <p className='mt-1 text-sm text-gray-500'>{new Date(editFormData.created_at).toLocaleString()}</p>
                  </div>
                )}

                <div className='flex gap-3 pt-4'>
                  <button
                    type='button'
                    onClick={() => {
                      setEditingUser(null);
                    }}
                    className='flex-1 rounded-lg border border-gray-600 bg-transparent py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-gray-700 hover:text-white'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isSaving}
                    className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-(--primary) py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-50'
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save size={16} /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {userToDelete && (
          <div className='fixed inset-0 z-60 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setUserToDelete(null);
              }}
              className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className='relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-2xl'
            >
              <div className='flex flex-col items-center p-6 pt-8'>
                <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10'>
                  <AlertCircle className='h-8 w-8 text-red-500' />
                </div>
                <h3 className='text-xl font-bold text-white'>Delete User?</h3>
                <p className='mt-2 text-center text-sm text-gray-400'>
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
              </div>

              <div className='flex gap-3 bg-gray-900/50 px-6 py-4'>
                <button
                  onClick={() => {
                    setUserToDelete(null);
                  }}
                  className='flex-1 rounded-lg border border-gray-600 bg-transparent py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-gray-700 hover:text-white'
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    void executeDelete();
                  }}
                  disabled={isDeleting}
                  className='flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50'
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {statusEditingUser && (
          <div className='fixed inset-0 z-60 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setStatusEditingUser(null);
                setNewStatus("");
              }}
              className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className='relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-gray-700 bg-gray-800 shadow-2xl'
            >
              <div className='border-b border-gray-700 px-6 py-4'>
                <h3 className='text-xl font-bold text-white'>Change User Status</h3>
                <p className='text-sm text-gray-500'>
                  {statusEditingUser.first_name} {statusEditingUser.last_name} ({statusEditingUser.user_id})
                </p>
              </div>

              <div className='space-y-4 p-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-400'>Select New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => {
                      setNewStatus(e.target.value as ValidStatus);
                    }}
                    className='mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-white outline-none focus:border-(--primary)'
                  >
                    <option value='' disabled>
                      -- Select Status --
                    </option>
                    {/* Các trạng thái hợp lệ từ admin.type.ts, loại bỏ Pending vì nó có flow riêng */}
                    {["Active", "Inactive", "Banned"].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                    newStatus || statusEditingUser.status
                  )}`}
                >
                  Current: {statusEditingUser.status}{" "}
                  {newStatus && newStatus !== statusEditingUser.status && `-> New: ${newStatus}`}
                </div>
              </div>

              <div className='flex gap-3 bg-gray-900/50 px-6 py-4'>
                <button
                  type='button'
                  onClick={() => {
                    setStatusEditingUser(null);
                    setNewStatus("");
                  }}
                  className='flex-1 rounded-lg border border-gray-600 bg-transparent py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-gray-700 hover:text-white'
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newStatus && newStatus !== statusEditingUser.status) {
                      void handleStatusUpdate(statusEditingUser, newStatus);
                    } else {
                      showToast.error("Please select a different status.");
                    }
                  }}
                  disabled={isSaving || !newStatus || newStatus === statusEditingUser.status}
                  className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-(--primary) py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-50'
                >
                  {isSaving ? (
                    "Updating..."
                  ) : (
                    <>
                      <Save size={16} /> Update Status
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
