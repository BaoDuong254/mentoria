import React, { useState } from "react";
import { Plus, Pencil, Trash2, Clock, X, Zap, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
export interface Plan {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: number;
}

const INITIAL_PLANS: Plan[] = [
  {
    id: 1,
    title: "Beginner Session",
    description: "Perfect for students needing a quick resume review or initial career guidance path.",
    duration: 45,
    price: 50,
  },
  {
    id: 2,
    title: "Deep Dive Strategy",
    description: "Comprehensive leadership development, mock interview, and long-term growth strategy.",
    duration: 90,
    price: 120,
  },
  {
    id: 3,
    title: "Quick Chat",
    description: "A short coffee chat to ask specific questions about the industry.",
    duration: 30,
    price: 30,
  },
];

function MentorPlans() {
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [activeTab, setActiveTab] = useState<"session" | "plans">("session");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Plan>>({
    title: "",
    description: "",
    duration: 60,
    price: 50,
  });

  // --- Handlers ---
  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData(plan);
    } else {
      setEditingPlan(null);
      setFormData({ title: "", description: "", duration: 60, price: 50 });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? ({ ...p, ...formData } as Plan) : p)));
    } else {
      const newPlan: Plan = {
        ...(formData as Plan),
      };
      setPlans((prev) => [...prev, newPlan]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className='min-h-screen w-full bg-[#0f111a] font-sans text-gray-300'>
      {/* --- HEADER --- */}
      <header className='sticky top-0 z-40 border-b border-gray-800 bg-[#0f111a]/95 px-8 py-6 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-7xl items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-white'>Mentorship Programs</h1>
            <p className='mt-1 text-sm text-gray-400'>Manage your session packages.</p>
          </div>
          <button
            onClick={() => {
              handleOpenModal();
            }}
            className='flex items-center gap-2 rounded-xl bg-(--primary) px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:brightness-110'
          >
            <Plus size={20} /> Create New Plan
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className='mx-auto max-w-7xl px-8 py-8'>
        {/* TABS */}
        <div className='mb-8 flex items-center gap-6 border-b border-gray-800 pb-1'>
          <button
            onClick={() => {
              setActiveTab("session");
            }}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
              activeTab === "session"
                ? "border-(--primary) text-(--primary)"
                : "border-transparent text-gray-400 hover:text-white"
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
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            <List size={18} /> Long-term Mentorship
          </button>
        </div>

        {/* GRID LAYOUT */}
        {activeTab === "session" ? (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <AnimatePresence>
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className='group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-700 bg-[#1e2130] p-6 shadow-xl transition-all hover:border-gray-500'
                >
                  {/* Card Header: Title & Actions */}
                  <div className='mb-4 flex items-start justify-between'>
                    {/* Title */}
                    <h3 className='line-clamp-2 w-3/4 text-xl font-bold text-white transition-colors group-hover:text-(--primary)'>
                      {plan.title}
                    </h3>

                    {/* Action Buttons */}
                    <div className='flex gap-2'>
                      <button
                        onClick={() => {
                          handleOpenModal(plan);
                        }}
                        className='rounded-lg bg-gray-700/50 p-2 text-gray-400 transition-colors hover:bg-(--primary) hover:text-white'
                        title='Edit'
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(plan.id);
                        }}
                        className='rounded-lg bg-gray-700/50 p-2 text-gray-400 transition-colors hover:bg-red-500 hover:text-white'
                        title='Delete'
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className='mb-4'>
                    <div className='mb-3 flex items-end gap-1'>
                      <span className='text-3xl font-bold text-white'>${plan.price}</span>
                      <span className='mb-1 text-sm text-gray-400'>/ session</span>
                    </div>

                    <p className='line-clamp-3 h-16 text-sm leading-relaxed text-gray-400'>{plan.description}</p>
                  </div>

                  {/* Footer Info */}
                  <div className='mt-auto border-t border-gray-700 pt-4'>
                    <div className='flex items-center gap-2 text-sm font-medium text-gray-300'>
                      <Clock size={16} className='text-(--primary)' />
                      {plan.duration} minutes
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Card Button */}
              <button
                onClick={() => {
                  handleOpenModal();
                }}
                className='flex min-h-[250px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-700 bg-transparent text-gray-500 transition-all hover:border-(--primary) hover:bg-(--primary)/5 hover:text-(--primary)'
              >
                <div className='mb-4 rounded-full bg-gray-800 p-4 transition-transform group-hover:scale-110'>
                  <Plus size={32} />
                </div>
                <span className='font-bold'>Add Another Plan</span>
              </button>
            </AnimatePresence>
          </div>
        ) : (
          <div className='flex h-64 w-full items-center justify-center rounded-2xl border border-gray-700 bg-[#1e2130] text-gray-500'>
            <div className='text-center'>
              <LayoutGrid size={48} className='mx-auto mb-4 opacity-50' />
              <p>Long-term mentorship packages content goes here...</p>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL (Không thay đổi logic) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='w-full max-w-lg overflow-hidden rounded-2xl border border-gray-700 bg-[#1e2130] shadow-2xl'
            >
              <div className='flex items-center justify-between border-b border-gray-700 bg-[#151720] px-6 py-4'>
                <h3 className='text-lg font-bold text-white'>{editingPlan ? "Edit Plan" : "Create New Plan"}</h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                  className='text-gray-400 hover:text-white'
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className='space-y-5 p-6'>
                <div>
                  <label className='mb-1.5 block text-sm font-semibold text-gray-300'>Title</label>
                  <input
                    required
                    type='text'
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                    }}
                    className='w-full rounded-xl border border-gray-600 bg-gray-800 px-4 py-3 text-white focus:border-(--primary) focus:ring-1 focus:ring-(--primary) focus:outline-none'
                  />
                </div>

                <div>
                  <label className='mb-1.5 block text-sm font-semibold text-gray-300'>Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => {
                      setFormData({ ...formData, description: e.target.value });
                    }}
                    className='w-full resize-none rounded-xl border border-gray-600 bg-gray-800 px-4 py-3 text-white focus:border-(--primary) focus:ring-1 focus:ring-(--primary) focus:outline-none'
                  />
                </div>

                <div className='grid grid-cols-2 gap-5'>
                  <div>
                    <label className='mb-1.5 block text-sm font-semibold text-gray-300'>Duration (min)</label>
                    <input
                      required
                      type='number'
                      value={formData.duration}
                      onChange={(e) => {
                        setFormData({ ...formData, duration: Number(e.target.value) });
                      }}
                      className='w-full rounded-xl border border-gray-600 bg-gray-800 px-4 py-3 text-white focus:border-(--primary) focus:ring-1 focus:ring-(--primary) focus:outline-none'
                    />
                  </div>
                  <div>
                    <label className='mb-1.5 block text-sm font-semibold text-gray-300'>Price ($)</label>
                    <input
                      required
                      type='number'
                      value={formData.price}
                      onChange={(e) => {
                        setFormData({ ...formData, price: Number(e.target.value) });
                      }}
                      className='w-full rounded-xl border border-gray-600 bg-gray-800 px-4 py-3 text-white focus:border-(--primary) focus:ring-1 focus:ring-(--primary) focus:outline-none'
                    />
                  </div>
                </div>

                <div className='mt-4 flex gap-3 border-t border-gray-700 pt-4'>
                  <button
                    type='button'
                    onClick={() => {
                      setIsModalOpen(false);
                    }}
                    className='flex-1 rounded-xl bg-gray-700 py-3 text-sm font-bold text-gray-300 hover:bg-gray-600'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='flex-1 rounded-xl bg-(--primary) py-3 text-sm font-bold text-white hover:brightness-110'
                  >
                    {editingPlan ? "Save Changes" : "Create Plan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MentorPlans;
