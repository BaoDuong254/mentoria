import { useState, useMemo, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useBookingRequestStore } from "@/store/useBookingRequestStore";
import {
  getMeetingsForMentor,
  updateMeetingLocation,
  updateMeetingStatus,
  updateMeetingReviewLink,
  type MeetingResponse,
} from "@/apis/meeting.api";
import { createSlot, getAllSlotsByPlanId, type CreateSlotRequest, type SlotData } from "@/apis/slot.api";
import { getMentor } from "@/apis/mentor.api";

// Helper functions
function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

interface MonthConfig {
  month: number;
  year: number;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCalendarMatrix(year: number, month: number): (number | null)[][] {
  const firstDayIndex = new Date(year, month - 1, 1).getDay();
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

function generateMonths(): MonthConfig[] {
  const now = new Date();
  const months: MonthConfig[] = [];
  // Generate 6 months starting from current month
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }
  return months;
}

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTimeRange(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const formatTime = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${formatTime(start)} - ${formatTime(end)}`;
}

// Icons
const CalendarIcon = () => (
  <svg className='h-3.5 w-3.5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
      clipRule='evenodd'
    />
  </svg>
);

const ClockIcon = () => (
  <svg className='h-3.5 w-3.5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
      clipRule='evenodd'
    />
  </svg>
);

const VideoIcon = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z' />
  </svg>
);

const CheckIcon = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
      clipRule='evenodd'
    />
  </svg>
);

const PlusIcon = () => (
  <svg className='h-3 w-3' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z'
      clipRule='evenodd'
    />
  </svg>
);

const DocumentIcon = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z'
      clipRule='evenodd'
    />
  </svg>
);

const ChevronLeft = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
      clipRule='evenodd'
    />
  </svg>
);

const ChevronRight = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
      clipRule='evenodd'
    />
  </svg>
);

interface MentorPlan {
  plan_id: number;
  plan_description: string;
  plan_charge: number;
  plan_type: string;
}

function MentorDashboard() {
  const { user } = useAuthStore();
  const [meetings, setMeetings] = useState<MeetingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [mentorPlans, setMentorPlans] = useState<MentorPlan[]>([]);
  const [mentorSlots, setMentorSlots] = useState<SlotData[]>([]);

  // Booking request store
  const { getPendingRequestsByMentor, getAcceptedRequestsByMentor, acceptRequest, declineRequest } =
    useBookingRequestStore();

  // Calendar state
  const months = useMemo(() => generateMonths(), []);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const today = new Date();
  const todayStr = `${String(today.getFullYear())}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const currentMonth = months[currentMonthIndex];
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

  // Time slot form
  const [slotStartTime, setSlotStartTime] = useState("");
  const [slotDuration, setSlotDuration] = useState(60);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  // Meeting link modal
  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null);
  const [meetingLink, setMeetingLink] = useState("");

  // Decline modal state
  const [decliningRequestId, setDecliningRequestId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  // Review link modal state
  const [reviewMeetingId, setReviewMeetingId] = useState<number | null>(null);
  const [reviewLink, setReviewLink] = useState("");
  const [isAddingReview, setIsAddingReview] = useState(false);

  // Fetch meetings
  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMeetingsForMentor();
      if (response.success && response.data) {
        setMeetings(response.data);
      }
    } catch (err) {
      console.error("Error fetching meetings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch mentor profile to get plans
  const fetchMentorProfile = useCallback(async () => {
    if (!user?.user_id) return;
    try {
      const response = await getMentor(user.user_id);
      if (response.success && response.data?.plans) {
        setMentorPlans(response.data.plans);
        if (response.data.plans.length > 0) {
          setSelectedPlanId(response.data.plans[0].plan_id);
        }
      }
    } catch (err) {
      console.error("Error fetching mentor profile:", err);
    }
  }, [user?.user_id]);

  // Fetch slots for all plans
  const fetchMentorSlots = useCallback(async () => {
    if (mentorPlans.length === 0) return;

    try {
      const allSlots: SlotData[] = [];
      for (const plan of mentorPlans) {
        const response = await getAllSlotsByPlanId(plan.plan_id, 1, 100);
        if (response.success && response.data?.slots) {
          allSlots.push(...response.data.slots);
        }
      }
      setMentorSlots(allSlots);
    } catch (err) {
      console.error("Error fetching slots:", err);
    }
  }, [mentorPlans]);

  useEffect(() => {
    void fetchMeetings();
    void fetchMentorProfile();
  }, [fetchMeetings, fetchMentorProfile]);

  useEffect(() => {
    void fetchMentorSlots();
  }, [fetchMentorSlots]);

  // Get pending booking requests from store
  const pendingBookingRequests = useMemo(() => {
    if (!user?.user_id) return [];
    return getPendingRequestsByMentor(user.user_id);
  }, [user?.user_id, getPendingRequestsByMentor]);

  // Get requests waiting for payment (mentor accepted but mentee not yet paid)
  const pendingPaymentRequests = useMemo(() => {
    if (!user?.user_id) return [];
    return getAcceptedRequestsByMentor(user.user_id).filter((r) => r.status === "waiting_payment");
  }, [user?.user_id, getAcceptedRequestsByMentor]);

  // Group meetings by status
  const scheduledMeetings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return meetings.filter((m) => {
      const meetingDate = new Date(m.date);
      meetingDate.setHours(0, 0, 0, 0);
      return m.status === "Scheduled" && meetingDate >= today;
    });
  }, [meetings]);

  // Out of date meetings - past scheduled meetings that weren't completed
  const outOfDateMeetings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return meetings.filter((m) => {
      const meetingDate = new Date(m.date);
      meetingDate.setHours(0, 0, 0, 0);
      return meetingDate < today && m.status !== "Completed" && m.status !== "Cancelled";
    });
  }, [meetings]);

  // Completed meetings
  const completedMeetings = useMemo(() => meetings.filter((m) => m.status === "Completed"), [meetings]);

  // Get meetings for today
  const todayMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const meetingDate = m.date.split("T")[0];
      return meetingDate === selectedDate;
    });
  }, [meetings, selectedDate]);

  // Get slots for selected date
  const selectedDateSlots = useMemo(() => {
    return mentorSlots.filter((slot) => {
      const slotDate = slot.date.split("T")[0];
      return slotDate === selectedDate;
    });
  }, [mentorSlots, selectedDate]);

  // Dates with available slots (green)
  const datesWithAvailableSlots = useMemo(() => {
    const dates = new Set<number>();
    mentorSlots.forEach((slot) => {
      const [year, month, day] = slot.date.split("T")[0].split("-").map(Number);
      if (year === currentMonth.year && month === currentMonth.month && slot.status === "Available") {
        dates.add(day);
      }
    });
    return dates;
  }, [mentorSlots, currentMonth.year, currentMonth.month]);

  // Dates that are fully booked (have slots but none available) - blue
  const datesFullyBooked = useMemo(() => {
    const dates = new Set<number>();
    // Group slots by day
    const slotsByDay = new Map<number, { hasSlots: boolean; hasAvailable: boolean }>();

    mentorSlots.forEach((slot) => {
      const [year, month, day] = slot.date.split("T")[0].split("-").map(Number);
      if (year === currentMonth.year && month === currentMonth.month) {
        const existing = slotsByDay.get(day) ?? { hasSlots: false, hasAvailable: false };
        existing.hasSlots = true;
        if (slot.status === "Available") {
          existing.hasAvailable = true;
        }
        slotsByDay.set(day, existing);
      }
    });

    // A day is fully booked if it has slots but none are available
    slotsByDay.forEach((info, day) => {
      if (info.hasSlots && !info.hasAvailable) {
        dates.add(day);
      }
    });

    return dates;
  }, [mentorSlots, currentMonth.year, currentMonth.month]);

  const handleMonthChange = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? currentMonthIndex - 1 : currentMonthIndex + 1;
    if (newIndex >= 0 && newIndex < months.length) {
      setCurrentMonthIndex(newIndex);
    }
  };

  const handleDayClick = (day: number) => {
    const iso = `${String(currentMonth.year)}-${pad(currentMonth.month)}-${pad(day)}`;
    setSelectedDate(iso);
  };

  const isSelectedDay = (day: number) => {
    const dayStr = `${String(currentMonth.year)}-${pad(currentMonth.month)}-${pad(day)}`;
    return dayStr === selectedDate;
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth.month === today.getMonth() + 1 &&
      currentMonth.year === today.getFullYear()
    );
  };

  // Add time slot
  const handleAddTimeSlot = async () => {
    if (!slotStartTime || !selectedPlanId) {
      alert("Please select start time and plan");
      return;
    }

    setIsAddingSlot(true);
    try {
      const startDateTime = new Date(`${selectedDate}T${slotStartTime}`);
      const endDateTime = new Date(startDateTime.getTime() + slotDuration * 60000);

      const slotData: CreateSlotRequest = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        date: selectedDate,
        status: "Available",
      };

      const response = await createSlot(selectedPlanId, slotData);
      if (response.success) {
        alert("Time slot added successfully!");
        setSlotStartTime("");
      } else {
        alert(response.message ?? "Failed to add time slot");
      }
    } catch (err) {
      console.error("Error adding slot:", err);
      alert("Failed to add time slot");
    } finally {
      setIsAddingSlot(false);
    }
  };

  // Update meeting link
  const handleUpdateMeetingLink = async () => {
    if (!editingMeetingId || !meetingLink) return;

    try {
      const response = await updateMeetingLocation(editingMeetingId, meetingLink);
      if (response.success) {
        setEditingMeetingId(null);
        setMeetingLink("");
        void fetchMeetings();
      }
    } catch (err) {
      console.error("Error updating meeting link:", err);
    }
  };

  // Mark meeting as completed
  const handleCompleteMeeting = async (meetingId: number) => {
    try {
      const response = await updateMeetingStatus(meetingId, "Completed");
      if (response.success) {
        void fetchMeetings();
      } else {
        alert(response.message ?? "Failed to complete meeting");
      }
    } catch (err) {
      console.error("Error completing meeting:", err);
      alert("Failed to complete meeting");
    }
  };

  const handleJoinMeeting = (meeting: MeetingResponse) => {
    if (meeting.location) {
      window.open(meeting.location, "_blank");
    } else {
      setEditingMeetingId(meeting.meeting_id);
    }
  };

  // Handle booking request accept (from local store)
  const handleAcceptBookingRequest = (requestId: string) => {
    acceptRequest(requestId);
    // Optionally refresh slots to sync status
    void fetchMentorSlots();
  };

  // Handle booking request decline with reason
  const handleDeclineBookingRequest = () => {
    if (!decliningRequestId || !declineReason.trim()) {
      alert("Please provide a reason for declining");
      return;
    }
    declineRequest(decliningRequestId, declineReason);
    setDecliningRequestId(null);
    setDeclineReason("");
    // Optionally refresh slots to mark as available again
    void fetchMentorSlots();
  };

  // Handle add review link
  const handleAddReviewLink = async () => {
    if (!reviewMeetingId || !reviewLink.trim()) {
      alert("Please provide a review link");
      return;
    }

    setIsAddingReview(true);
    try {
      const response = await updateMeetingReviewLink(reviewMeetingId, reviewLink.trim());
      if (response.success) {
        setReviewMeetingId(null);
        setReviewLink("");
        void fetchMeetings();
      } else {
        alert(response.message ?? "Failed to add review link");
      }
    } catch (err) {
      console.error("Error adding review link:", err);
      alert("Failed to add review link");
    } finally {
      setIsAddingReview(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-900'>
        <div className='text-xl text-white'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900'>
      <div className='flex'>
        {/* Left Panel - Sessions */}
        <div className='flex-1 overflow-y-auto p-6'>
          {/* Header */}
          <div className='mb-6'>
            <h1 className='text-2xl font-semibold text-white'>Mentor Dashboard</h1>
            <p className='mt-1 text-gray-400'>Manage your mentoring sessions and availability</p>
          </div>

          {/* Accepted Section */}
          <div>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-xl font-medium text-cyan-700'>Accepted</h2>
              <span className='flex h-7 w-8 items-center justify-center rounded-full bg-cyan-700 text-sm text-white'>
                {scheduledMeetings.length}
              </span>
            </div>

            <div className='space-y-4'>
              {scheduledMeetings.map((meeting) => (
                <div key={meeting.meeting_id} className='rounded-lg border border-gray-700 bg-gray-800 p-4'>
                  {/* Mentee Info */}
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-3'>
                      <img
                        src={meeting.mentee_avatar_url ?? "https://i.pravatar.cc/150?img=1"}
                        alt={`${meeting.mentee_first_name} ${meeting.mentee_last_name}`}
                        className='h-10 w-10 rounded-full object-cover'
                      />
                      <div>
                        <h3 className='font-medium text-white'>
                          {meeting.mentee_first_name} {meeting.mentee_last_name}
                        </h3>
                        <p className='text-sm text-gray-400'>{meeting.plan_type}</p>
                      </div>
                    </div>
                    <span className='rounded-full bg-green-600 px-3 py-1 text-xs text-green-100'>Confirmed</span>
                  </div>

                  {/* Topic */}
                  <div className='mt-4'>
                    <p className='font-medium text-cyan-700'>{meeting.plan_description}</p>
                  </div>

                  {/* Schedule Info */}
                  <div className='mt-4 flex items-center justify-between'>
                    <div className='flex items-center gap-4 text-sm text-gray-400'>
                      <div className='flex items-center gap-2'>
                        <CalendarIcon />
                        <span>{formatDateDisplay(meeting.date)}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <ClockIcon />
                        <span>{formatTimeRange(meeting.start_time, meeting.end_time)}</span>
                      </div>
                    </div>
                    <span className='text-sm font-medium text-cyan-700'>${meeting.amount_paid}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className='mt-4 flex gap-3'>
                    <button
                      onClick={() => {
                        handleJoinMeeting(meeting);
                      }}
                      className='flex items-center gap-2 rounded bg-cyan-700 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600'
                    >
                      <VideoIcon />
                      {meeting.location ? "Join Meeting" : "Add Meeting Link"}
                    </button>
                    <button className='rounded border border-gray-600 bg-transparent px-4 py-2 text-sm text-white hover:border-gray-500'>
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}

              {scheduledMeetings.length === 0 && (
                <div className='rounded-lg border border-gray-700 bg-gray-800 p-8 text-center'>
                  <p className='text-gray-400'>No scheduled meetings</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Booking Requests Section (from store) - Moved up after Accepted */}
          {pendingBookingRequests.length > 0 && (
            <div className='mb-8'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-xl font-medium text-yellow-500'>Pending Booking Requests</h2>
                <span className='flex h-7 w-8 items-center justify-center rounded-full bg-yellow-600 text-sm text-white'>
                  {pendingBookingRequests.length}
                </span>
              </div>

              <div className='space-y-4'>
                {pendingBookingRequests.map((request) => (
                  <div key={request.id} className='rounded-lg border border-gray-700 bg-gray-800 p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start gap-3'>
                        <img
                          src={request.menteeAvatar || "https://i.pravatar.cc/150?img=1"}
                          alt={request.menteeName}
                          className='h-10 w-10 rounded-full object-cover'
                        />
                        <div>
                          <h3 className='font-medium text-white'>{request.menteeName}</h3>
                          <p className='text-sm text-gray-400'>{request.planType}</p>
                        </div>
                      </div>
                      <span className='rounded-full bg-yellow-600 px-3 py-1 text-xs text-yellow-100'>Pending</span>
                    </div>

                    {request.message && (
                      <div className='mt-4'>
                        <p className='text-sm text-gray-300'>"{request.message}"</p>
                      </div>
                    )}

                    <div className='mt-4 flex items-center justify-between'>
                      <div className='flex items-center gap-4 text-sm text-gray-400'>
                        <div className='flex items-center gap-2'>
                          <CalendarIcon />
                          <span>{formatDateDisplay(request.slotDate)}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <ClockIcon />
                          <span>{formatTimeRange(request.slotStartTime, request.slotEndTime)}</span>
                        </div>
                      </div>
                      <span className='text-sm font-medium text-cyan-700'>${String(request.planCharge)}</span>
                    </div>

                    <div className='mt-4 flex gap-3'>
                      <button
                        onClick={() => {
                          handleAcceptBookingRequest(request.id);
                        }}
                        className='rounded bg-purple-800 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700'
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          setDecliningRequestId(request.id);
                        }}
                        className='rounded border border-gray-600 bg-transparent px-4 py-2 text-sm text-white hover:border-gray-500'
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Payment Section - Mentor accepted, waiting for mentee payment */}
          {pendingPaymentRequests.length > 0 && (
            <div className='mb-8'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-xl font-medium text-purple-400'>Pending Acceptance</h2>
                <span className='flex h-7 w-8 items-center justify-center rounded-full bg-purple-700 text-sm text-white'>
                  {pendingPaymentRequests.length}
                </span>
              </div>

              <div className='space-y-4'>
                {pendingPaymentRequests.map((request) => (
                  <div key={request.id} className='rounded-lg border border-purple-600/30 bg-gray-800 p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start gap-3'>
                        <img
                          src={request.menteeAvatar || "https://i.pravatar.cc/150?img=1"}
                          alt={request.menteeName}
                          className='h-10 w-10 rounded-full object-cover'
                        />
                        <div>
                          <h3 className='font-medium text-white'>{request.menteeName}</h3>
                          <p className='text-sm text-gray-400'>{request.planType}</p>
                        </div>
                      </div>
                      <span className='rounded-full bg-purple-600/20 px-3 py-1 text-xs font-medium text-purple-400'>
                        Awaiting Payment
                      </span>
                    </div>

                    {request.message && (
                      <div className='mt-4'>
                        <p className='text-sm text-gray-300'>"{request.message}"</p>
                      </div>
                    )}

                    <div className='mt-4 flex items-center justify-between'>
                      <div className='flex items-center gap-4 text-sm text-gray-400'>
                        <div className='flex items-center gap-2'>
                          <CalendarIcon />
                          <span>{formatDateDisplay(request.slotDate)}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <ClockIcon />
                          <span>{formatTimeRange(request.slotStartTime, request.slotEndTime)}</span>
                        </div>
                      </div>
                      <span className='text-sm font-medium text-purple-400'>${String(request.planCharge)}</span>
                    </div>

                    <div className='mt-4'>
                      <p className='text-sm text-purple-300'>
                        ✓ You have accepted this booking. Waiting for mentee to complete payment.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Out of Date Section */}
          {outOfDateMeetings.length > 0 && (
            <div className='mb-8'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-xl font-medium text-red-500'>Out of Date</h2>
                <span className='flex h-7 w-8 items-center justify-center rounded-full bg-red-700 text-sm text-white'>
                  {outOfDateMeetings.length}
                </span>
              </div>

              <div className='space-y-4'>
                {outOfDateMeetings.map((meeting) => (
                  <div key={meeting.meeting_id} className='rounded-lg border border-red-600/30 bg-gray-800 p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start gap-3'>
                        <img
                          src={meeting.mentee_avatar_url ?? "https://i.pravatar.cc/150?img=1"}
                          alt={`${meeting.mentee_first_name} ${meeting.mentee_last_name}`}
                          className='h-10 w-10 rounded-full object-cover'
                        />
                        <div>
                          <h3 className='font-medium text-white'>
                            {meeting.mentee_first_name} {meeting.mentee_last_name}
                          </h3>
                          <p className='text-sm text-gray-400'>{meeting.plan_type}</p>
                        </div>
                      </div>
                      <span className='rounded-full bg-red-700 px-3 py-1 text-xs text-red-100'>Out of Date</span>
                    </div>

                    <div className='mt-4'>
                      <p className='font-medium text-red-400'>{meeting.plan_description}</p>
                    </div>

                    <div className='mt-4 flex items-center justify-between'>
                      <div className='flex items-center gap-4 text-sm text-gray-400'>
                        <div className='flex items-center gap-2'>
                          <CalendarIcon />
                          <span>{formatDateDisplay(meeting.date)}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <ClockIcon />
                          <span>{formatTimeRange(meeting.start_time, meeting.end_time)}</span>
                        </div>
                      </div>
                      <span className='text-sm font-medium text-red-400'>${meeting.amount_paid}</span>
                    </div>

                    <div className='mt-4 flex gap-3'>
                      <button
                        onClick={() => void handleCompleteMeeting(meeting.meeting_id)}
                        className='flex items-center gap-2 rounded bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600'
                      >
                        <CheckIcon />
                        Mark Complete
                      </button>
                      <button
                        onClick={() => {
                          handleJoinMeeting(meeting);
                        }}
                        className='flex items-center gap-2 rounded border border-red-600 bg-transparent px-4 py-2 text-sm text-red-400 hover:bg-red-900/30'
                      >
                        Review Meeting
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Section */}
          {completedMeetings.length > 0 && (
            <div className='mb-8'>
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='text-xl font-medium text-green-500'>Completed</h2>
                <span className='flex h-7 w-8 items-center justify-center rounded-full bg-green-700 text-sm text-white'>
                  {completedMeetings.length}
                </span>
              </div>

              <div className='space-y-4'>
                {completedMeetings.map((meeting) => (
                  <div key={meeting.meeting_id} className='rounded-lg border border-green-600/30 bg-gray-800 p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start gap-3'>
                        <img
                          src={meeting.mentee_avatar_url ?? "https://i.pravatar.cc/150?img=1"}
                          alt={`${meeting.mentee_first_name} ${meeting.mentee_last_name}`}
                          className='h-10 w-10 rounded-full object-cover'
                        />
                        <div>
                          <h3 className='font-medium text-white'>
                            {meeting.mentee_first_name} {meeting.mentee_last_name}
                          </h3>
                          <p className='text-sm text-gray-400'>{meeting.plan_type}</p>
                        </div>
                      </div>
                      <span className='rounded-full bg-green-600 px-3 py-1 text-xs text-green-100'>Completed</span>
                    </div>

                    <div className='mt-4'>
                      <p className='font-medium text-green-400'>{meeting.plan_description}</p>
                    </div>

                    <div className='mt-4 flex items-center justify-between'>
                      <div className='flex items-center gap-4 text-sm text-gray-400'>
                        <div className='flex items-center gap-2'>
                          <CalendarIcon />
                          <span>{formatDateDisplay(meeting.date)}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <ClockIcon />
                          <span>{formatTimeRange(meeting.start_time, meeting.end_time)}</span>
                        </div>
                      </div>
                      <span className='text-sm font-medium text-green-400'>${meeting.amount_paid}</span>
                    </div>

                    {/* Review Link Section */}
                    <div className='mt-4 border-t border-gray-700 pt-4'>
                      {meeting.review_link ? (
                        <div className='flex items-center justify-between'>
                          <a
                            href={meeting.review_link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300'
                          >
                            <DocumentIcon />
                            <span>View Review Document</span>
                          </a>
                          <button
                            onClick={() => {
                              setReviewMeetingId(meeting.meeting_id);
                              setReviewLink(meeting.review_link ?? "");
                            }}
                            className='text-sm text-gray-400 hover:text-white'
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReviewMeetingId(meeting.meeting_id);
                            setReviewLink("");
                          }}
                          className='flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300'
                        >
                          <DocumentIcon />
                          <span>Add Review Link</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Availability */}
        <div className='w-[480px] border-l border-gray-700 bg-gray-800 p-6'>
          {/* Header */}
          <div className='mb-6'>
            <h2 className='text-xl font-medium text-white'>Your Availability</h2>
            <p className='mt-1 text-sm text-gray-400'>Add time slots for mentees to book sessions</p>
          </div>

          {/* Calendar */}
          <div className='mb-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='font-medium text-white'>{monthLabel}</h3>
              <div className='flex gap-2'>
                <button
                  onClick={() => {
                    handleMonthChange("prev");
                  }}
                  disabled={currentMonthIndex === 0}
                  className='p-1 text-gray-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30'
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={() => {
                    handleMonthChange("next");
                  }}
                  disabled={currentMonthIndex === months.length - 1}
                  className='p-1 text-gray-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-30'
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            {/* Weekday Labels */}
            <div className='mb-2 grid grid-cols-7'>
              {WEEKDAY_LABELS.map((label, i) => (
                <div key={i} className='py-2 text-center text-xs text-gray-400'>
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className='grid grid-cols-7 gap-1'>
              {calendarWeeks.flat().map((day, i) => {
                if (day === null) {
                  return <div key={`empty-${String(i)}`} className='h-9' />;
                }

                const hasAvailableSlot = datesWithAvailableSlots.has(day);
                const isFullyBooked = datesFullyBooked.has(day);
                const selected = isSelectedDay(day);
                const todayDay = isToday(day);

                return (
                  <button
                    key={day}
                    onClick={() => {
                      handleDayClick(day);
                    }}
                    className={`mx-auto flex h-9 w-14 items-center justify-center rounded text-sm transition-colors ${selected ? "bg-purple-800 text-white" : ""} ${!selected && hasAvailableSlot ? "bg-green-700 text-white" : ""} ${!selected && !hasAvailableSlot && isFullyBooked ? "bg-blue-700 text-white" : ""} ${!selected && !hasAvailableSlot && !isFullyBooked ? "text-gray-500 hover:bg-gray-700" : ""} ${todayDay && !selected ? "ring-1 ring-purple-500" : ""} `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className='mt-4 flex flex-wrap gap-4 text-xs text-gray-400'>
              <div className='flex items-center gap-2'>
                <div className='h-3 w-3 rounded bg-green-700'></div>
                <span>Available slots</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-3 w-3 rounded bg-blue-700'></div>
                <span>Fully booked</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='h-3 w-3 rounded bg-purple-800'></div>
                <span>Selected</span>
              </div>
            </div>
          </div>

          {/* Add Time Slot */}
          <div className='mb-6'>
            <h3 className='mb-4 font-medium text-white'>Add Available Time Slot</h3>

            <div className='mb-3 flex gap-3'>
              <div className='flex-1'>
                <label className='mb-1 block text-sm text-gray-400'>Start Time</label>
                <input
                  type='time'
                  value={slotStartTime}
                  onChange={(e) => {
                    setSlotStartTime(e.target.value);
                  }}
                  className='w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white'
                />
              </div>
              <div className='flex-1'>
                <label className='mb-1 block text-sm text-gray-400'>Duration</label>
                <select
                  value={slotDuration}
                  onChange={(e) => {
                    setSlotDuration(Number(e.target.value));
                  }}
                  className='w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white'
                >
                  <option value={30}>30 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </select>
              </div>
            </div>

            <div className='mb-3'>
              <label className='mb-1 block text-sm text-gray-400'>Plan</label>
              <select
                value={selectedPlanId ?? ""}
                onChange={(e) => {
                  setSelectedPlanId(Number(e.target.value));
                }}
                className='w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white'
              >
                {mentorPlans.map((plan) => (
                  <option key={plan.plan_id} value={plan.plan_id}>
                    {plan.plan_type} - ${plan.plan_charge}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => void handleAddTimeSlot()}
              disabled={isAddingSlot}
              className='flex w-full items-center justify-center gap-2 rounded bg-purple-800 py-2 font-medium text-white hover:bg-purple-700 disabled:opacity-50'
            >
              <PlusIcon />
              {isAddingSlot ? "Adding..." : "Add Time Slot"}
            </button>
          </div>

          {/* Schedule for Selected Date */}
          <div>
            <h3 className='mb-4 font-medium text-white'>Schedule for {formatDateDisplay(selectedDate)}</h3>

            <div className='space-y-3'>
              {/* Display Available Slots */}
              {selectedDateSlots
                .filter((slot) => slot.status === "Available")
                .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                .map((slot, index) => {
                  const plan = mentorPlans.find((p) => p.plan_id === slot.plan_id);
                  return (
                    <div key={`slot-${String(index)}`} className='rounded bg-gray-700 p-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium text-green-500'>
                          {formatTimeRange(slot.start_time, slot.end_time)}
                        </span>
                        <span className='rounded-full bg-green-600 px-2 py-0.5 text-xs text-white'>Available</span>
                      </div>
                      <p className='mt-1 text-sm text-gray-300'>
                        {plan ? `${plan.plan_type} - $${String(plan.plan_charge)}` : "Open for booking"}
                      </p>
                    </div>
                  );
                })}

              {/* Display Booked Slots from Meetings */}
              {todayMeetings.map((meeting) => (
                <div key={meeting.meeting_id} className='rounded bg-gray-700 p-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-cyan-700'>
                      {formatTimeRange(meeting.start_time, meeting.end_time)}
                    </span>
                    <span className='rounded-full bg-cyan-600 px-2 py-0.5 text-xs text-white'>
                      {meeting.status === "Scheduled" ? "Booked" : meeting.status}
                    </span>
                  </div>
                  <p className='mt-1 text-sm text-gray-300'>
                    {meeting.plan_type} with {meeting.mentee_first_name} {meeting.mentee_last_name}
                  </p>
                </div>
              ))}

              {selectedDateSlots.filter((s) => s.status === "Available").length === 0 && todayMeetings.length === 0 && (
                <div className='rounded bg-gray-700 p-4 text-center'>
                  <p className='text-sm text-gray-400'>No slots available for this date</p>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className='mt-6 flex items-center gap-4 text-xs text-gray-400'>
            <div className='flex items-center gap-1'>
              <div className='h-3 w-3 rounded bg-green-700'></div>
              <span>Available</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-3 w-3 rounded bg-cyan-700'></div>
              <span>Booked</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-3 w-3 rounded bg-purple-800'></div>
              <span>Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Link Modal */}
      {editingMeetingId && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-96 rounded-lg bg-gray-800 p-6'>
            <h3 className='mb-4 text-lg font-medium text-white'>Add Meeting Link</h3>
            <input
              type='url'
              value={meetingLink}
              onChange={(e) => {
                setMeetingLink(e.target.value);
              }}
              placeholder='https://meet.google.com/...'
              className='mb-4 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white'
            />
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => {
                  setEditingMeetingId(null);
                  setMeetingLink("");
                }}
                className='rounded border border-gray-600 px-4 py-2 text-white hover:border-gray-500'
              >
                Cancel
              </button>
              <button
                onClick={() => void handleUpdateMeetingLink()}
                className='rounded bg-purple-800 px-4 py-2 text-white hover:bg-purple-700'
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Request Modal */}
      {decliningRequestId && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-96 rounded-lg bg-gray-800 p-6'>
            <h3 className='mb-4 text-lg font-medium text-white'>Decline Booking Request</h3>
            <p className='mb-4 text-sm text-gray-400'>
              Please provide a reason for declining this request. The mentee will be notified.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => {
                setDeclineReason(e.target.value);
              }}
              placeholder='Reason for declining...'
              rows={4}
              className='mb-4 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white'
            />
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => {
                  setDecliningRequestId(null);
                  setDeclineReason("");
                }}
                className='rounded border border-gray-600 px-4 py-2 text-white hover:border-gray-500'
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineBookingRequest}
                disabled={!declineReason.trim()}
                className='rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500 disabled:opacity-50'
              >
                Send & Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Link Modal */}
      {reviewMeetingId && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-96 rounded-lg bg-gray-800 p-6'>
            <h3 className='mb-4 text-lg font-medium text-white'>Add Review Link</h3>
            <p className='mb-4 text-sm text-gray-400'>
              Add a link to your review document (Google Docs, PDF, etc.) for the mentee to access.
            </p>
            <input
              type='url'
              value={reviewLink}
              onChange={(e) => {
                setReviewLink(e.target.value);
              }}
              placeholder='https://docs.google.com/document/...'
              className='mb-4 w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white'
            />
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => {
                  setReviewMeetingId(null);
                  setReviewLink("");
                }}
                className='rounded border border-gray-600 px-4 py-2 text-white hover:border-gray-500'
              >
                Cancel
              </button>
              <button
                onClick={() => void handleAddReviewLink()}
                disabled={!reviewLink.trim() || isAddingReview}
                className='rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-500 disabled:opacity-50'
              >
                {isAddingReview ? "Adding..." : "Add Review Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MentorDashboard;
