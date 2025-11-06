import { Mail, Lock, GraduationCap, Eye, EyeOff } from "lucide-react";
import { FaGoogle, FaChalkboardTeacher } from "react-icons/fa";
import avt from "@/assets/avt.png";
import { Link, useNavigate } from "react-router-dom";
import path from "@/constants/path";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
function LoginMentee() {
  const { login, user } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      void navigate("/", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit() {
    try {
      await login(email, password);
      void navigate(path.HOME);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login Fail");
      }
    }
  }

  return (
    <>
      <div className='flex w-full items-center justify-center bg-(--secondary)'>
        <div className='flex w-6xl flex-col justify-between'>
          {/* Login form */}
          <div className='my-10 h-[662px] w-full grid-cols-2 text-white md:grid'>
            {/* Left side */}
            <div className='flex items-center justify-center rounded-tl-xl rounded-bl-xl bg-gray-800'>
              <form
                className='flex h-[566px] w-md flex-col justify-between px-3 py-5'
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSubmit();
                }}
              >
                {/* Welcome */}
                <div className='flex h-[68px] w-full flex-col justify-between'>
                  <h2 className='flex items-center justify-center text-3xl font-bold'>Welcome Back</h2>
                  <p className='flex items-center justify-center text-base text-gray-300'>
                    Sign in to continue your learning journey
                  </p>
                </div>
                {/* input */}
                <div className='flex h-[296px] w-full flex-col justify-between'>
                  <div>
                    <label className='text-sm font-medium text-gray-300'>Email Address</label>
                    <div className='my-2 flex'>
                      <Mail className='h-9.5 w-9 rounded-l-sm border border-r-0 border-y-gray-500/30 border-l-gray-500/30 bg-gray-700 px-2.5 text-slate-500' />
                      <input
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                        }}
                        type='text'
                        name='Email'
                        placeholder='Enter your Email'
                        className='w-full rounded-r-sm border border-gray-500/30 bg-gray-700 px-1.5 py-2 text-slate-400 focus:border-gray-500/30 focus:ring-0 focus:outline-none'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-300'>Password</label>
                    <div className='my-2 flex'>
                      <Lock className='h-9.5 w-9 rounded-l-sm border border-r-0 border-y-gray-500/30 border-l-gray-500/30 bg-gray-700 px-2.5 text-slate-500' />

                      <input
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                        }}
                        type={showPassword ? "text" : "password"}
                        name='Password'
                        placeholder='Enter your password'
                        className='w-full border-y border-gray-500/30 bg-gray-700 px-1.5 py-2 text-slate-400 focus:border-gray-500/30 focus:ring-0 focus:outline-none'
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPassword(!showPassword);
                        }}
                        className='flex h-9.5 items-center justify-center rounded-r-sm border border-l-0 border-y-gray-500/30 border-r-gray-500/30 bg-gray-700 px-3 text-slate-400 hover:text-slate-200 focus:outline-none'
                      >
                        {showPassword ? <Eye className='h-5 w-5' /> : <EyeOff className='h-5 w-5' />}
                      </button>
                    </div>
                  </div>

                  {error && <p className='text-red-500'>{error}</p>}

                  <div className='flex justify-between'>
                    <div className='flex items-center gap-3'>
                      <input id='remember' type='checkbox' title='Remember me' aria-label='Remember me' />
                      <label htmlFor='remember' className='text-gray-300'>
                        Remember me
                      </label>
                    </div>
                    <p className='text-(--primary)'>Forgot password?</p>
                  </div>
                  <button className='w-full cursor-pointer rounded-xl bg-(--primary) py-3 text-white'>Sign In</button>
                </div>
                {/* Login by Google */}
                <div className='flex h-20 flex-col items-center justify-between'>
                  <p className='flex items-center justify-center text-slate-400'>Or continue with</p>
                  <button className='flex w-56 cursor-pointer items-center justify-center rounded-xl bg-gray-700 py-3 text-gray-300'>
                    <FaGoogle className='mr-3 text-xl text-red-400' /> Google
                  </button>
                </div>

                {/* Sign up */}
                <div className='flex items-center justify-center gap-1'>
                  <p className='text-gray-300'>Don't have an account?</p>
                  <Link to={path.REGISTER_MENTEE} className='text-(--primary)'>
                    Sign up here
                  </Link>
                </div>
              </form>
            </div>
            {/* Right side */}
            <div className='hidden h-full w-full items-center justify-center rounded-tr-2xl rounded-br-2xl bg-linear-to-br from-[#6A0DAD]/20 to-[#008080]/20 md:flex'>
              <div className='flex h-4/6 w-5/6 flex-col items-center justify-between'>
                {/* First */}
                <div className='flex h-[226.5px] w-full flex-col items-center justify-between'>
                  <div className='flex h-24 w-24 items-center justify-center rounded-full bg-[#312A5E]'>
                    <FaChalkboardTeacher className='h-9 w-9 text-(--primary)' />
                  </div>
                  <h3 className='text-2xl font-bold'>Connect.Learn.Grow</h3>
                  <p className='text-center leading-relaxed text-gray-400'>
                    Join thousands of students who are accelerating their careers with expert mentorship.
                  </p>
                </div>

                {/* Second */}
                <div className='flex h-[52px] w-full justify-between'>
                  <div className='flex w-[228px] flex-col items-center justify-between'>
                    <p className='text-2xl font-bold text-(--primary)'>500+</p>
                    <p className='text-sm font-normal text-gray-400'>Expert Mentors</p>
                  </div>

                  <div className='flex w-[228px] flex-col items-center justify-between'>
                    <p className='text-2xl font-bold text-(--green)'>10k+</p>
                    <p className='text-sm font-normal text-gray-400'>Success Stories</p>
                  </div>
                </div>

                {/* Third */}
                <div className='flex h-28 w-full justify-center rounded-2xl border border-slate-700 bg-slate-900/50'>
                  <div className='flex items-center justify-center gap-3'>
                    {/*avt*/}
                    <div>
                      <img src={avt} alt='Avatar' className='h-12 w-12' />
                    </div>
                    {/* comment */}
                    <div className='flex h-16 w-4/6 flex-col justify-between'>
                      <p className='text-sm text-gray-300'>
                        "The mentorship I received helped me land my dream job in tech. Absolutely life-changing!"
                      </p>
                      <p className='text-xs text-gray-400'>Sarah Chen- Software Engineer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Become a mentor */}
          <div className='mb-6 flex h-[90px] w-full flex-col items-center justify-between text-white'>
            <p className='font-light text-gray-400'>Looking to share your expertise?</p>
            <Link to={path.REGISTER_MENTOR}>
              <div className='flex h-[50px] w-[201.28px] items-center justify-center gap-2.5 rounded-sm border border-(--green) text-base font-medium text-(--green)'>
                <GraduationCap /> Become a Mentor
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
export default LoginMentee;
