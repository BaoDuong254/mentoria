import Input from "./components/Input";
import { Link, useNavigate } from "react-router-dom";
import path from "@/constants/path";
import VerifyCode from "./components/VerifyCode";
import { useAuthStore } from "@/store/useAuthStore";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function RegisterMentee() {
  const { registerMentee, user } = useAuthStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState(false); // use for verify code
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      void navigate("/", { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit() {
    try {
      await registerMentee(firstName, lastName, email, password);
      setStatus(true);
      setError(null);
      setStatus(!status);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Register Fail from Frontend");
      }
    }
  }

  return (
    <>
      <div className='flex w-full items-center justify-center bg-(--secondary) pt-10 pb-20'>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='flex flex-col justify-center'
        >
          <div className='w-[864px] bg-gray-800'>
            {/* Top */}
            <div className='flex h-28 w-full flex-col items-center justify-center gap-4 bg-linear-to-r from-(--primary) to-(--green) text-white'>
              <span>
                <strong className='text-2xl font-bold'>Join as a Mentee</strong>
              </span>
              <span className='text-base font-normal text-purple-200'>Start your mentorship journey today</span>
            </div>
            {/* Bot */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSubmit();
              }}
            >
              <div className='flex w-full items-center justify-center pt-5 pb-5'>
                <div className='flex h-10/12 w-11/12 flex-col justify-between'>
                  <div className='flex w-full justify-between'>
                    <Input
                      id='firstName'
                      placeholder='Enter your first name'
                      type='text'
                      label='First Name'
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                    />
                    <Input
                      id='lastName'
                      placeholder='Enter your last name'
                      type='text'
                      label='Last Name'
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                    />
                  </div>
                  <div className='flex w-full justify-between'>
                    <Input
                      id='emailAddress'
                      placeholder='Enter your email'
                      type='email'
                      label='Email Address'
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                    />
                    <Input
                      id='password'
                      placeholder='Create a strong password'
                      type='password'
                      label='Password'
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                    />
                  </div>
                  <button className='mt-5 h-[60px] w-full cursor-pointer rounded-lg bg-linear-to-r from-(--primary) to-(--green) font-bold text-white transition duration-200 hover:scale-[1.03] hover:brightness-110'>
                    Create My Mentee Account
                  </button>

                  {error && (
                    <div className='mt-3 rounded-md bg-red-500/10 p-3 text-sm text-red-400'>
                      {error.split("\n").map((msg, i) => (
                        <p key={i}>• {msg}</p>
                      ))}
                    </div>
                  )}

                  <p className='mt-5 text-center text-xs text-(--text-grey)'>
                    Already have an account?{" "}
                    <Link to={path.LOGIN} className='text-(--primary) hover:underline'>
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {status && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
          <VerifyCode status={status} setStatus={setStatus} email={email} />
        </div>
      )}
    </>
  );
}
export default RegisterMentee;
