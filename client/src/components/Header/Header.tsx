import { useState } from "react";
import { Link } from "react-router-dom";
import path from "../../utils/path";
import logo from "../../assets/logo_Layer 1.png";
import { Menu, X } from "lucide-react"; // icon hamburger

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
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
            <Link to={path.HOME}>Home</Link>
            <Link to={path.MENTOR_BROWSE}>Browse Mentor</Link>
            <Link to={path.MENTEE_DASHBOARD}>Dashboard</Link>
          </nav>

          {/* Desktop Buttons */}
          <div className='hidden justify-end space-x-3 md:flex'>
            <Link to={path.LOGIN_MENTEE}>
              <button className='rounded-full bg-[var(--dark-grey)] px-4 py-2'>Login</button>
            </Link>
            <Link to={path.LOGIN_MENTOR}>
              <button className='rounded-full bg-[var(--primary)] px-5 py-2'>Login as Mentor</button>
            </Link>
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
          <div className='flex flex-col items-center space-y-4 border-t border-gray-600 bg-[var(--secondary)] py-4 md:hidden'>
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
              to={path.MENTEE_DASHBOARD}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Dashboard
            </Link>
            <Link
              to={path.LOGIN_MENTEE}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              <button className='rounded-full bg-[var(--dark-grey)] px-4 py-2'>Login</button>
            </Link>
            <Link
              to={path.LOGIN_MENTOR}
              onClick={() => {
                setIsOpen(false);
              }}
            >
              <button className='rounded-full bg-[var(--primary)] px-4 py-2'>Login as Mentor</button>
            </Link>
          </div>
        )}

        {/* Category Bar */}
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
                <li className='transition hover:text-[var(--primary)]'>{item}</li>
              </Link>
            ))}
          </ul>
        </div>
      </header>
    </>
  );
}
