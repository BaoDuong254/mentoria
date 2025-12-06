import { useState } from "react";
import { Link } from "react-router-dom";
import path from "@/constants/path";
import logo from "@/assets/LogoMentoria.png";
import { Menu, X, ChevronDown } from "lucide-react"; // icon hamburger
import { useAuthStore } from "@/store/useAuthStore";
import { getBaseUrlByRole } from "@/utils/route.utils";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const BASE_URL = getBaseUrlByRole(user?.role);
  return (
    <>
      <header className='w-full bg-[hsl(240,28%,14%)] text-white'>
        {/*Top Header*/}
        <div className='mx-auto grid h-[65px] max-w-7xl grid-cols-3 items-center justify-between pl-3'>
          {/*Logo*/}
          <Link to={path.HOME} className='flex items-center'>
            <img src={logo} alt='logo' className='h-10 w-28' />
          </Link>

          {/*Desktop Nav */}
          <nav className='hidden justify-center space-x-8 text-base md:flex'>
            {user?.role === "Mentor" ? (
              <>
                <Link to={path.HOME} className='cursor-pointer transition hover:underline hover:decoration-white'>
                  Home
                </Link>
                <Link
                  to={`${path.MENTOR}/${path.MENTOR_DASHBOARD}`}
                  className='cursor-pointer transition hover:underline hover:decoration-white'
                >
                  Dashboard
                </Link>
                <Link
                  to={`${path.MENTOR}/${path.MENTOR_PLANS}`}
                  className='cursor-pointer transition hover:underline hover:decoration-white'
                >
                  My Plans
                </Link>
              </>
            ) : (
              <>
                <Link to={path.HOME} className='cursor-pointer transition hover:underline hover:decoration-white'>
                  Home
                </Link>
                <Link
                  to={path.MENTOR_BROWSE}
                  className='cursor-pointer transition hover:underline hover:decoration-white'
                >
                  Browse Mentor
                </Link>
                <Link
                  to={`${path.MENTEE}/${path.MENTEE_DASHBOARD}`}
                  className='cursor-pointer transition hover:underline hover:decoration-white'
                >
                  Dashboard
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Buttons */}
          <div className='hidden justify-end space-x-3 md:flex'>
            {!user ? (
              <>
                <Link to={path.LOGIN}>
                  <button className='cursor-pointer rounded-full bg-(--dark-grey) px-4 py-2 transition duration-200 hover:scale-[1.03] hover:brightness-110'>
                    Login
                  </button>
                </Link>
                <Link to={path.REGISTER_MENTEE}>
                  <button className='cursor-pointer rounded-full bg-(--primary) px-5 py-2 transition duration-200 hover:scale-[1.03] hover:brightness-110'>
                    Register
                  </button>
                </Link>
              </>
            ) : (
              <>
                <div className='relative'>
                  <button
                    className='flex items-center gap-1'
                    onClick={() => {
                      setShowMenu(!showMenu);
                    }}
                  >
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-purple-700'>
                      {/* update Logo img */}
                      <span className='text-sm font-semibold'>{user.last_name[0].toUpperCase() || "U"}</span>
                    </div>
                    <ChevronDown size={16} />
                  </button>

                  {showMenu && (
                    <div className='absolute right-0 mt-2 w-40 rounded-md border border-amber-50/50 bg-(--secondary) shadow-lg'>
                      <Link
                        to={`${String(BASE_URL)}/${path.PROFILE}`}
                        className='block rounded-md px-4 py-2 hover:bg-(--primary)'
                      >
                        Profile
                      </Link>

                      <Link to={path.MENTEE} className='block rounded-md px-4 py-2 hover:bg-(--primary)'>
                        Setting
                      </Link>
                      <button
                        onClick={() => {
                          void logout();
                          setShowMenu(false);
                        }}
                        className='flex w-full cursor-pointer justify-start rounded-md px-4 py-2 hover:bg-(--primary)'
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className='col-start-3 justify-self-end pr-2 md:hidden'
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {isOpen && (
          <div className='flex flex-col items-center space-y-4 border-t border-gray-600 bg-(--secondary) py-4 md:hidden'>
            <Link
              to={path.HOME}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Home
            </Link>
            <Link
              to={path.MENTOR_BROWSE}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Browse Mentor
            </Link>
            <Link
              to={`${path.MENTEE}/${path.MENTEE_DASHBOARD}`}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Dashboard
            </Link>
            <Link
              to={path.LOGIN}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              <button className='rounded-full bg-(--dark-grey) px-4 py-2'>Login</button>
            </Link>
            <Link
              to={path.REGISTER_MENTEE}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              <button className='rounded-full bg-(--primary) px-4 py-2'>Register</button>
            </Link>
          </div>
        )}

        {/* Category Bar */}
        {!(user?.role === "Mentor") && (
          <div className='hidden h-[49px] justify-center border-t border-gray-500 md:flex'>
            <ul className='flex w-screen max-w-7xl items-center justify-between px-4 text-sm'>
              {[
                "Engineering Mentors",
                "Design Mentors",
                "Startup Mentors",
                "AI Mentors",
                "Product Mentors",
                "Marketing Mentors",
                "Leadership Mentors",
              ].map((item) => (
                <Link key={item} to={path.MENTOR_BROWSE}>
                  <li className='transition hover:text-(--primary)'>{item}</li>
                </Link>
              ))}
            </ul>
          </div>
        )}
      </header>
    </>
  );
}
