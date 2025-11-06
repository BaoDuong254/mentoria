import { useState, type ChangeEvent, type KeyboardEvent } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import path from "@/constants/path";

interface VerifyCodeProps {
  status: boolean;
  setStatus: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
}

export default function VerifyCode({ status, setStatus, email }: VerifyCodeProps) {
  const { verify } = useAuthStore();
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);

  async function handleSubmit() {
    try {
      const otpString = otp.join("");
      await verify(otpString);
      setStatus(false);
      void navigate(path.LOGIN);
    } catch (err) {
      console.log(err);
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${String(index + 1)}`)?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) document.getElementById(`otp-${String(index - 1)}`)?.focus();
  };

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          key='verify-modal'
          initial={{ opacity: 0, scale: 0.9 }} // trạng thái ban đầu (ẩn và nhỏ hơn)
          animate={{ opacity: 1, scale: 1 }} // trạng thái xuất hiện
          exit={{ opacity: 0, scale: 0.9 }} // trạng thái khi biến mất
          transition={{ duration: 0.3, ease: "easeOut" }} // thời gian và hiệu ứng
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
        >
          <div className='flex h-[338px] w-[465px] items-center justify-center rounded-[9px] bg-gray-800 shadow-lg'>
            <div className='flex h-10/12 w-10/12 flex-col justify-between text-white'>
              <h2 className='text-2xl font-bold'>Check your email</h2>
              <span className='text-gray-400'>
                We sent a code to <span className='text-white'>{email}</span>
                <br />
                Enter 6 digit code that was mentioned in the email
              </span>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSubmit();
                }}
                className='flex w-full flex-col items-center justify-between'
              >
                <div className='mb-4 flex justify-center gap-4'>
                  {otp.map((digit, index) => (
                    <input
                      type='text'
                      key={index}
                      id={`otp-${String(index)}`}
                      inputMode='numeric'
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        handleChange(e, index);
                      }}
                      onKeyDown={(e) => {
                        handleKeyDown(e, index);
                      }}
                      className='h-12 w-10 rounded-md border-2 border-gray-600 bg-transparent text-center text-xl focus:border-purple-400 focus:outline-none'
                    />
                  ))}
                </div>

                <button className='h-[35px] w-4/6 cursor-pointer rounded-sm bg-(--primary) font-medium text-white'>
                  Verify Code
                </button>
              </form>

              <div className='flex items-center justify-center'>
                <span className='text-sm text-gray-500'>
                  Didn't you receive the OTP?{" "}
                  <span className='cursor-pointer text-(--primary) hover:underline'>Resend OTP</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
