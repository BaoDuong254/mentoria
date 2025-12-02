import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useBookingRequestStore } from "@/store/useBookingRequestStore";
import { verifyPayment } from "@/apis/payment.api";
import type { VerifyPaymentResponse } from "@/types/payment.type";
import path from "@/constants/path";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(5);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { requests, removeRequest } = useBookingRequestStore();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Only run once to prevent duplicate processing
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processPayment = async () => {
      if (!sessionId) {
        setVerificationError("No session ID found");
        setIsVerifying(false);
        return;
      }

      try {
        // Call API to verify and process payment
        // This is a fallback when Stripe webhook doesn't work in development

        const response = await verifyPayment(sessionId);

        const result = response as unknown as VerifyPaymentResponse;

        if (result.success) {
          console.log("Payment verified:", result.message);

          // Remove waiting_payment requests from localStorage
          // The session is now stored in the database
          const requestsToRemove = requests.filter((r) => r.status === "waiting_payment" || r.status === "paid");
          requestsToRemove.forEach((request) => {
            removeRequest(request.id);
          });
        } else {
          setVerificationError(result.message);
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        // Don't show error to user - webhook might have already processed it
        // Just clean up localStorage anyway
        const requestsToRemove = requests.filter((r) => r.status === "waiting_payment" || r.status === "paid");
        requestsToRemove.forEach((request) => {
          removeRequest(request.id);
        });
      } finally {
        setIsVerifying(false);
      }
    };

    void processPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only once on mount

  useEffect(() => {
    // Only start countdown after verification is complete
    if (isVerifying) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Navigate to mentee dashboard
          void navigate(`${path.MENTEE}/${path.MENTEE_DASHBOARD}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [navigate, isVerifying]);

  const handleGoToDashboard = () => {
    void navigate(`${path.MENTEE}/${path.MENTEE_DASHBOARD}`);
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-900'>
      <div className='w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-8 text-center'>
        {isVerifying ? (
          <>
            {/* Loading State */}
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-purple-600/20'>
              <Loader2 className='h-12 w-12 animate-spin text-purple-500' />
            </div>
            <h1 className='mb-2 text-2xl font-bold text-white'>Processing Payment...</h1>
            <p className='mb-6 text-gray-400'>Please wait while we verify your payment.</p>
          </>
        ) : verificationError ? (
          <>
            {/* Error State */}
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-600/20'>
              <AlertCircle className='h-12 w-12 text-red-500' />
            </div>
            <h1 className='mb-2 text-2xl font-bold text-white'>Verification Issue</h1>
            <p className='mb-6 text-gray-400'>
              {verificationError}. Your payment may still have been processed. Please check your dashboard.
            </p>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-600/20'>
              <CheckCircle className='h-12 w-12 text-green-500' />
            </div>
            <h1 className='mb-2 text-2xl font-bold text-white'>Payment Successful!</h1>
            <p className='mb-6 text-gray-400'>
              Your booking has been confirmed. You will receive a confirmation email shortly.
            </p>
          </>
        )}

        {/* Session ID */}
        {sessionId && !isVerifying && (
          <div className='mb-6 rounded-lg bg-gray-700/50 p-4'>
            <p className='text-sm text-gray-400'>Transaction ID</p>
            <p className='mt-1 font-mono text-xs break-all text-gray-300'>{sessionId}</p>
          </div>
        )}

        {/* Countdown - only show when not verifying */}
        {!isVerifying && (
          <div className='mb-6 flex items-center justify-center gap-2 text-gray-400'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Redirecting to dashboard in {countdown} seconds...</span>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleGoToDashboard}
          disabled={isVerifying}
          className='w-full rounded-lg bg-purple-600 py-3 font-medium text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isVerifying ? "Processing..." : "Go to Dashboard Now"}
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;
