import { useNavigate } from "react-router-dom";
import path from "@/constants/path";
import { XCircle } from "lucide-react";

function PaymentCancel() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    void navigate(`${path.MENTEE}/${path.MENTEE_DASHBOARD}`);
  };

  const handleTryAgain = () => {
    // Go back to previous page
    window.history.back();
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-900'>
      <div className='w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-8 text-center'>
        {/* Cancel Icon */}
        <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-600/20'>
          <XCircle className='h-12 w-12 text-red-500' />
        </div>

        {/* Title */}
        <h1 className='mb-2 text-2xl font-bold text-white'>Payment Cancelled</h1>
        <p className='mb-6 text-gray-400'>Your payment was cancelled. No charges have been made to your account.</p>

        {/* Buttons */}
        <div className='flex gap-4'>
          <button
            onClick={handleGoBack}
            className='flex-1 rounded-lg border border-gray-600 bg-transparent py-3 font-medium text-white transition-colors hover:bg-gray-700'
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleTryAgain}
            className='flex-1 rounded-lg bg-purple-600 py-3 font-medium text-white transition-colors hover:bg-purple-500'
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;
