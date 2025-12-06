import { useEffect, useState } from "react";
import { getAdminInvoices } from "@/apis/admin.api";
import type { InvoiceStatsData } from "@/types/admin.type";
import { Download, Filter, ChevronDown, Check } from "lucide-react"; // Thêm Icon
import { motion, AnimatePresence } from "framer-motion"; // Thêm AnimatePresence

const AdminInvoices = () => {
  const [data, setData] = useState<InvoiceStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  // State quản lý việc đóng/mở menu Dropdown (Giống Header)
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await getAdminInvoices({
        page,
        limit: 10,
        year: filters.year,
        month: filters.month,
      });
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  // Danh sách năm để render
  const years = [2024, 2025];

  return (
    <div className='space-y-6'>
      {/* --- BACKDROP: Lớp nền vô hình để xử lý click ra ngoài thì đóng menu --- */}
      {(showMonthMenu || showYearMenu) && (
        <div
          className='fixed inset-0 z-[40]'
          onClick={() => {
            setShowMonthMenu(false);
            setShowYearMenu(false);
          }}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'
      >
        <div>
          <h1 className='text-3xl font-bold text-white'>Invoices & Revenue</h1>
          <p className='mt-1 text-gray-400'>System wide financial tracking</p>
        </div>

        {/* --- CUSTOM FILTER BOX --- */}
        <div className='relative z-[50] flex items-center gap-3 rounded-xl border border-(--primary) bg-gray-900/80 p-2 shadow-[0_0_15px_-3px_rgba(106,13,173,0.3)] backdrop-blur-md transition-all hover:shadow-[0_0_20px_-3px_rgba(106,13,173,0.5)]'>
          <Filter size={18} className='ml-2 text-(--primary)' />

          {/* === MONTH DROPDOWN === */}
          <div className='relative'>
            <button
              onClick={() => {
                setShowMonthMenu(!showMonthMenu);
                setShowYearMenu(false);
              }}
              className='flex items-center gap-2 px-2 py-1 text-sm font-medium text-white transition-colors hover:text-(--primary)'
            >
              <span>Month {filters.month}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showMonthMenu ? "rotate-180" : ""}`}
              />
            </button>

            {/* Menu List */}
            <AnimatePresence>
              {showMonthMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className='scrollbar-thin scrollbar-thumb-gray-600 absolute top-full left-0 mt-2 max-h-60 w-36 overflow-y-auto rounded-xl border border-gray-700 bg-gray-800 p-1 shadow-xl'
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setFilters({ ...filters, month: m });
                        setShowMonthMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-700 ${
                        filters.month === m ? "bg-(--primary)/20 text-(--primary)" : "text-gray-300"
                      }`}
                    >
                      <span>Month {m}</span>
                      {filters.month === m && <Check size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className='h-4 w-[1px] bg-(--primary)/50'></div>

          {/* === YEAR DROPDOWN === */}
          <div className='relative'>
            <button
              onClick={() => {
                setShowYearMenu(!showYearMenu);
                setShowMonthMenu(false);
              }}
              className='flex items-center gap-2 px-2 py-1 text-sm font-medium text-white transition-colors hover:text-(--primary)'
            >
              <span>{filters.year}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showYearMenu ? "rotate-180" : ""}`}
              />
            </button>

            {/* Menu List */}
            <AnimatePresence>
              {showYearMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className='absolute top-full right-0 mt-2 w-28 rounded-xl border border-gray-700 bg-gray-800 p-1 shadow-xl'
                >
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => {
                        setFilters({ ...filters, year: y });
                        setShowYearMenu(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-gray-700 ${
                        filters.year === y ? "bg-(--primary)/20 text-(--primary)" : "text-gray-300"
                      }`}
                    >
                      <span>{y}</span>
                      {filters.year === y && <Check size={14} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className='rounded-xl border border-(--green)/30 bg-transparent p-6'
        >
          <h3 className='text-xs font-bold tracking-wider text-(--green) uppercase'>Total Revenue (Selected Period)</h3>
          <p className='mt-2 text-4xl font-bold text-white'>${data?.total_amount.toLocaleString() ?? 0}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className='rounded-xl border border-gray-700 bg-gray-800 p-6'
        >
          <h3 className='text-xs font-bold tracking-wider text-gray-400 uppercase'>Total Transactions</h3>
          <p className='mt-2 text-4xl font-bold text-white'>{data?.total_count ?? 0}</p>
        </motion.div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-xl'
      >
        <table className='w-full text-left'>
          <thead className='border-b border-gray-700 bg-gray-900/50 text-xs font-semibold tracking-wider text-gray-400 uppercase'>
            <tr>
              <th className='px-6 py-4'>Invoice ID</th>
              <th className='px-6 py-4'>Date</th>
              <th className='px-6 py-4'>Mentee</th>
              <th className='px-6 py-4'>Mentor</th>
              <th className='px-6 py-4'>Plan</th>
              <th className='px-6 py-4 text-right'>Amount</th>
              <th className='px-6 py-4 text-right'>Receipt</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-700 text-sm text-gray-300'>
            {loading ? (
              <tr>
                <td colSpan={7} className='p-12 text-center text-gray-500'>
                  Loading...
                </td>
              </tr>
            ) : (
              data?.invoices.map((inv) => (
                <tr key={inv.invoice_id} className='transition-colors hover:bg-gray-700/50'>
                  <td className='px-6 py-4 font-mono text-xs text-gray-500'>{inv.invoice_id}</td>
                  <td className='px-6 py-4'>{new Date(inv.paid_time).toLocaleDateString()}</td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-500'>
                        {inv.mentee_first_name[0]}
                      </div>
                      <div className='flex flex-col'>
                        <span className='font-medium text-white'>
                          {inv.mentee_first_name} {inv.mentee_last_name}
                        </span>
                        <span className='max-w-[120px] truncate text-xs text-gray-500'>{inv.mentee_email}</span>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-500'>
                        {inv.mentor_first_name[0]}
                      </div>
                      <div className='flex flex-col'>
                        <span className='font-medium text-white'>
                          {inv.mentor_first_name} {inv.mentor_last_name}
                        </span>
                        <span className='max-w-[120px] truncate text-xs text-gray-500'>{inv.mentor_email}</span>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <span className='block font-medium text-white'>{inv.plan_type}</span>
                    <span className='text-xs text-gray-500'>{inv.plan_description.substring(0, 20)}...</span>
                  </td>
                  <td className='px-6 py-4 text-right font-bold text-(--green)'>+${inv.amount_total}</td>
                  <td className='px-6 py-4 text-right'>
                    {inv.stripe_receipt_url ? (
                      <a
                        href={inv.stripe_receipt_url}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-700 text-gray-400 transition-colors hover:bg-gray-600 hover:text-white'
                      >
                        <Download size={16} />
                      </a>
                    ) : (
                      <span className='text-gray-600'>-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      {data && (
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
            Page {page} of {Math.ceil(data.total_count / 10)}
          </span>
          <button
            disabled={!data.pagination.hasNextPage}
            onClick={() => {
              setPage((p) => p + 1);
            }}
            className='rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-sm text-white transition hover:brightness-110 disabled:opacity-50'
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminInvoices;
