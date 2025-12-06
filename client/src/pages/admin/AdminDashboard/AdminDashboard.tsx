import { useEffect, useState } from "react";
import { Users, DollarSign, Calendar, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { getSystemStats } from "@/apis/admin.api";
import type { SystemStats } from "@/types/admin.type";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  colorClass: string;
}

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
    // Style giống Form container bên Login: bg-gray-800, rounded-xl
    className='rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg'
  >
    <div className='flex items-center justify-between'>
      <div>
        <p className='text-sm font-medium text-gray-400'>{title}</p>
        <h3 className='mt-2 text-3xl font-bold text-white'>{value}</h3>
      </div>
      <div className={`rounded-full p-3 ${colorClass} bg-opacity-20`}>
        <Icon size={24} className={colorClass.replace("bg-", "text-")} />
      </div>
    </div>
    {subtext && <p className='mt-4 text-sm text-gray-500'>{subtext}</p>}
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getSystemStats();
        if (res.success && res.data) setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };
    void fetchStats();
  }, []);

  if (loading) return <div className='flex h-64 items-center justify-center text-gray-400'>Loading stats...</div>;
  if (!stats) return <div className='text-red-500'>Failed to load data</div>;

  return (
    <div className='space-y-8'>
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className='text-3xl font-bold text-white'>Dashboard Overview</h1>
        <p className='mt-1 text-gray-400'>Welcome back, Administrator.</p>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Total Revenue'
          value={`$${stats.invoices.totalRevenue.toLocaleString()}`}
          subtext={`+$${String(stats.invoices.thisMonthRevenue)} this month`}
          icon={DollarSign}
          colorClass='bg-(--green) text-(--green)' // Dùng màu brand
        />
        <StatCard
          title='Total Users'
          value={stats.users.total}
          subtext={`${String(stats.users.mentors)} Mentors, ${String(stats.users.mentees)} Mentees`}
          icon={Users}
          colorClass='bg-(--primary) text-(--primary)' // Dùng màu brand
        />
        <StatCard
          title='Active Bookings'
          value={stats.bookings.total}
          subtext={`${String(stats.bookings.thisMonth)} bookings this month`}
          icon={Calendar}
          colorClass='bg-purple-500 text-purple-500'
        />
        <StatCard
          title='Pending Mentors'
          value={stats.mentors.pending}
          subtext='Requires approval'
          icon={UserCheck}
          colorClass='bg-yellow-500 text-yellow-500'
        />
      </div>

      {/* Detailed Sections */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          // Sử dụng style gradient nhẹ giống Login right side background
          className='rounded-xl border border-gray-700 bg-gray-800 p-6'
        >
          <h3 className='mb-4 text-lg font-bold text-white'>Mentor Status</h3>
          <div className='space-y-4'>
            <div className='flex justify-between border-b border-gray-700 pb-2'>
              <span className='text-gray-400'>Active</span>
              <span className='font-bold text-(--green)'>{stats.mentors.active}</span>
            </div>
            <div className='flex justify-between border-b border-gray-700 pb-2'>
              <span className='text-gray-400'>Pending Approval</span>
              <span className='font-bold text-yellow-400'>{stats.mentors.pending}</span>
            </div>
            <div className='flex justify-between border-b border-gray-700 pb-2'>
              <span className='text-gray-400'>Inactive</span>
              <span className='font-bold text-gray-500'>{stats.mentors.inactive}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className='rounded-xl border border-gray-700 bg-gray-800 p-6'
        >
          <h3 className='mb-4 text-lg font-bold text-white'>Meeting Health</h3>
          <div className='space-y-4'>
            <div className='flex justify-between border-b border-gray-700 pb-2'>
              <span className='text-gray-400'>Completed Meetings</span>
              <span className='font-bold text-blue-400'>{stats.meetings.completed}</span>
            </div>
            <div className='flex justify-between border-b border-gray-700 pb-2'>
              <span className='text-gray-400'>Upcoming</span>
              <span className='font-bold text-(--primary)'>{stats.meetings.upcoming}</span>
            </div>
            <div className='flex justify-between border-b border-gray-700 pb-2'>
              <span className='text-gray-400'>Cancelled</span>
              <span className='font-bold text-red-400'>{stats.meetings.cancelled}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
