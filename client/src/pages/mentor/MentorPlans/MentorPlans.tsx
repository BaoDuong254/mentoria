import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Clock, X, Zap, LayoutGrid, List, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { getMentorPlans, createMentorPlan, updateMentorPlan, deleteMentorPlan } from "@/apis/mentor.api";
import type { Plan_Manage, PlanSession, CreatePlanSessionRequest, UpdatePlanRequest } from "@/types/mentor.type";

function MentorPlans() {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<Plan_Manage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<"session" | "plans">("session");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan_Manage | null>(null);

  // State cho Popup xóa
  const [deletePlanId, setDeletePlanId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    duration: number;
    price: number;
  }>({
    title: "",
    description: "",
    duration: 60,
    price: 50,
  });

  // --- Fetch Data ---
  const fetchPlans = async () => {
    if (!user?.user_id) return;
    try {
      setIsLoading(true);
      const res = await getMentorPlans(user.user_id);
      if (res.success) {
        setPlans(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      // alert("Could not load plans. Please try again."); // Tắt alert mặc định cho sạch UI
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  // --- Handlers ---
  const handleOpenModal = (plan?: Plan_Manage) => {
    if (plan) {
      setEditingPlan(plan);
      const sessionPlan = plan as PlanSession;
      setFormData({
        title: plan.plan_type,
        description: plan.plan_description,
        price: plan.plan_charge,
        duration: sessionPlan.sessions_duration || 60,
      });
    } else {
      setEditingPlan(null);
      setFormData({ title: "", description: "", duration: 60, price: 50 });
    }
    setIsModalOpen(true);
  };

  // Mở Popup xác nhận xóa thay vì window.confirm
  const confirmDelete = (planId: number) => {
    setDeletePlanId(planId);
  };

  // Xử lý xóa thực tế
  const executeDelete = async () => {
    if (!user?.user_id || !deletePlanId) return;

    setIsDeleting(true);
    try {
      await deleteMentorPlan(user.user_id, deletePlanId);

      setPlans((prev) => prev.filter((p) => p.plan_id !== deletePlanId));
      setDeletePlanId(null); // Đóng popup
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete plan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.user_id) {
      alert("Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }
    if (isNaN(formData.price) || isNaN(formData.duration)) {
      alert("Vui lòng nhập đúng định dạng số cho Giá và Thời lượng.");
      return;
    }
    setIsSubmitting(true);
    try {
      console.log("Đang gửi dữ liệu...", formData); // Debug log

      if (editingPlan) {
        // --- UPDATE ---
        const updatePayload: UpdatePlanRequest = {
          planType: formData.title,
          planDescription: formData.description,
          planCharge: formData.price,
          sessionsDuration: formData.duration,
        };
        await updateMentorPlan(user.user_id, editingPlan.plan_id, updatePayload);

        console.log("Update thành công!");
      } else {
        // --- CREATE ---
        const createPayload: CreatePlanSessionRequest = {
          planType: formData.title,
          planDescription: formData.description,
          planCharge: formData.price,
          sessionsDuration: formData.duration,
        };
        await createMentorPlan(user.user_id, createPayload);

        console.log("Tạo mới thành công!");

        setActiveTab("session");
      }

      // Refresh lại data
      await fetchPlans();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Không thể lưu Plan. Hãy kiểm tra lại kết nối hoặc dữ liệu nhập.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (activeTab === "session") return p.plan_category === "session";
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (activeTab === "plans") return p.plan_category === "mentorship";
    return false;
  });

  return (
    <div className='min-h-screen w-full bg-(--bg-grey) font-sans text-white'>
      {/* --- HEADER --- */}
      <header className='sticky top-0 z-40 border-b border-slate-700/60 bg-(--bg-grey)/95 px-8 py-6 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-7xl items-center justify-between'>
          <div>
            <h1 className='text-3xl font-extrabold text-white'>Mentorship Programs</h1>
            <p className='mt-1 text-sm text-(--text-grey)'>Manage your session packages and offerings.</p>
          </div>
          <button
            onClick={() => {
              handleOpenModal();
            }}
            className='flex items-center gap-2 rounded-lg bg-(--green) px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0'
          >
            <Plus size={20} /> Create New Plan
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className='mx-auto max-w-7xl px-8 py-8'>
        <div className='mb-8 flex items-center gap-6 border-b border-slate-700 pb-1'>
          <button
            onClick={() => {
              setActiveTab("session");
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
              activeTab === "session"
                ? "border-(--primary) text-(--primary)"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Zap size={18} /> 1-on-1 Sessions
          </button>
          <button
            onClick={() => {
              setActiveTab("plans");
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
              activeTab === "plans"
                ? "border-(--primary) text-(--primary)"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <List size={18} /> Long-term Mentorship
          </button>
        </div>

        {isLoading ? (
          <div className='flex h-64 w-full items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-(--primary)' />
          </div>
        ) : (
          <>
            {activeTab === "session" ? (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {/* UPDATE MOTION: 
                   - Thêm mode="popLayout" để item xóa không chiếm chỗ
                */}
                <AnimatePresence mode='popLayout'>
                  {filteredPlans.map((plan) => {
                    const sessionPlan = plan as PlanSession;
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        onClick={() => {
                          handleOpenModal(plan);
                        }}
                        key={plan.plan_id}
                        className='group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-700 bg-slate-800/40 p-6 shadow transition-colors hover:border-(--primary)'
                      >
                        <div className='mb-4 flex items-start justify-between'>
                          <h3 className='line-clamp-2 w-3/4 text-xl font-bold text-white transition-colors group-hover:text-(--primary)'>
                            {plan.plan_type}
                          </h3>
                          <div className='flex gap-2'>
                            <button
                              onClick={() => {
                                handleOpenModal(plan);
                              }}
                              className='rounded-lg bg-slate-700/50 p-2 text-slate-400 transition-colors hover:bg-(--primary) hover:text-white'
                              title='Edit'
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDelete(plan.plan_id);
                              }}
                              className='rounded-lg bg-slate-700/50 p-2 text-slate-400 transition-colors hover:bg-red-500 hover:text-white'
                              title='Delete'
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className='mb-4'>
                          <div className='mb-3 flex items-end gap-1'>
                            <span className='text-3xl font-bold text-(--green)'>${plan.plan_charge}</span>
                            <span className='mb-1 text-sm text-slate-400'>/ session</span>
                          </div>
                          <p className='line-clamp-3 h-16 text-sm leading-relaxed text-slate-300'>
                            {plan.plan_description}
                          </p>
                        </div>

                        <div className='mt-auto border-t border-slate-700 pt-4'>
                          <div className='flex items-center gap-2 text-sm font-medium text-slate-300'>
                            <Clock size={16} className='text-(--primary)' />
                            {sessionPlan.sessions_duration} minutes
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Add New Card Button (Static, no layout motion needed usually, but nice to keep consistant) */}
                <motion.button
                  layout
                  onClick={() => {
                    handleOpenModal();
                  }}
                  className='flex min-h-[250px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-transparent text-slate-500 transition-all hover:border-(--primary) hover:bg-slate-800/30 hover:text-(--primary)'
                >
                  <div className='mb-4 rounded-full bg-slate-800 p-4 transition-transform group-hover:scale-110'>
                    <Plus size={32} />
                  </div>
                  <span className='font-bold'>Add Another Plan</span>
                </motion.button>
              </div>
            ) : (
              <div className='flex h-64 w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-800/40 text-slate-500'>
                <div className='text-center'>
                  <LayoutGrid size={48} className='mx-auto mb-4 opacity-50' />
                  <p>Long-term mentorship packages (Coming soon)</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* --- CREATE/EDIT MODAL --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className='w-full max-w-lg overflow-hidden rounded-xl border border-slate-700 bg-(--bg-grey) shadow-2xl'
            >
              <div className='flex items-center justify-between border-b border-slate-700 bg-slate-800/50 px-6 py-4'>
                <h3 className='text-lg font-bold text-white'>{editingPlan ? "Edit Plan" : "Create New Plan"}</h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                  className='text-slate-400 hover:text-white'
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => void handleSubmit(e)} className='space-y-5 p-6'>
                {/* ... Form fields giữ nguyên ... */}
                <div>
                  <label className='mb-1.5 block text-sm font-medium text-slate-300'>Title (Plan Type)</label>
                  <input
                    required
                    type='text'
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                    }}
                    placeholder='e.g., Mock Interview, Career Talk'
                    className='w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-(--primary) focus:ring-1 focus:ring-(--primary) focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-1.5 block text-sm font-medium text-slate-300'>Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                    }}
                    placeholder='Describe what mentees will get...'
                    className='w-full resize-none rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-(--primary) focus:ring-1 focus:ring-(--primary) focus:outline-none'
                  />
                </div>
                <div className='grid grid-cols-2 gap-5'>
                  <div>
                    <label className='mb-1.5 block text-sm font-medium text-slate-300'>Duration (min)</label>
                    <input
                      required
                      type='number'
                      value={formData.duration}
                      onChange={(e) => {
                        setFormData({ ...formData, duration: Number(e.target.value) });
                      }}
                      className='w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white focus:border-(--primary) focus:ring-1 focus:ring-(--primary) focus:outline-none'
                    />
                  </div>
                  <div>
                    <label className='mb-1.5 block text-sm font-medium text-slate-300'>Price ($)</label>
                    <input
                      required
                      type='number'
                      value={formData.price}
                      onChange={(e) => {
                        setFormData({ ...formData, price: Number(e.target.value) });
                      }}
                      className='w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-white focus:border-(--primary) focus:ring-1 focus:ring-(--primary) focus:outline-none'
                    />
                  </div>
                </div>

                <div className='mt-4 flex gap-3 border-t border-slate-700 pt-4'>
                  <button
                    type='button'
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                    className='flex-1 rounded-lg bg-slate-700 py-3 text-sm font-bold text-slate-300 hover:bg-slate-600'
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='flex-1 rounded-lg bg-(--primary) py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50'
                  >
                    {isSubmitting ? "Saving..." : editingPlan ? "Save Changes" : "Create Plan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- NEW BEAUTIFUL DELETE MODAL --- */}
      <AnimatePresence>
        {deletePlanId !== null && (
          <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
            {/* Backdrop with Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDeletePlanId(null);
              }}
              className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className='relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl'
            >
              <div className='flex flex-col items-center p-6 pt-8'>
                <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10'>
                  <AlertCircle className='h-8 w-8 text-red-500' />
                </div>
                <h3 className='text-xl font-bold text-white'>Delete this Plan?</h3>
                <p className='mt-2 text-center text-sm text-slate-400'>
                  This action cannot be undone. This plan will be permanently removed from your profile.
                </p>
              </div>

              <div className='flex gap-3 bg-slate-900/50 px-6 py-4'>
                <button
                  onClick={() => {
                    setDeletePlanId(null);
                  }}
                  className='flex-1 rounded-lg border border-slate-600 bg-transparent py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-700 hover:text-white'
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    void executeDelete();
                  }}
                  disabled={isDeleting}
                  className='flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100'
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete It"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MentorPlans;
