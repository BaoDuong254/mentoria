import { CreditCard, ArrowLeft, Clock, Check, Home } from "lucide-react";
import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import path from "@/constants/path";

// Mock data cho plan vì chưa có api lấy plan
// Dự định url là /plan:#plan_id/payment
// Hệ thống tự xác nhận thanh toán
const PLAN_DETAILS = {
  id: "14",
  item: "1-on-1 Mentorship Session",
  mentor: "Sarah Chen",
  duration: "60 mins",
  charge: 60, // USD
};

function PaymentPage() {
  //const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(600); // 10 phút đếm ngược, chưa có logic thoát khi hết thời gian

  //isPaid để hiện popup thanh toán thành công
  const [isPaid, setIsPaid] = useState(false);
  // Hàm giả lập nhận tín hiệu thanh toán thành công
  const handleSimulatePaymentSuccess = () => {
    // Trong thực tế, hàm này sẽ được gọi khi nhận tín hiệu từ Server
    setIsPaid(true);
  };

  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  // Format thời gian
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString()}:${secs < 10 ? "0" : ""}${secs.toString()}`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  //Thông tin ngân hàng server
  const BANK_INFO = {
    bankName: "MB Bank",
    accountNumber: "MB29521DATH",
    accountName: "MENTORIA INC",
  };
  //Dữ liệu gán vào QR
  const qrData = `
    Bank: ${BANK_INFO.bankName}
    Account: ${BANK_INFO.accountNumber}
    Name: ${BANK_INFO.accountName}
    Amount: ${PLAN_DETAILS.charge.toString()}
    Content: PAY PLAN ${PLAN_DETAILS.id}
  `.trim();
  //API tạo QR
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;

  return (
    <>
      <div className='flex min-h-screen w-full items-center justify-center bg-(--secondary) py-10'>
        {/* === POPUP PAYMENT SUCCESS (Tích hợp trực tiếp) === */}
        <AnimatePresence>
          {isPaid && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                className='relative w-full max-w-sm overflow-hidden rounded-2xl bg-gray-800 shadow-2xl ring-1 ring-white/10'
              >
                {/* Header Popup */}
                <div className='flex h-32 w-full items-center justify-center bg-(--primary)'>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className='rounded-full bg-white/20 p-3 backdrop-blur-md'
                  >
                    <Check className='h-12 w-12 text-white' strokeWidth={3} />
                  </motion.div>
                </div>

                {/* Content Popup */}
                <div className='flex flex-col items-center px-6 py-8 text-center'>
                  <h2 className='mb-2 text-2xl font-bold text-white'>Payment Success!</h2>
                  <p className='mb-6 text-sm text-gray-300'>
                    Your transaction has been completed. Thank you for trusting and using our services.
                  </p>

                  <Link
                    to={path.HOME}
                    className='group flex w-full items-center justify-center gap-2 rounded-xl bg-(--primary) py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-purple-500/30 hover:brightness-110 active:scale-95'
                  >
                    <Home size={18} />
                    Return to Homepage
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='flex flex-col justify-center'
        >
          <div className='flex w-6xl flex-col justify-between'>
            {/* Header: Back Button */}
            <div className='mb-4 flex w-fit items-center gap-2 text-gray-400 transition-colors hover:text-white'>
              <Link to={path.HOME} className='flex items-center gap-2'>
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </Link>
            </div>

            {/* Payment Container */}
            <div className='h-auto min-h-[600px] w-full grid-cols-2 text-white md:grid'>
              {/* LEFT SIDE: Order Summary */}
              <div className='hidden h-full w-full items-center justify-center rounded-tl-2xl rounded-bl-2xl bg-linear-to-br from-[#6A0DAD]/20 to-[#008080]/20 md:flex'>
                <div className='flex h-5/6 w-5/6 flex-col items-center'>
                  {/* Summary Card */}
                  <div className='w-full rounded-2xl border border-slate-700/50 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-sm'>
                    <div className='flex flex-col items-center justify-between gap-6'>
                      <div className='flex h-20 w-20 items-center justify-center rounded-full bg-[#312A5E]/80 ring-4 ring-[#312A5E]/30'>
                        <CreditCard className='h-8 w-8 text-(--primary)' />
                      </div>

                      <div className='text-center'>
                        <h3 className='text-2xl font-bold text-white'>Order Summary</h3>
                        <p className='mt-1 text-gray-400'>
                          Plan ID: <span className='font-mono text-slate-300'>#{PLAN_DETAILS.id}</span>
                        </p>
                      </div>

                      {/* Divider */}
                      <div className='my-2 h-px w-full bg-gradient-to-r from-transparent via-gray-600 to-transparent'></div>

                      <div className='flex items-center justify-between gap-4 text-sm text-gray-400'>
                        <span>Countdown timer </span>
                        <div className='flex items-center gap-1 text-orange-400'>
                          <Clock size={16} />
                          <span className='font-mono font-medium'>{formatTime(timeLeft)}</span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className='w-full space-y-4'>
                        <div className='flex items-center justify-between text-gray-300'>
                          <span>Mentorship Plan</span>
                          <span className='font-medium text-white'>1-on-1 Session</span>
                        </div>
                        <div className='flex items-center justify-between text-gray-300'>
                          <span>Mentor</span>
                          <span className='font-medium text-white'>{PLAN_DETAILS.mentor}</span>
                        </div>
                        <div className='flex items-center justify-between text-gray-300'>
                          <span>Duration</span>
                          <span className='font-medium text-white'>{PLAN_DETAILS.duration} minutes</span>
                        </div>
                        <div className='flex items-center justify-between text-gray-300'>
                          <span>Charge</span>
                          <span className='font-medium text-white'>{formatCurrency(PLAN_DETAILS.charge)}</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className='my-2 h-px w-full border-dashed bg-gray-600'></div>

                      {/* Total */}
                      <div className='flex w-full items-end justify-between'>
                        <span className='text-lg font-medium text-gray-300'>Total (USD)</span>
                        <span className='text-3xl font-bold text-(--green)'>{formatCurrency(PLAN_DETAILS.charge)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: QR Code */}
              <div className='flex flex-col items-center justify-center rounded-tr-xl rounded-br-xl bg-gray-800 p-8'>
                <div className='flex w-full max-w-md flex-col items-center gap-8'>
                  {/* Header */}
                  <div className='space-y-2 text-center'>
                    <h2 className='text-3xl font-bold'>Scan to Pay</h2>
                    <p className='mx-auto max-w-xs text-sm text-gray-300'>
                      Open your banking app and scan the QR code below. All transfer details are embedded.
                    </p>
                  </div>

                  {/* QR Code Section */}
                  <div
                    title='Click to simulate payment success (Demo Only)'
                    onClick={handleSimulatePaymentSuccess}
                    className='flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-2xl shadow-black/50'
                  >
                    <div className='relative'>
                      <img src={qrUrl} alt='Payment QR Code' className='h-72 w-72 object-contain' />
                    </div>

                    <div className='mt-6 w-full text-center'>
                      <p className='text-sm font-medium tracking-wider text-gray-500 uppercase'>Total Amount</p>
                      <p className='mt-1 text-3xl font-bold text-gray-900'>{formatCurrency(PLAN_DETAILS.charge)}</p>
                    </div>
                  </div>

                  <p className='max-w-xs text-center text-xs text-gray-500'>
                    *The payment will be processed automatically once the transfer is received.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Footer */}
            <div className='mt-6 flex h-auto w-full flex-col items-center justify-center gap-2 pb-6 text-white'>
              <p className='text-sm text-gray-400'>Having trouble with payment?</p>
              <div className='flex gap-4'>
                <a href='#' className='text-sm text-(--primary) hover:underline'>
                  Contact Support
                </a>
                <span className='text-gray-600'>|</span>
                <a href='#' className='text-sm text-(--primary) hover:underline'>
                  {" "}
                  {/*Add handle cancel plan here */}
                  Cancel Order
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export default PaymentPage;
