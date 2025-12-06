import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, FileText, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: Users, label: "User Management", path: "/admin/users" },
    { icon: FileText, label: "Invoices & Revenue", path: "/admin/invoices" },
  ];

  return (
    // Main Container: Dùng bg-(--bg-grey) (#111827) để đồng bộ background chính
    <div className='flex h-screen w-full bg-(--bg-grey) font-sans text-gray-200'>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 border-r border-gray-700 bg-gray-800 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className='flex h-16 items-center gap-2 border-b border-gray-700 px-6'>
          {/* Logo Icon: Dùng màu tím primary */}
          <ShieldCheck className='h-8 w-8 text-(--primary)' />
          <span className='text-xl font-bold tracking-tight text-white'>Admin Panel</span>
        </div>

        <nav className='flex flex-col gap-1 p-4'>
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-(--primary) text-white shadow-lg shadow-purple-900/20" // Active: Tím Brand
                    : "text-gray-400 hover:bg-gray-700 hover:text-white" // Inactive: Xám
                }`}
              >
                <item.icon size={20} />
                <span className='font-medium'>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info / Logout */}
        <div className='absolute bottom-4 w-full px-4'>
          <div className='mb-4 border-t border-gray-700 px-2 pt-4'>
            <div className='mb-3 flex items-center gap-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-bold text-white'>
                {user?.first_name[0] ?? "A"}
              </div>
              <div className='overflow-hidden'>
                <p className='truncate text-sm font-medium text-white'>
                  {user?.first_name} {user?.last_name}
                </p>
                <p className='truncate text-xs text-gray-500'>{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => void logout()}
            className='flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300'
          >
            <LogOut size={20} />
            <span className='font-medium'>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 md:ml-64`}>
        {/* Mobile Header */}
        <div className='flex items-center border-b border-gray-700 bg-gray-800 p-4 md:hidden'>
          <button
            onClick={() => {
              setIsSidebarOpen(!isSidebarOpen);
            }}
            className='text-white'
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
          <span className='ml-4 font-bold text-white'>Admin Dashboard</span>
        </div>

        {/* Nội dung trang: Background màu tối nhất */}
        <main className='h-full w-full overflow-y-auto bg-(--bg-grey) p-4 md:p-8'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
