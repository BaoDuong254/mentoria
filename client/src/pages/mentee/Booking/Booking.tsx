import { useBookingStore } from "@/store/useBookingStore";
import { Clock, Globe, Star, Users, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { format, isSameDay, parseISO, addHours } from "date-fns";
import type { Slot } from "@/types/booking.type";
import Calendar from "@/components/Calendar";
import { useAuthStore } from "@/store/useAuthStore";
import { useSearchStore } from "@/store/useSearchStore";
import { createCheckoutSession } from "@/apis/payment.api";
import { showToast } from "@/utils/toast";

// Helper function to convert UTC time to Vietnam timezone (UTC+7)
const toVietnamTime = (isoString: string): Date => {
  // Remove 'Z' suffix if present and parse as local time
  const cleanedTime = isoString.replace("Z", "");
  const date = parseISO(cleanedTime);
  // Add 7 hours to convert from UTC to Vietnam time
  return addHours(date, 7);
};

function Booking() {
  const { planId } = useParams();
  const {
    slots,
    selectedDate,
    selectedSlotId,
    fetchSlots,
    setSelectedDate,
    setSelectedSlotId,
    isLoadingSlots,
    selectedPlanType,
    selectedCharge,
  } = useBookingStore();
  const { user } = useAuthStore();
  const { selectedMentor } = useSearchStore();
  const [name, setName] = useState(`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim());
  const [email, setEmail] = useState(user?.email);
  const [discuss, setDiscuss] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    if (planId) {
      void fetchSlots(Number(planId));
    }
  }, [planId, fetchSlots]);
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];

    return slots.filter((slot: Slot) => {
      // Use Vietnam timezone for comparison
      const slotDate = toVietnamTime(slot.start_time);
      return isSameDay(slotDate, selectedDate);
    });
  }, [selectedDate, slots]);

  const handleBookSession = async () => {
    if (!user?.user_id) {
      showToast.warning("Please login to book a session");
      return;
    }

    if (!selectedSlotId || !planId) {
      showToast.warning("Please select a session");
      return;
    }

    const currentSlot = slots.find((s) => s.slot_id === selectedSlotId);
    if (!currentSlot) {
      showToast.error("Not found slot id!");
      return;
    }

    if (!discuss) {
      showToast.warning("Please complete the discussion");
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        menteeId: user.user_id,
        mentorId: currentSlot.mentor_id,
        planId: Number(planId),
        slotStartTime: currentSlot.start_time,
        slotEndTime: currentSlot.end_time,
        message: discuss,
        discountCode: "",
      };

      const res = await createCheckoutSession(payload);

      if (res.success && res.data?.sessionUrl) {
        window.location.href = res.data.sessionUrl;
      } else if (!res.success) {
        showToast.error(res.message || "Booking failed");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      showToast.error("Failed to create checkout session. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <>
      {!isLoadingSlots && (
        <div className='flex w-full items-center justify-center bg-(--secondary)'>
          <div className='my-14 flex w-10/12'>
            {/* Left side */}
            <div className='flex w-1/3 flex-col gap-5'>
              {/* Information of session */}
              <div className='flex w-11/12 items-center justify-center rounded-xl border border-gray-500 bg-gray-800'>
                <div className='flex w-10/12 flex-col justify-center gap-4 py-5 text-gray-400'>
                  <div className='flex items-center gap-3'>
                    <img src={selectedMentor?.avatar_url} alt='avt' className='h-15 w-15 rounded-full' />
                    <div className='flex flex-col gap-1'>
                      <span>
                        <strong className='font-semibold text-white'>
                          {selectedMentor?.first_name} {selectedMentor?.last_name}
                        </strong>
                      </span>
                      <span className='text-(--light-purple)/90'>{selectedMentor?.companies[0].job_name}</span>
                      <span className='flex items-center'>
                        {Array.from({ length: 5 }, (_, index) => {
                          const starValue = index + 1;
                          const isFilled = starValue <= Math.floor(selectedMentor?.average_rating ?? 0);
                          return (
                            <Star
                              className='mr-0.5 h-4 w-4 text-yellow-500'
                              fill={isFilled ? "currentColor" : "none"}
                              key={index}
                            />
                          );
                        })}{" "}
                        ({selectedMentor?.total_feedbacks} reviews)
                      </span>
                    </div>
                  </div>
                  <span className='font-semibold text-white'>{selectedPlanType}</span>
                  <div className='flex flex-col gap-3 text-gray-300'>
                    <span className='flex items-center gap-2'>
                      <Video className='fill-(--green) text-(--green)' />
                      Video Call
                    </span>
                    <span className='flex items-center gap-2'>
                      <Clock className='text-(--primary)' />
                      60 Minutes
                    </span>
                    <span className='flex items-center gap-2'>
                      <Users className='fill-(--light-purple) text-(--light-purple)' />
                      One-on-One
                    </span>
                  </div>
                  <div className='flex items-center justify-between border-t border-gray-600 pt-6'>
                    <span>Session Fee</span>
                    <span>
                      <strong className='text-xl text-white'>${selectedCharge}</strong>
                    </span>
                  </div>
                </div>
              </div>
              <div className='w-11/12 rounded-xl border border-gray-500 bg-gray-800 p-6'>
                <Calendar
                  selectedDate={selectedDate ?? new Date()}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                  }}
                  variant='mentee'
                />
              </div>
            </div>
            {/* Right side */}
            <div className='flex w-2/3 flex-col gap-5'>
              <div className='flex w-full items-center justify-center rounded-xl border border-gray-500 bg-gray-800 py-8'>
                <div className='flex w-11/12 flex-col gap-4'>
                  <div className='flex items-center gap-2'>
                    <Globe className='h-7 w-7 fill-(--green) text-gray-800' />
                    <span className='text-white'>
                      {selectedDate ? format(selectedDate, "EEEE, dd MMMM") : "Please select a date"}
                    </span>
                  </div>
                  <div className='grid grid-cols-3 gap-4'>
                    {slotsForSelectedDate.length > 0 ? (
                      slotsForSelectedDate.map((slot) => {
                        // Convert to Vietnam timezone (UTC+7)
                        const vietnamTime = toVietnamTime(slot.start_time);
                        const timeLabel = format(vietnamTime, "h:mm a");
                        const isSelected = selectedSlotId === slot.slot_id;

                        return (
                          <button
                            key={slot.slot_id}
                            onClick={() => {
                              setSelectedSlotId(slot.slot_id);
                            }}
                            className={`cursor-pointer rounded-lg border py-3 text-sm font-medium transition-all duration-200 ${isSelected ? "border-(--primary) text-(--light-purple) shadow-[0_0_10px_rgba(147,51,234,0.3)]" : "border-gray-600 text-gray-300 hover:border-gray-400 hover:bg-gray-700"}`}
                          >
                            {timeLabel}
                          </button>
                        );
                      })
                    ) : (
                      <div className='border-dash col-span-3 flex flex-col items-center justify-center rounded-lg border border-gray-700 py-8 text-gray-500'>
                        <p>No available slots</p>
                        <p className='text-xs'>Try selecting another date on the calendar</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className='flex w-full justify-center rounded-lg border border-gray-500 bg-gray-800'>
                <div className='my-8 flex w-11/12 flex-col gap-5 text-gray-400'>
                  <h2>
                    <strong className='text-2xl text-white'>Complete Your Booking</strong>
                  </h2>
                  <div className='flex justify-between gap-6'>
                    <div className='flex w-1/2 flex-col gap-3'>
                      <label htmlFor='Name' className='text-gray-200'>
                        Your Name
                      </label>
                      <input
                        type='text'
                        className='w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-3 text-white transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                        placeholder='Your Name'
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                      />
                    </div>
                    <div className='flex w-1/2 flex-col gap-3'>
                      <label htmlFor='Email' className='text-gray-200'>
                        Email Address
                      </label>
                      <input
                        type='text'
                        className='w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-3 text-white transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                        placeholder='Your Email'
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                        }}
                        disabled
                      />
                    </div>
                  </div>
                  <div className='flex flex-col gap-3'>
                    <label htmlFor='Email' className='text-gray-200'>
                      What would you like to discuss?
                    </label>
                    <textarea
                      className='h-[200px] w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-3 text-white transition-all outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                      placeholder='Please share what you d like to focus on during our session...'
                      value={discuss}
                      onChange={(e) => {
                        setDiscuss(e.target.value);
                      }}
                    />
                  </div>
                  <div className='mt-3 flex justify-end gap-4'>
                    <button className='cursor-pointer rounded-lg border border-gray-500 px-4 py-3 text-gray-400 transition-all hover:border-gray-400 hover:bg-gray-700'>
                      Cancel
                    </button>
                    <button
                      className={`flex items-center gap-2 rounded-lg px-8 py-2.5 font-bold text-white shadow-lg transition ${
                        selectedSlotId && !isProcessing
                          ? "cursor-pointer bg-(--primary) hover:bg-(--primary)/80"
                          : "cursor-not-allowed bg-gray-700 text-gray-500"
                      }`}
                      disabled={!selectedSlotId || isProcessing}
                      onClick={() => void handleBookSession()}
                    >
                      {isProcessing ? "Processing..." : "Book Session"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default Booking;
