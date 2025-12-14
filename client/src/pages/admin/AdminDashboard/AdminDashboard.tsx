import { useEffect, useState, useCallback } from "react";
// [UPDATED IMPORTS] Sử dụng các icon tượng trưng hơn
import {
  Users,
  Calendar,
  Hourglass,
  TrendingUp,
  Star,
  Video,
  DollarSign,
  BarChart3,
  Filter,
  RefreshCw,
  ChevronDown,
  Award,
  Briefcase,
  Tag,
  CalendarRange,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSystemStats, getDashboardStats } from "@/apis/admin.api";
import type {
  SystemStats,
  DashboardStatsData,
  MentorDashboardStats,
  MonthlyDashboardStats,
  CategoryDashboardStats,
  DashboardGroupBy,
  DashboardSortBy,
  DashboardSortOrder,
  DashboardStatsParams,
} from "@/types/admin.type";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  colorClass: string;
  iconColor: string;
}

type TabType = "overview" | "mentors" | "monthly" | "categories";

const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
};

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, iconColor }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ duration: 0.3 }}
    className='rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-lg backdrop-blur-sm'
  >
    <div className='flex items-center justify-between'>
      <div>
        <p className='text-sm font-medium text-gray-400'>{title}</p>
        <h3 className='mt-2 text-3xl font-bold text-white'>{value}</h3>
      </div>
      <div className={`rounded-full p-3 ${colorClass} bg-opacity-20 shadow-lg`}>
        <Icon size={24} className={iconColor} />
      </div>
    </div>
    {subtext && <p className='mt-4 text-sm text-gray-500'>{subtext}</p>}
  </motion.div>
);

const LoadingSpinner = () => (
  <div className='flex h-64 items-center justify-center'>
    <div className='relative'>
      <div className='h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-blue-500'></div>
      <div className='absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-blue-500 opacity-20'></div>
    </div>
  </div>
);

const TabButton = ({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
      active
        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    }`}
  >
    <Icon size={18} />
    {label}
  </button>
);

// Progress Bar Component
const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className='h-2 w-full overflow-hidden rounded-full bg-gray-700'>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${String(percentage)}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
};

// Rating Stars Component
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-600"}
        />
      ))}
      <span className='ml-1 text-sm text-gray-400'>{rating.toFixed(1)}</span>
    </div>
  );
};

// Filter Dropdown Component
const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) => (
  <div className='relative'>
    <label className='mb-1 block text-xs text-gray-500'>{label}</label>
    <div className='relative'>
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className='w-full appearance-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pr-8 text-sm text-white focus:border-blue-500 focus:outline-none'
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className='pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-gray-400' />
    </div>
  </div>
);

// Date Input Component
const DateInput = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <div className='relative'>
    <label className='mb-1 block text-xs text-gray-500'>{label}</label>
    <input
      type='date'
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      className='w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none'
    />
  </div>
);

// Number Input Component
const NumberInput = ({
  label,
  value,
  onChange,
  placeholder,
  min = 0,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
}) => (
  <div className='relative'>
    <label className='mb-1 block text-xs text-gray-500'>{label}</label>
    <input
      type='number'
      value={value}
      min={min}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      placeholder={placeholder}
      className='w-32 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none'
    />
  </div>
);

// Overview Section
const OverviewSection = ({ stats }: { stats: SystemStats }) => (
  <div className='space-y-6'>
    {/* Key Metrics Grid */}
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
      <StatCard
        title='Total Revenue'
        value={`$${stats.invoices.totalRevenue.toLocaleString()}`}
        subtext={`+$${String(stats.invoices.thisMonthRevenue)} this month`}
        icon={TrendingUp}
        colorClass='bg-emerald-500'
        iconColor='text-emerald-400'
      />
      <StatCard
        title='Total Users'
        value={stats.users.total}
        subtext={`${String(stats.users.mentors)} Mentors, ${String(stats.users.mentees)} Mentees`}
        icon={Users}
        colorClass='bg-blue-500'
        iconColor='text-blue-400'
      />
      <StatCard
        title='Active Bookings'
        value={stats.bookings.total}
        subtext={`${String(stats.bookings.thisMonth)} bookings this month`}
        icon={Calendar}
        colorClass='bg-purple-500'
        iconColor='text-purple-400'
      />
      <StatCard
        title='Pending Mentors'
        value={stats.mentors.pending}
        subtext='Requires approval'
        icon={Hourglass}
        colorClass='bg-amber-500'
        iconColor='text-amber-400'
      />
    </div>

    {/* Detailed Sections */}
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className='rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 p-6'
      >
        <h3 className='mb-4 flex items-center gap-2 text-lg font-bold text-white'>
          <Users size={20} className='text-blue-400' />
          Mentor Status
        </h3>
        <div className='space-y-4'>
          {[
            { label: "Active", value: stats.mentors.active, color: "text-emerald-400", bgColor: "bg-emerald-500" },
            {
              label: "Pending Approval",
              value: stats.mentors.pending,
              color: "text-amber-400",
              bgColor: "bg-amber-500",
            },
            { label: "Inactive", value: stats.mentors.inactive, color: "text-gray-400", bgColor: "bg-gray-500" },
            { label: "Banned", value: stats.mentors.banned, color: "text-red-400", bgColor: "bg-red-500" },
          ].map((item) => (
            <div key={item.label} className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-gray-400'>{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.value}</span>
              </div>
              <ProgressBar
                value={item.value}
                max={stats.mentors.active + stats.mentors.pending + stats.mentors.inactive + stats.mentors.banned}
                color={item.bgColor}
              />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className='rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 p-6'
      >
        <h3 className='mb-4 flex items-center gap-2 text-lg font-bold text-white'>
          <Video size={20} className='text-purple-400' />
          Meeting Status
        </h3>
        <div className='space-y-4'>
          {[
            { label: "Completed", value: stats.meetings.completed, color: "text-blue-400", bgColor: "bg-blue-500" },
            { label: "Upcoming", value: stats.meetings.upcoming, color: "text-emerald-400", bgColor: "bg-emerald-500" },
            { label: "Cancelled", value: stats.meetings.cancelled, color: "text-red-400", bgColor: "bg-red-500" },
          ].map((item) => (
            <div key={item.label} className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-gray-400'>{item.label}</span>
                <span className={`font-bold ${item.color}`}>{item.value}</span>
              </div>
              <ProgressBar value={item.value} max={stats.meetings.total || 1} color={item.bgColor} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Plans & Invoices Quick Stats */}
    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className='rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 p-6'
      >
        <h3 className='mb-4 flex items-center gap-2 text-lg font-bold text-white'>
          <Briefcase size={20} className='text-indigo-400' />
          Plans
        </h3>
        <div className='grid grid-cols-2 gap-4'>
          <div className='rounded-lg bg-gray-800/50 p-3 text-center'>
            <p className='text-2xl font-bold text-white'>{stats.plans.totalPlans}</p>
            <p className='text-xs text-gray-500'>Total Plans</p>
          </div>
          <div className='rounded-lg bg-gray-800/50 p-3 text-center'>
            <p className='text-2xl font-bold text-blue-400'>{stats.plans.sessionPlans}</p>
            <p className='text-xs text-gray-500'>Sessions</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className='rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 p-6'
      >
        <h3 className='mb-4 flex items-center gap-2 text-lg font-bold text-white'>
          <DollarSign size={20} className='text-emerald-400' />
          Revenue This Month
        </h3>
        <div className='text-center'>
          <p className='text-3xl font-bold text-emerald-400'>${stats.invoices.thisMonthRevenue.toLocaleString()}</p>
          <p className='mt-2 text-sm text-gray-500'>
            vs ${stats.invoices.lastMonthRevenue.toLocaleString()} last month
          </p>
          {stats.invoices.lastMonthRevenue > 0 && (
            <p
              className={`mt-1 text-sm font-medium ${
                stats.invoices.thisMonthRevenue >= stats.invoices.lastMonthRevenue ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {((stats.invoices.thisMonthRevenue / stats.invoices.lastMonthRevenue - 1) * 100).toFixed(1)}%
              {stats.invoices.thisMonthRevenue >= stats.invoices.lastMonthRevenue ? " ↑" : " ↓"}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className='rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 p-6'
      >
        <h3 className='mb-4 flex items-center gap-2 text-lg font-bold text-white'>
          <BarChart3 size={20} className='text-orange-400' />
          Average Invoice
        </h3>
        <div className='text-center'>
          <p className='text-3xl font-bold text-orange-400'>${stats.invoices.averageInvoiceAmount.toFixed(2)}</p>
          <p className='mt-2 text-sm text-gray-500'>Per transaction</p>
        </div>
      </motion.div>
    </div>
  </div>
);

// Mentor Statistics Section with full filters
const MentorStatsSection = ({
  mentorStats,
  filters,
  onFiltersChange,
  onRefresh,
  loading,
}: {
  mentorStats: MentorDashboardStats[];
  filters: {
    sortBy: DashboardSortBy;
    sortOrder: DashboardSortOrder;
    startDate: string;
    endDate: string;
    minRevenue: string;
    minBookingCount: string;
  };
  onFiltersChange: (filters: {
    sortBy: DashboardSortBy;
    sortOrder: DashboardSortOrder;
    startDate: string;
    endDate: string;
    minRevenue: string;
    minBookingCount: string;
  }) => void;
  onRefresh: () => void;
  loading: boolean;
}) => {
  const maxRevenue = Math.max(...mentorStats.map((m) => m.total_revenue), 1);

  return (
    <div className='space-y-6'>
      {/* Bo loc voi cac tieu chi lay tu sp_DashboardStatistics*/}
      <div className='rounded-xl border border-gray-700/50 bg-gray-800/50 p-4'>
        <div className='mb-3 flex items-center gap-2 text-sm font-medium text-gray-300'>
          <Filter size={16} />
          Filters
        </div>
        <div className='flex flex-wrap items-end gap-4'>
          {/* Date Range */}
          <div className='flex items-end gap-2'>
            <DateInput
              label='Start Date'
              value={filters.startDate}
              onChange={(v) => {
                onFiltersChange({ ...filters, startDate: v });
              }}
            />
            <span className='pb-2 text-gray-500'>→</span>
            <DateInput
              label='End Date'
              value={filters.endDate}
              onChange={(v) => {
                onFiltersChange({ ...filters, endDate: v });
              }}
            />
          </div>

          {/* Min Revenue */}
          <NumberInput
            label='Min Revenue ($)'
            value={filters.minRevenue}
            onChange={(v) => {
              onFiltersChange({ ...filters, minRevenue: v });
            }}
            placeholder='0'
          />

          {/* Min Bookings */}
          <NumberInput
            label='Min Bookings'
            value={filters.minBookingCount}
            onChange={(v) => {
              onFiltersChange({ ...filters, minBookingCount: v });
            }}
            placeholder='0'
          />

          {/* Sort By */}
          <FilterDropdown
            label='Sort By'
            value={filters.sortBy}
            options={[
              { value: "total_revenue", label: "Revenue" },
              { value: "total_bookings", label: "Bookings" },
              { value: "average_rating", label: "Rating" },
              { value: "completed_meetings", label: "Meetings" },
              { value: "average_invoice_amount", label: "Avg Invoice" },
              { value: "mentor_name", label: "Name" },
            ]}
            onChange={(v) => {
              onFiltersChange({ ...filters, sortBy: v as DashboardSortBy });
            }}
          />

          {/* Sort Order */}
          <FilterDropdown
            label='Order'
            value={filters.sortOrder}
            options={[
              { value: "DESC", label: "Descending" },
              { value: "ASC", label: "Ascending" },
            ]}
            onChange={(v) => {
              onFiltersChange({ ...filters, sortOrder: v as DashboardSortOrder });
            }}
          />

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50'
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && mentorStats.length > 0 && (
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <div className='rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 text-center'>
            <p className='text-2xl font-bold text-emerald-400'>
              ${mentorStats.reduce((sum, m) => sum + m.total_revenue, 0).toLocaleString()}
            </p>
            <p className='text-xs text-gray-500'>Total Revenue</p>
          </div>
          <div className='rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 text-center'>
            <p className='text-2xl font-bold text-blue-400'>
              {mentorStats.reduce((sum, m) => sum + m.total_bookings, 0)}
            </p>
            <p className='text-xs text-gray-500'>Total Bookings</p>
          </div>
          <div className='rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 text-center'>
            <p className='text-2xl font-bold text-purple-400'>
              {mentorStats.reduce((sum, m) => sum + m.completed_meetings, 0)}
            </p>
            <p className='text-xs text-gray-500'>Completed Meetings</p>
          </div>
          <div className='rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 text-center'>
            <p className='text-2xl font-bold text-orange-400'>{mentorStats.length}</p>
            <p className='text-xs text-gray-500'>Mentors Found</p>
          </div>
        </div>
      )}

      {/* Mentor Cards */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className='grid gap-4'>
          {mentorStats.map((mentor, index) => (
            <motion.div
              key={mentor.mentor_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className='rounded-xl border border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-900 p-4 transition-all hover:border-gray-600'
            >
              <div className='flex flex-wrap items-start gap-4'>
                {/* Avatar & Info */}
                <div className='flex items-center gap-3'>
                  <div className='relative'>
                    {mentor.mentor_avatar_url ? (
                      <img
                        src={mentor.mentor_avatar_url}
                        alt={mentor.mentor_name}
                        className='h-12 w-12 rounded-full object-cover'
                      />
                    ) : (
                      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-lg font-bold text-white'>
                        {mentor.mentor_name.charAt(0)}
                      </div>
                    )}
                    <span
                      className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-gray-900 ${
                        mentor.mentor_status === "Active" ? "bg-emerald-500" : "bg-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className='font-semibold text-white'>{mentor.mentor_name}</h4>
                    <p className='text-sm text-gray-500'>{mentor.mentor_email}</p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className='ml-auto grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6'>
                  <div className='text-center'>
                    <p className='text-lg font-bold text-emerald-400'>${mentor.total_revenue.toLocaleString()}</p>
                    <p className='text-xs text-gray-500'>Revenue</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-lg font-bold text-blue-400'>{mentor.total_bookings}</p>
                    <p className='text-xs text-gray-500'>Bookings</p>
                  </div>
                  <div className='text-center'>
                    <RatingStars rating={mentor.average_rating} />
                    <p className='text-xs text-gray-500'>{mentor.total_reviews} reviews</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-lg font-bold text-purple-400'>{mentor.completed_meetings}</p>
                    <p className='text-xs text-gray-500'>Meetings</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-lg font-bold text-orange-400'>{mentor.total_plans}</p>
                    <p className='text-xs text-gray-500'>Plans</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-lg font-bold text-cyan-400'>${mentor.average_invoice_amount.toFixed(0)}</p>
                    <p className='text-xs text-gray-500'>Avg Invoice</p>
                  </div>
                </div>
              </div>

              {/* Revenue Progress Bar */}
              <div className='mt-4'>
                <ProgressBar
                  value={mentor.total_revenue}
                  max={maxRevenue}
                  color='bg-gradient-to-r from-emerald-500 to-blue-500'
                />
              </div>

              {/* Skills Tags */}
              {mentor.skills && (
                <div className='mt-3 flex flex-wrap gap-2'>
                  {mentor.skills
                    .split(", ")
                    .slice(0, 5)
                    .map((skill) => (
                      <span key={skill} className='rounded-full bg-gray-700/50 px-2 py-1 text-xs text-gray-300'>
                        {skill}
                      </span>
                    ))}
                  {mentor.skills.split(", ").length > 5 && (
                    <span className='rounded-full bg-gray-700/50 px-2 py-1 text-xs text-gray-400'>
                      +{mentor.skills.split(", ").length - 5}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}

          {mentorStats.length === 0 && (
            <div className='flex h-40 items-center justify-center text-gray-500'>
              No mentor statistics available for the selected filters
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Monthly Statistics Section
const MonthlyStatsSection = ({
  monthlyStats,
  loading,
}: {
  monthlyStats: MonthlyDashboardStats[];
  loading: boolean;
}) => {
  if (loading) return <LoadingSpinner />;

  const maxRevenue = Math.max(...monthlyStats.map((m) => m.total_revenue), 1);
  const totalRevenue = monthlyStats.reduce((sum, m) => sum + m.total_revenue, 0);
  const totalBookings = monthlyStats.reduce((sum, m) => sum + m.total_bookings, 0);

  // Sort by date for chart display (oldest first)
  const sortedStats = [...monthlyStats].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <div className='rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 text-center'>
          <p className='text-2xl font-bold text-emerald-400'>${totalRevenue.toLocaleString()}</p>
          <p className='text-xs text-gray-500'>Total Revenue (12 months)</p>
        </div>
        <div className='rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 text-center'>
          <p className='text-2xl font-bold text-blue-400'>{totalBookings}</p>
          <p className='text-xs text-gray-500'>Total Bookings</p>
        </div>
        <div className='rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 text-center'>
          <p className='text-2xl font-bold text-purple-400'>
            ${monthlyStats.length > 0 ? (totalRevenue / monthlyStats.length).toFixed(0) : 0}
          </p>
          <p className='text-xs text-gray-500'>Avg Monthly Revenue</p>
        </div>
        <div className='rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 text-center'>
          <p className='text-2xl font-bold text-orange-400'>{monthlyStats.length}</p>
          <p className='text-xs text-gray-500'>Months with Data</p>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 p-6'
      >
        <h3 className='mb-6 flex items-center gap-2 text-lg font-bold text-white'>
          <BarChart3 size={20} className='text-blue-400' />
          Revenue Trend (Last 12 Months)
        </h3>
        {sortedStats.length > 0 ? (
          <div className='flex h-64 items-end gap-2 pb-8'>
            {sortedStats.map((month, index) => {
              const height = maxRevenue > 0 ? (month.total_revenue / maxRevenue) * 100 : 0;
              return (
                <motion.div
                  key={`${String(month.year)}-${String(month.month)}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${String(height)}%` }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  className='group relative min-w-[40px] flex-1 cursor-pointer'
                >
                  <div className='absolute inset-0 rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 opacity-80 transition-opacity group-hover:opacity-100' />
                  <div className='absolute -top-12 left-1/2 -translate-x-1/2 rounded bg-gray-700 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100'>
                    ${month.total_revenue.toLocaleString()}
                    <br />
                    {month.total_bookings} bookings
                  </div>
                  <div className='absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap text-gray-500'>
                    {month.month_name.slice(0, 3)} '{String(month.year).slice(2)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className='flex h-64 items-center justify-center text-gray-500'>No data available for the period</div>
        )}
      </motion.div>

      {/* Monthly Details Table */}
      <div className='overflow-x-auto rounded-xl border border-gray-700/50 bg-gray-800/50'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-700'>
              <th className='px-4 py-3 text-left text-sm font-medium text-gray-400'>Month</th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-400'>Revenue</th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-400'>Bookings</th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-400'>Mentees</th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-400'>Mentors</th>
              <th className='px-4 py-3 text-right text-sm font-medium text-gray-400'>Avg Invoice</th>
            </tr>
          </thead>
          <tbody>
            {monthlyStats.map((month) => (
              <tr
                key={`${String(month.year)}-${String(month.month)}`}
                className='border-b border-gray-700/50 hover:bg-gray-700/30'
              >
                <td className='px-4 py-3 text-white'>
                  {month.month_name} {month.year}
                </td>
                <td className='px-4 py-3 text-right font-medium text-emerald-400'>
                  ${month.total_revenue.toLocaleString()}
                </td>
                <td className='px-4 py-3 text-right text-blue-400'>{month.total_bookings}</td>
                <td className='px-4 py-3 text-right text-purple-400'>{month.total_mentees}</td>
                <td className='px-4 py-3 text-right text-orange-400'>{month.total_mentors}</td>
                <td className='px-4 py-3 text-right text-gray-300'>${month.average_invoice_amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {monthlyStats.length === 0 && (
          <div className='flex h-40 items-center justify-center text-gray-500'>No monthly data available</div>
        )}
      </div>
    </div>
  );
};

// Category Statistics Section
const CategoryStatsSection = ({
  categoryStats,
  loading,
}: {
  categoryStats: CategoryDashboardStats[];
  loading: boolean;
}) => {
  if (loading) return <LoadingSpinner />;

  const maxRevenue = Math.max(...categoryStats.map((c) => c.total_revenue), 1);
  const totalRevenue = categoryStats.reduce((sum, c) => sum + c.total_revenue, 0);

  // Colors for categories
  const colors = [
    "from-blue-500 to-cyan-400",
    "from-purple-500 to-pink-400",
    "from-emerald-500 to-teal-400",
    "from-orange-500 to-yellow-400",
    "from-red-500 to-rose-400",
    "from-indigo-500 to-violet-400",
  ];

  return (
    <div className='space-y-6'>
      {/* Category Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {categoryStats.map((category, index) => {
          const percentage = totalRevenue > 0 ? (category.total_revenue / totalRevenue) * 100 : 0;
          return (
            <motion.div
              key={category.category_id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className='rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 p-6'
            >
              <div className='flex items-start justify-between'>
                <div>
                  <h4 className='font-semibold text-white'>{category.category_name}</h4>
                  <p className='mt-1 text-sm text-gray-500'>{category.total_mentors_with_skill} mentors</p>
                </div>
                <div className={`rounded-full bg-gradient-to-r ${colors[index % colors.length]} p-2`}>
                  <Tag size={20} className='text-white' />
                </div>
              </div>

              <div className='mt-4 grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-2xl font-bold text-emerald-400'>${category.total_revenue.toLocaleString()}</p>
                  <p className='text-xs text-gray-500'>Revenue</p>
                </div>
                <div>
                  <p className='text-2xl font-bold text-blue-400'>{category.total_bookings}</p>
                  <p className='text-xs text-gray-500'>Bookings</p>
                </div>
              </div>

              <div className='mt-4'>
                <div className='mb-1 flex justify-between text-xs'>
                  <span className='text-gray-500'>Share of Revenue</span>
                  <span className='text-gray-400'>{percentage.toFixed(1)}%</span>
                </div>
                <ProgressBar
                  value={category.total_revenue}
                  max={maxRevenue}
                  color={`bg-gradient-to-r ${colors[index % colors.length]}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {categoryStats.length === 0 && (
        <div className='flex h-40 items-center justify-center text-gray-500'>No category data available</div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Mentor filter states
  const defaultDates = getDefaultDateRange();
  const [mentorFilters, setMentorFilters] = useState({
    sortBy: "total_revenue" as DashboardSortBy,
    sortOrder: "DESC" as DashboardSortOrder,
    startDate: defaultDates.startDate,
    endDate: defaultDates.endDate,
    minRevenue: "",
    minBookingCount: "",
  });

  // Fetch system stats
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

  // Fetch dashboard stats based on tab
  const fetchDashboardData = useCallback(
    async (groupBy: DashboardGroupBy, customParams?: Partial<DashboardStatsParams>) => {
      setDashboardLoading(true);
      try {
        // Mac dinh o day là 12 thang gan nhat
        const defaultRange = getDefaultDateRange();

        const params: DashboardStatsParams = {
          groupBy,
          startDate: customParams?.startDate ?? defaultRange.startDate,
          endDate: customParams?.endDate ?? defaultRange.endDate,
          ...customParams,
        };

        if (groupBy === "mentor") {
          params.sortBy = mentorFilters.sortBy;
          params.sortOrder = mentorFilters.sortOrder;
          params.startDate = mentorFilters.startDate;
          params.endDate = mentorFilters.endDate;
          if (mentorFilters.minRevenue) {
            params.minRevenue = parseFloat(mentorFilters.minRevenue);
          }
          if (mentorFilters.minBookingCount) {
            params.minBookingCount = parseInt(mentorFilters.minBookingCount);
          }
        }

        const res = await getDashboardStats(params);
        if (res.success && res.data) setDashboardData(res.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setDashboardLoading(false);
      }
    },
    [mentorFilters]
  );

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "mentors") {
      void fetchDashboardData("mentor");
    } else if (activeTab === "monthly") {
      void fetchDashboardData("month");
    } else if (activeTab === "categories") {
      void fetchDashboardData("category");
    }
  }, [activeTab, fetchDashboardData]);

  const handleMentorFiltersChange = (newFilters: typeof mentorFilters) => {
    setMentorFilters(newFilters);
  };

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div className='text-red-500'>Failed to load data</div>;

  return (
    <div className='space-y-8'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className='flex flex-wrap items-center justify-between gap-4'
      >
        <div>
          <h1 className='text-3xl font-bold text-white'>Dashboard Overview</h1>
          <p className='mt-1 text-gray-400'>Welcome back, Administrator.</p>
        </div>
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <CalendarRange size={16} />
          Data: Last 12 months
        </div>
      </motion.div>

      {/* Tabs */}
      <div className='flex flex-wrap gap-2 rounded-xl border border-gray-700/50 bg-gray-800/50 p-2'>
        <TabButton
          active={activeTab === "overview"}
          onClick={() => {
            setActiveTab("overview");
          }}
          icon={BarChart3}
          label='Overview'
        />
        <TabButton
          active={activeTab === "mentors"}
          onClick={() => {
            setActiveTab("mentors");
          }}
          icon={Award}
          label='Mentor Statistics'
        />
        <TabButton
          active={activeTab === "monthly"}
          onClick={() => {
            setActiveTab("monthly");
          }}
          icon={Calendar}
          label='Monthly Trends'
        />
        <TabButton
          active={activeTab === "categories"}
          onClick={() => {
            setActiveTab("categories");
          }}
          icon={Tag}
          label='Categories'
        />
      </div>

      {/* Content */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <OverviewSection stats={stats} />}

          {activeTab === "mentors" && (
            <MentorStatsSection
              mentorStats={dashboardData?.mentorStats ?? []}
              filters={mentorFilters}
              onFiltersChange={handleMentorFiltersChange}
              onRefresh={() => void fetchDashboardData("mentor")}
              loading={dashboardLoading}
            />
          )}

          {activeTab === "monthly" && (
            <MonthlyStatsSection monthlyStats={dashboardData?.monthlyStats ?? []} loading={dashboardLoading} />
          )}

          {activeTab === "categories" && (
            <CategoryStatsSection categoryStats={dashboardData?.categoryStats ?? []} loading={dashboardLoading} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
