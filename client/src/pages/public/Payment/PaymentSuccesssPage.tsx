import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, Home } from "lucide-react";
import { motion, type Variants } from "framer-motion";

function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Các biến animation (Variants)
  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
        staggerChildren: 0.15, // Thời gian trễ giữa các phần tử con
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const iconVariants: Variants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <div className='flex min-h-screen w-full items-center justify-center bg-(--secondary) py-15'>
      <div className='w-11/12 max-w-lg'>
        {/* Main Card Component */}
        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='flex flex-col items-center rounded-xl border bg-gray-800 px-7 py-10 shadow-2xl'
        >
          {/* Icon Success */}
          <motion.div variants={iconVariants}>
            <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-(--green)/10 ring-2 ring-(--green)'>
              <CheckCircle className='h-12 w-12 text-(--green)' />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h2 variants={itemVariants} className='mb-2 text-center text-3xl font-bold text-white'>
            Payment Successful!
          </motion.h2>

          <motion.p variants={itemVariants} className='mb-8 text-center text-gray-300'>
            Thank you for your booking. Your mentorship session has been confirmed and added to your schedule.
          </motion.p>

          {/* Transaction Info Box */}
          {sessionId && (
            <motion.div
              variants={itemVariants}
              className='mb-8 w-full rounded-lg border border-gray-700 bg-gray-900/50 p-4'
            >
              <div className='flex flex-col items-center gap-1'>
                <span className='text-xs tracking-wider text-gray-500 uppercase'>Transaction ID</span>
                <span className='font-mono text-sm break-all text-gray-300'>{sessionId}</span>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div variants={itemVariants} className='flex w-full flex-col gap-4'>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => void navigate("/mentee/dashboard")}
              className='flex w-full items-center justify-center gap-2 rounded-lg bg-(--primary) py-3 font-bold text-white shadow-lg shadow-purple-900/20 transition hover:bg-purple-700'
            >
              <Home className='h-5 w-5' />
              Back to Dashboard
            </motion.button>
          </motion.div>

          {/* Additional Link */}
          <motion.div variants={itemVariants} className='mt-8 text-sm text-gray-500'>
            Need help? <span className='cursor-pointer text-(--primary) hover:underline'>Contact Support</span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
