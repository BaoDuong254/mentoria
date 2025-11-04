import Input from "./components/Input";
import { Link } from "react-router-dom";
import path from "@/constants/path";

function RegisterMentee() {
  return (
    <>
      <div className='flex h-[730px] w-full items-center justify-center bg-(--secondary)'>
        <div className='h-[497px] w-[864px] bg-gray-800'>
          {/* Top */}
          <div className='flex h-28 w-full flex-col items-center justify-center gap-4 bg-linear-to-r from-(--primary) to-(--green) text-white'>
            <span>
              <strong className='text-2xl font-bold'>Join as a Mentee</strong>
            </span>
            <span className='text-base font-normal text-purple-200'>Start your mentorship journey today</span>
          </div>
          {/* Bot */}
          <div className='flex h-96 w-full items-center justify-center'>
            <div className='flex h-10/12 w-11/12 flex-col justify-between'>
              <div className='flex w-full justify-between'>
                <Input id='firstName' placeholder='Enter your first name' type='text' label='First Name' />
                <Input id='lastName' placeholder='Enter your last name' type='text' label='Last Name' />
              </div>
              <div className='flex w-full justify-between'>
                <Input id='emailAddress' placeholder='Enter your email' type='email' label='Email Address' />
                <Input id='password' placeholder='Create a strong password' type='password' label='Password' />
              </div>
              <button className='h-[60px] w-full cursor-pointer rounded-lg bg-linear-to-r from-(--primary) to-(--green) font-bold text-white'>
                Create My Mentee Account
              </button>
              <div className='flex h-[49px] w-full items-end justify-center border-t border-t-gray-700 text-gray-400'>
                <span>Already have an account?</span>
                <Link to={path.LOGIN_MENTEE}>
                  <span className='text-(--primary)'>Sign in here</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default RegisterMentee;
