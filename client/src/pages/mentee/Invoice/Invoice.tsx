import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBookingRequestStore, type BookingRequest } from "@/store/useBookingRequestStore";
import { createCheckoutSession } from "@/apis/payment.api";
import path from "@/constants/path";

// Barcode component - generates a simple barcode-like pattern
function Barcode({ value }: { value: string }) {
  // Generate a simple barcode pattern from the value
  const generateBars = (str: string): string[] => {
    const bars: string[] = [];
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      // Create alternating thick and thin bars based on character code
      bars.push(charCode % 2 === 0 ? "w-1" : "w-0.5");
    }
    // Pad to minimum 30 bars
    while (bars.length < 30) {
      bars.push(bars.length % 3 === 0 ? "w-1" : "w-0.5");
    }
    return bars;
  };

  const bars = generateBars(value);

  return (
    <div className='flex flex-col items-center'>
      <div className='flex h-16 items-end gap-px'>
        {bars.map((width, index) => (
          <div key={index} className={`${width} bg-gray-900 ${index % 2 === 0 ? "h-14" : "h-12"}`} />
        ))}
      </div>
      <p className='mt-2 font-mono text-sm text-gray-600'>{value}</p>
    </div>
  );
}

// QR Code placeholder (simple visual representation)
function QRCodePlaceholder({ value }: { value: string }) {
  return (
    <div className='flex flex-col items-center'>
      <div className='grid h-24 w-24 grid-cols-8 grid-rows-8 gap-px bg-white p-1'>
        {Array.from({ length: 64 }).map((_, i) => {
          // Generate pattern based on value hash
          const charCode = value.charCodeAt(i % value.length) || 0;
          const shouldFill = (charCode + i) % 3 !== 0;
          return <div key={i} className={shouldFill ? "bg-gray-900" : "bg-white"} />;
        })}
      </div>
      <p className='mt-2 text-xs text-gray-500'>Scan to pay</p>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatTime(timeStr: string): string {
  const date = new Date(timeStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function Invoice() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { requests } = useBookingRequestStore();
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (requestId) {
      const found = requests.find((r) => r.id === requestId);
      setRequest(found ?? null);
    }
  }, [requestId, requests]);

  const handlePayNow = async () => {
    if (!request) return;

    setLoading(true);
    try {
      const response = await createCheckoutSession({
        menteeId: request.menteeId,
        mentorId: request.mentorId,
        planId: request.planId,
        slotStartTime: request.slotStartTime,
        slotEndTime: request.slotEndTime,
        message: request.message || "Mentoring session",
      });

      if (response.success && response.data?.sessionUrl) {
        window.location.href = response.data.sessionUrl;
      } else {
        alert(response.message || "Failed to create checkout session");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      alert("Failed to create checkout session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    void navigate(`${path.MENTEE}/${path.MENTEE_DASHBOARD}`);
  };

  if (!request) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-900'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-white'>Invoice Not Found</h1>
          <p className='mt-2 text-gray-400'>The requested invoice could not be found.</p>
          <button
            onClick={handleGoBack}
            className='mt-4 rounded bg-purple-700 px-6 py-2 text-white hover:bg-purple-600'
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const invoiceNumber = `INV-${request.id.slice(0, 8).toUpperCase()}`;
  const issueDate = new Date(request.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className='min-h-screen bg-gray-900 py-8'>
      <div className='mx-auto max-w-3xl px-4'>
        {/* Back Button */}
        <button onClick={handleGoBack} className='mb-6 flex items-center gap-2 text-gray-400 hover:text-white'>
          <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z'
              clipRule='evenodd'
            />
          </svg>
          Back to Dashboard
        </button>

        {/* Invoice Card */}
        <div className='overflow-hidden rounded-xl bg-white shadow-2xl'>
          {/* Header */}
          <div className='bg-linear-to-r from-purple-700 to-purple-900 px-8 py-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-white'>INVOICE</h1>
                <p className='mt-1 text-purple-200'>Mentoria Platform</p>
              </div>
              <div className='text-right'>
                <p className='text-sm text-purple-200'>Invoice Number</p>
                <p className='text-xl font-bold text-white'>{invoiceNumber}</p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className='p-8'>
            {/* Status Badge */}
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>Issue Date</p>
                <p className='font-medium text-gray-900'>{issueDate}</p>
              </div>
              <span
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  request.status === "waiting_payment"
                    ? "bg-yellow-100 text-yellow-800"
                    : request.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {request.status === "waiting_payment"
                  ? "Awaiting Payment"
                  : request.status === "paid"
                    ? "Paid"
                    : request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>

            {/* Billing Info */}
            <div className='mb-8 grid grid-cols-2 gap-8'>
              <div>
                <h3 className='mb-2 text-sm font-semibold text-gray-500 uppercase'>Bill To</h3>
                <p className='font-medium text-gray-900'>{request.menteeName}</p>
                <p className='text-gray-600'>{request.menteeEmail}</p>
              </div>
              <div>
                <h3 className='mb-2 text-sm font-semibold text-gray-500 uppercase'>Service By</h3>
                <div className='flex items-center gap-3'>
                  <img
                    src={request.mentorAvatar || "https://i.pravatar.cc/150?img=1"}
                    alt={request.mentorName}
                    className='h-10 w-10 rounded-full object-cover'
                  />
                  <div>
                    <p className='font-medium text-gray-900'>{request.mentorName}</p>
                    <p className='text-sm text-gray-600'>{request.mentorSpecialty}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className='mb-8'>
              <h3 className='mb-4 text-sm font-semibold text-gray-500 uppercase'>Service Details</h3>
              <div className='overflow-hidden rounded-lg border border-gray-200'>
                <table className='w-full'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-4 py-3 text-left text-sm font-semibold text-gray-600'>Description</th>
                      <th className='px-4 py-3 text-right text-sm font-semibold text-gray-600'>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className='border-t border-gray-200'>
                      <td className='px-4 py-4'>
                        <p className='font-medium text-gray-900'>{request.planType}</p>
                        <p className='mt-1 text-sm text-gray-500'>Date: {formatDate(request.slotDate)}</p>
                        <p className='text-sm text-gray-500'>
                          Time: {formatTime(request.slotStartTime)} - {formatTime(request.slotEndTime)}
                        </p>
                        {request.message && <p className='mt-2 text-sm text-gray-500 italic'>"{request.message}"</p>}
                      </td>
                      <td className='px-4 py-4 text-right font-medium text-gray-900'>
                        ${request.planCharge.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className='bg-gray-50'>
                    <tr className='border-t border-gray-200'>
                      <td className='px-4 py-3 text-right font-semibold text-gray-600'>Subtotal</td>
                      <td className='px-4 py-3 text-right font-medium text-gray-900'>
                        ${request.planCharge.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className='px-4 py-3 text-right font-semibold text-gray-600'>Platform Fee</td>
                      <td className='px-4 py-3 text-right font-medium text-gray-900'>$0.00</td>
                    </tr>
                    <tr className='border-t-2 border-gray-300'>
                      <td className='px-4 py-4 text-right text-lg font-bold text-gray-900'>Total</td>
                      <td className='px-4 py-4 text-right text-lg font-bold text-purple-700'>
                        ${request.planCharge.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Barcode & QR */}
            <div className='mb-8 flex items-center justify-between rounded-lg bg-gray-50 p-6'>
              <Barcode value={invoiceNumber} />
              <QRCodePlaceholder value={invoiceNumber} />
            </div>

            {/* Payment Button */}
            {request.status === "waiting_payment" && (
              <div className='flex flex-col items-center'>
                <button
                  onClick={() => void handlePayNow()}
                  disabled={loading}
                  className='flex w-full items-center justify-center gap-3 rounded-lg bg-linear-to-r from-purple-600 to-purple-800 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-purple-900 disabled:opacity-50'
                >
                  {loading ? (
                    <>
                      <svg className='h-5 w-5 animate-spin' viewBox='0 0 24 24'>
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                          fill='none'
                        />
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className='h-6 w-6' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z' />
                        <path
                          fillRule='evenodd'
                          d='M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z'
                          clipRule='evenodd'
                        />
                      </svg>
                      Pay ${request.planCharge.toFixed(2)} with Stripe
                    </>
                  )}
                </button>
                <p className='mt-3 flex items-center gap-2 text-sm text-gray-500'>
                  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  Secured by Stripe
                </p>
              </div>
            )}

            {/* Paid Status */}
            {request.status === "paid" && (
              <div className='flex flex-col items-center rounded-lg bg-green-50 p-6'>
                <svg className='h-16 w-16 text-green-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
                <p className='mt-4 text-xl font-semibold text-green-700'>Payment Successful!</p>
                <p className='mt-1 text-gray-600'>Your session has been confirmed.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='border-t border-gray-200 bg-gray-50 px-8 py-4'>
            <p className='text-center text-sm text-gray-500'>
              Thank you for using Mentoria! If you have any questions, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invoice;
