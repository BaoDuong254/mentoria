import { useBookingStore } from "@/store/useBookingStore";
import { useBookingRequestStore, type BookingRequest } from "@/store/useBookingRequestStore";
import { Clock, Globe, Star, Users, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, isSameDay, parseISO } from "date-fns";
import type { Slot } from "@/types/booking.type";
import { useAuthStore } from "@/store/useAuthStore";
import { useSearchStore } from "@/store/useSearchStore";
import path from "@/constants/path";

interface MonthConfig {
  month: number;
  year: number;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildCalendarMatrix(year: number, month: number): (number | null)[][] {
  // Monday as first day of week
  const firstDayIndex = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  for (let i = 0; i < firstDayIndex; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

function Booking() {
  const { planId } = useParams();
  const navigate = useNavigate();
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
  const { addRequest } = useBookingRequestStore();
  const [name, setName] = useState(`${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim());
  const [email, setEmail] = useState(user?.email);
  const [discuss, setDiscuss] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Calendar state - memoize today to prevent unnecessary re-renders
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState<MonthConfig>({
    month: today.getMonth() + 1,
    year: today.getFullYear(),
  });

  const calendarWeeks = useMemo(
    () => buildCalendarMatrix(currentMonth.year, currentMonth.month),
    [currentMonth.year, currentMonth.month]
  );

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
        new Date(currentMonth.year, currentMonth.month - 1)
      ),
    [currentMonth.year, currentMonth.month]
  );

  // Dates with available slots
  const datesWithSlots = useMemo(() => {
    const dates = new Set<number>();
    slots.forEach((slot) => {
      const slotDate = parseISO(slot.start_time);
      if (slotDate.getMonth() + 1 === currentMonth.month && slotDate.getFullYear() === currentMonth.year) {
        dates.add(slotDate.getDate());
      }
    });
    return dates;
  }, [slots, currentMonth.month, currentMonth.year]);

  const handleMonthChange = useCallback((direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      let newMonth = prev.month;
      let newYear = prev.year;

      if (direction === "prev") {
        if (prev.month === 1) {
          newMonth = 12;
          newYear = prev.year - 1;
        } else {
          newMonth = prev.month - 1;
        }
        // Limit to year 1900
        if (newYear < 1900) return prev;
      } else {
        if (prev.month === 12) {
          newMonth = 1;
          newYear = prev.year + 1;
        } else {
          newMonth = prev.month + 1;
        }
        // Limit to year 2100
        if (newYear > 2100) return prev;
      }

      return { month: newMonth, year: newYear };
    });
  }, []);

  const handleDayClick = useCallback(
    (day: number) => {
      const newDate = new Date(currentMonth.year, currentMonth.month - 1, day);
      // Only allow selecting future dates
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (newDate >= todayStart) {
        setSelectedDate(newDate);
        setSelectedSlotId("");
      }
    },
    [currentMonth.year, currentMonth.month, setSelectedDate, setSelectedSlotId, today]
  );

  const isSelectedDay = useCallback(
    (day: number) => {
      if (!selectedDate) return false;
      return (
        selectedDate.getDate() === day &&
        selectedDate.getMonth() + 1 === currentMonth.month &&
        selectedDate.getFullYear() === currentMonth.year
      );
    },
    [selectedDate, currentMonth.month, currentMonth.year]
  );

  const isToday = useCallback(
    (day: number) => {
      return (
        day === today.getDate() &&
        currentMonth.month === today.getMonth() + 1 &&
        currentMonth.year === today.getFullYear()
      );
    },
    [today, currentMonth.month, currentMonth.year]
  );

  const isPastDay = useCallback(
    (day: number) => {
      const date = new Date(currentMonth.year, currentMonth.month - 1, day);
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      return date < todayStart;
    },
    [currentMonth.year, currentMonth.month, today]
  );

  useEffect(() => {
    if (planId) {
      void fetchSlots(Number(planId));
    }
  }, [planId, fetchSlots]);

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];

    return slots.filter((slot: Slot) => {
      const slotDate = parseISO(slot.start_time);
      return isSameDay(slotDate, selectedDate);
    });
  }, [selectedDate, slots]);

  const handleBookSession = () => {
    if (!user?.user_id) {
      alert("Please login to book a session");
      return;
    }

    if (!selectedSlotId || !planId) {
      alert("Please select a session");
      return;
    }

    const currentSlot = slots.find((s) => s.slot_id === selectedSlotId);
    if (!currentSlot) {
      alert("Not found slot id!");
      return;
    }

    if (!discuss) {
      alert("Please complete the discussion");
      return;
    }

    setIsProcessing(true);

    try {
      // Create pending booking request using Zustand store
      const pendingRequest: BookingRequest = {
        id: `pending-${String(Date.now())}`,
        menteeId: user.user_id,
        menteeName: name,
        menteeEmail: email ?? "",
        menteeAvatar: user.avatar_url ?? "",
        mentorId: currentSlot.mentor_id,
        mentorName: `${selectedMentor?.first_name ?? ""} ${selectedMentor?.last_name ?? ""}`,
        mentorAvatar: selectedMentor?.avatar_url ?? "",
        mentorSpecialty: selectedMentor?.companies[0]?.job_name ?? "Mentor",
        planId: Number(planId),
        planType: selectedPlanType ?? "Session",
        planCharge: selectedCharge ?? 0,
        slotStartTime: currentSlot.start_time,
        slotEndTime: currentSlot.end_time,
        slotDate: currentSlot.start_time.split("T")[0],
        message: discuss,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // Add to Zustand store (which persists to localStorage)
      addRequest(pendingRequest);

      // Navigate to MenteeDashboard with success message
      alert("Booking request sent successfully! Waiting for mentor approval.");
      void navigate(`${path.MENTEE}/${path.MENTEE_DASHBOARD}`);
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Failed to create booking request. Please try again.");
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
              {/* Custom Calendar */}
              <div className='w-11/12 rounded-xl border border-gray-500 bg-gray-800 p-6'>
                <div className='mb-4 flex items-center justify-between'>
                  <button
                    onClick={() => {
                      handleMonthChange("prev");
                    }}
                    className='p-1 text-gray-400 hover:text-white'
                  >
                    <ChevronLeft className='h-5 w-5' />
                  </button>
                  <h3 className='font-bold text-white'>«{monthLabel}»</h3>
                  <button
                    onClick={() => {
                      handleMonthChange("next");
                    }}
                    className='p-1 text-gray-400 hover:text-white'
                  >
                    <ChevronRight className='h-5 w-5' />
                  </button>
                </div>

                {/* Weekday Labels */}
                <div className='mb-2 grid grid-cols-7 text-center'>
                  {WEEKDAY_LABELS.map((label, i) => (
                    <div key={i} className='py-1 text-xs text-gray-400 underline'>
                      {label}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className='grid grid-cols-7 gap-1'>
                  {calendarWeeks.flat().map((day, i) => {
                    if (day === null) {
                      return <div key={`empty-${String(i)}`} className='h-8' />;
                    }

                    const hasSlots = datesWithSlots.has(day);
                    const selected = isSelectedDay(day);
                    const todayDay = isToday(day);
                    const past = isPastDay(day);

                    return (
                      <button
                        key={day}
                        onClick={() => {
                          if (!past) handleDayClick(day);
                        }}
                        disabled={past}
                        className={`mx-auto flex h-8 w-8 items-center justify-center rounded text-sm transition-colors ${selected ? "bg-purple-600 text-white" : ""} ${!selected && hasSlots && !past ? "bg-cyan-600 text-white" : ""} ${!selected && !hasSlots && !past ? "text-gray-300 hover:bg-gray-700" : ""} ${past ? "cursor-not-allowed text-gray-600" : "cursor-pointer"} ${todayDay && !selected ? "ring-1 ring-purple-500" : ""} `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
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
                        const fixedTime = slot.start_time.replace("Z", "");
                        const timeLabel = format(parseISO(fixedTime), "h:mm a");
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
                      onClick={() => {
                        handleBookSession();
                      }}
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
