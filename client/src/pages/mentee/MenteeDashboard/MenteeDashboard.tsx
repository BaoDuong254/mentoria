import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMenteeSessions } from "@/apis/dashboard.api";
import { createCheckoutSession } from "@/apis/payment.api";
import { useBookingRequestStore, type BookingRequest } from "@/store/useBookingRequestStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { MentorSession, SessionsByDate, SessionStatus, MonthConfig, ApiSession } from "@/types/dashboard.type";
import { WEEKDAY_LABELS } from "@/types/dashboard.type";
import path from "@/constants/path";

// Calendar icon component
const CalendarIcon = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
      clipRule='evenodd'
    />
  </svg>
);

// Clock icon component
const ClockIcon = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
      clipRule='evenodd'
    />
  </svg>
);

// Video icon component
const VideoIcon = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z' />
  </svg>
);

// Credit card icon component
const CreditCardIcon = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z' />
    <path
      fillRule='evenodd'
      d='M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z'
      clipRule='evenodd'
    />
  </svg>
);

// Document/Review icon component
const DocumentIcon = () => (
  <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z'
      clipRule='evenodd'
    />
  </svg>
);

// Chevron icons
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

// Empty calendar illustration
const EmptyCalendarIcon = () => (
  <svg className='h-48 w-48 text-purple-800' viewBox='0 0 200 200' fill='none'>
    <rect x='30' y='50' width='140' height='120' rx='8' stroke='currentColor' strokeWidth='4' fill='none' />
    <line x1='30' y1='80' x2='170' y2='80' stroke='currentColor' strokeWidth='4' />
    <circle cx='60' cy='65' r='5' fill='currentColor' />
    <circle cx='140' cy='65' r='5' fill='currentColor' />
    <rect x='50' y='100' width='20' height='20' rx='2' fill='currentColor' opacity='0.3' />
    <rect x='90' y='100' width='20' height='20' rx='2' fill='currentColor' opacity='0.3' />
    <rect x='130' y='100' width='20' height='20' rx='2' fill='currentColor' opacity='0.3' />
    <rect x='50' y='130' width='20' height='20' rx='2' fill='currentColor' opacity='0.3' />
    <rect x='90' y='130' width='20' height='20' rx='2' fill='currentColor' opacity='0.3' />
    <rect x='130' y='130' width='20' height='20' rx='2' fill='currentColor' opacity='0.3' />
  </svg>
);

// Helper functions
function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function getMonthKey(year: number, month: number): string {
  return `${String(year)}-${pad(month)}`;
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

// Map API session status to our SessionStatus type
function mapApiStatus(session: ApiSession): SessionStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if session date is in the past
  if (session.date) {
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);

    // If the session is completed, keep it as completed
    if (session.meeting_status?.toLowerCase() === "completed") {
      return "completed";
    }

    // If the session date is in the past and it's not completed, mark as out_of_date
    if (sessionDate < today) {
      return "out_of_date";
    }
  }

  // If no invoice exists, payment is required
  if (!session.invoice_id && !session.paid_time) {
    return "payment_required";
  }

  // If no meeting exists or meeting status
  if (!session.meeting_status) {
    return "pending";
  }

  const meetingStatus = session.meeting_status.toLowerCase();

  if (meetingStatus === "completed") return "completed";
  if (meetingStatus === "cancelled") return "cancelled";
  if (meetingStatus === "scheduled") return "accepted";

  return "pending";
}

// Convert API session to MentorSession
function convertApiSession(session: ApiSession): MentorSession {
  const dateStr = session.date ? session.date.split("T")[0] : new Date().toISOString().split("T")[0];

  return {
    id: `session-${String(session.plan_registerations_id)}`,
    registrationId: session.plan_registerations_id,
    planId: session.plan_id,
    mentorId: session.mentor_id,
    menteeId: session.mentee_id,
    mentorName: `${session.mentor_first_name} ${session.mentor_last_name}`,
    mentorAvatar: session.mentor_avatar ?? "https://i.pravatar.cc/150?img=1",
    mentorSpecialty: session.mentor_specialty ?? "Mentor",
    topic: session.topic,
    planCharge: session.plan_charge,
    planDescription: session.plan_description,
    scheduledDate: formatDateDisplay(dateStr),
    scheduledTime:
      session.start_time && session.end_time ? formatTimeRange(session.start_time, session.end_time) : "Time TBD",
    status: mapApiStatus(session),
    meetingLink: session.meeting_link ?? undefined,
    invoiceId: session.invoice_id ?? undefined,
    amount: session.amount ?? undefined,
    slotStartTime: session.start_time ?? undefined,
    slotEndTime: session.end_time ?? undefined,
    reviewLink: session.review_link ?? undefined,
  };
}

// Group sessions by date
function groupSessionsByDate(sessions: MentorSession[]): SessionsByDate {
  return sessions.reduce<SessionsByDate>((grouped, session) => {
    // Parse the formatted date back to ISO format for grouping
    const date = new Date(session.scheduledDate);
    const isoDate = date.toISOString().split("T")[0];

    return {
      ...grouped,
      [isoDate]: [...(grouped[isoDate] ?? []), session],
    };
  }, {});
}

// Generate months for calendar (current month and next 2 months)
function generateMonths(): MonthConfig[] {
  const now = new Date();
  const months: MonthConfig[] = [];

  for (let i = 0; i < 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  }

  return months;
}

function MenteeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Booking request store for pending requests (before mentor acceptance)
  const {
    getPendingRequestsByMentee,
    getWaitingPaymentByMentee,
    getDeclinedRequestsByMentee,
    removeRequest,
    markAsPaid,
    hideRequest,
  } = useBookingRequestStore();

  const [sessionsByDate, setSessionsByDate] = useState<SessionsByDate>({});
  const [loading, setLoading] = useState(true);

  // Calendar state
  const months = useMemo(() => generateMonths(), []);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const today = new Date();
  const todayStr = `${String(today.getFullYear())}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectionByMonth, setSelectionByMonth] = useState<Record<string, string>>({});

  const currentMonth = months[currentMonthIndex];
  const monthKey = getMonthKey(currentMonth.year, currentMonth.month);

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

  // Fetch sessions from API
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getMenteeSessions();

      if (response.success && response.data?.sessions) {
        const convertedSessions = response.data.sessions.map(convertApiSession);
        const grouped = groupSessionsByDate(convertedSessions);
        setSessionsByDate(grouped);

        // Set initial date selection to first date with sessions if available
        const dates = Object.keys(grouped).sort();
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
      // For now, use empty sessions - the API might not exist yet
      setSessionsByDate({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  // Get ALL accepted sessions from API (not filtered by date)
  const allAcceptedSessions = useMemo(() => {
    const allSessions: MentorSession[] = [];
    Object.values(sessionsByDate).forEach((sessions) => {
      sessions.forEach((session) => {
        if (session.status === "accepted") {
          allSessions.push(session);
        }
      });
    });
    // Sort by date (most recent first)
    return allSessions.sort((a, b) => {
      const dateA = new Date(a.scheduledDate);
      const dateB = new Date(b.scheduledDate);
      return dateA.getTime() - dateB.getTime();
    });
  }, [sessionsByDate]);

  // Get ALL completed sessions from API (not filtered by date)
  const allCompletedSessions = useMemo(() => {
    const allSessions: MentorSession[] = [];
    Object.values(sessionsByDate).forEach((sessions) => {
      sessions.forEach((session) => {
        if (session.status === "completed") {
          allSessions.push(session);
        }
      });
    });
    // Sort by date (most recent first)
    return allSessions.sort((a, b) => {
      const dateA = new Date(a.scheduledDate);
      const dateB = new Date(b.scheduledDate);
      return dateB.getTime() - dateA.getTime();
    });
  }, [sessionsByDate]);

  // Get pending booking requests from Zustand store (before mentor accepts)
  const pendingBookingRequests = useMemo(() => {
    if (!user?.user_id) return [];
    return getPendingRequestsByMentee(user.user_id);
  }, [user?.user_id, getPendingRequestsByMentee]);

  // Get waiting payment requests (mentor accepted, need to pay)
  const waitingPaymentRequests = useMemo(() => {
    if (!user?.user_id) return [];
    return getWaitingPaymentByMentee(user.user_id);
  }, [user?.user_id, getWaitingPaymentByMentee]);

  // Get declined requests (mentor declined with reason)
  const declinedRequests = useMemo(() => {
    if (!user?.user_id) return [];
    return getDeclinedRequestsByMentee(user.user_id);
  }, [user?.user_id, getDeclinedRequestsByMentee]);

  const hasPendingBookings = pendingBookingRequests.length > 0;
  const hasWaitingPayment = waitingPaymentRequests.length > 0;
  const hasDeclinedRequests = declinedRequests.length > 0;
  const hasAcceptedSessions = allAcceptedSessions.length > 0;
  const hasCompletedSessions = allCompletedSessions.length > 0;
  const hasAnySessions =
    hasAcceptedSessions || hasCompletedSessions || hasPendingBookings || hasWaitingPayment || hasDeclinedRequests;

  // Get dates with sessions for current month
  const datesWithSessions = useMemo(() => {
    const dates = new Set<number>();
    Object.keys(sessionsByDate).forEach((dateStr) => {
      const [year, month, day] = dateStr.split("-").map(Number);
      if (year === currentMonth.year && month === currentMonth.month) {
        dates.add(day);
      }
    });
    return dates;
  }, [sessionsByDate, currentMonth.year, currentMonth.month]);

  const setSelectedDateForMonth = (iso: string) => {
    setSelectedDate(iso);
    setSelectionByMonth((prev) => ({ ...prev, [monthKey]: iso }));
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? currentMonthIndex - 1 : currentMonthIndex + 1;
    if (newIndex >= 0 && newIndex < months.length) {
      setCurrentMonthIndex(newIndex);
      const newMonthKey = getMonthKey(months[newIndex].year, months[newIndex].month);
      if (selectionByMonth[newMonthKey]) {
        setSelectedDate(selectionByMonth[newMonthKey]);
      }
    }
  };

  const handleDayClick = (day: number) => {
    const iso = `${String(currentMonth.year)}-${pad(currentMonth.month)}-${pad(day)}`;
    setSelectedDateForMonth(iso);
  };

  const handleJoinMeeting = (session: MentorSession) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, "_blank");
    }
  };

  const handleReschedule = (session: MentorSession) => {
    // Navigate to booking page for rescheduling
    void navigate(`${path.MENTEE}/${path.MENTEE_BOOKING}/${String(session.planId)}`);
  };

  // Cancel a pending booking request (from Zustand store)
  const handleCancelPendingRequest = (request: BookingRequest) => {
    if (window.confirm("Are you sure you want to cancel this booking request?")) {
      removeRequest(request.id);
    }
  };

  // Hide a declined request from mentee's view
  const handleHideDeclinedRequest = (request: BookingRequest) => {
    hideRequest(request.id, "mentee");
  };

  // Pay for a waiting_payment request
  const handlePayForRequest = async (request: BookingRequest) => {
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
        // Mark as paid in store (will be "paid" status temporarily)
        markAsPaid(request.id);
        // Redirect to Stripe checkout
        window.location.href = response.data.sessionUrl;
      } else {
        alert(response.message || "Failed to create checkout session");
      }
    } catch (err) {
      console.error("Error creating checkout session:", err);
      alert("Failed to create checkout session. Please try again.");
    }
  };

  const handleBookMentor = () => {
    void navigate(path.MENTOR_BROWSE);
  };

  // Check if a day is the selected day
  const isSelectedDay = (day: number) => {
    const dayStr = `${String(currentMonth.year)}-${pad(currentMonth.month)}-${pad(day)}`;
    return dayStr === selectedDate;
  };

  // Check if a day is today
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth.month === today.getMonth() + 1 &&
      currentMonth.year === today.getFullYear()
    );
  };

  // Check if a day is in the future (including today)
  const isFutureDay = (day: number) => {
    const dayDate = new Date(currentMonth.year, currentMonth.month - 1, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dayDate >= todayStart;
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-900'>
        <div className='text-xl text-white'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 py-6'>
      <div className='mx-auto max-w-7xl px-6'>
        <div className='flex gap-6'>
          {/* Left Panel - Sessions List */}
          <div className='flex-1'>
            {/* Header */}
            <div className='mb-6'>
              <h1 className='text-2xl font-semibold text-white'>MenteeDashboard</h1>
              <p className='mt-1 text-gray-400'>Manage your mentoring sessions and requests</p>
            </div>

            {/* Sessions Content */}
            {!hasAnySessions ? (
              /* Empty State */
              <div className='flex flex-col items-center justify-center py-16'>
                <EmptyCalendarIcon />
                <h2 className='mt-6 text-4xl font-medium text-white'>Your schedule is empty</h2>
                <p className='mt-4 text-center text-xl text-gray-400'>
                  There are no appointments
                  <br />
                  scheduled
                </p>
                <button
                  onClick={handleBookMentor}
                  className='mt-8 rounded-full bg-purple-800 px-12 py-4 text-2xl text-white transition-colors hover:bg-purple-700'
                >
                  Book a mentor
                </button>
              </div>
            ) : (
              /* Sessions and Booking Requests */
              <div className='space-y-8'>
                {/* Pending Booking Requests (Waiting for Mentor Approval) */}
                {hasPendingBookings && (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <h2 className='text-xl font-medium text-yellow-500'>Pending Approval</h2>
                      <span className='flex h-7 w-8 items-center justify-center rounded-full bg-yellow-600 text-sm text-white'>
                        {pendingBookingRequests.length}
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {pendingBookingRequests.map((request) => (
                        <div key={request.id} className='rounded-lg border border-yellow-600/30 bg-gray-800 p-4'>
                          <div className='flex items-start justify-between'>
                            <div className='flex items-start gap-4'>
                              <img
                                src={request.mentorAvatar || "https://i.pravatar.cc/150?img=1"}
                                alt={request.mentorName}
                                className='h-12 w-12 rounded-full object-cover'
                              />
                              <div>
                                <h3 className='font-medium text-white'>{request.mentorName}</h3>
                                <p className='text-sm text-gray-400'>{request.mentorSpecialty}</p>
                                <p className='text-sm text-yellow-500'>${request.planCharge}/hour</p>
                              </div>
                            </div>
                            <span className='rounded-full bg-yellow-600/20 px-3 py-1 text-xs font-medium text-yellow-400'>
                              Waiting Mentor
                            </span>
                          </div>
                          <div className='mt-4'>
                            <p className='font-medium text-yellow-400'>{request.planType}</p>
                            <p className='mt-1 text-sm text-gray-400'>{request.message}</p>
                          </div>
                          <div className='mt-4 flex items-center gap-4 text-sm text-gray-400'>
                            <div className='flex items-center gap-2'>
                              <CalendarIcon />
                              <span>{request.slotDate}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <ClockIcon />
                              <span>
                                {new Date(request.slotStartTime).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}{" "}
                                -{" "}
                                {new Date(request.slotEndTime).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className='mt-4'>
                            <button
                              onClick={() => {
                                handleCancelPendingRequest(request);
                              }}
                              className='rounded bg-gray-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-500'
                            >
                              Cancel Request
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Waiting Payment (Mentor Accepted) */}
                {hasWaitingPayment && (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <h2 className='text-xl font-medium text-purple-400'>Ready to Pay</h2>
                      <span className='flex h-7 w-8 items-center justify-center rounded-full bg-purple-700 text-sm text-white'>
                        {waitingPaymentRequests.length}
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {waitingPaymentRequests.map((request) => (
                        <div key={request.id} className='rounded-lg border border-purple-600/30 bg-gray-800 p-4'>
                          <div className='flex items-start justify-between'>
                            <div className='flex items-start gap-4'>
                              <img
                                src={request.mentorAvatar || "https://i.pravatar.cc/150?img=1"}
                                alt={request.mentorName}
                                className='h-12 w-12 rounded-full object-cover'
                              />
                              <div>
                                <h3 className='font-medium text-white'>{request.mentorName}</h3>
                                <p className='text-sm text-gray-400'>{request.mentorSpecialty}</p>
                                <p className='text-sm text-purple-400'>${request.planCharge}/hour</p>
                              </div>
                            </div>
                            <span className='rounded-full bg-purple-600/20 px-3 py-1 text-xs font-medium text-purple-400'>
                              Mentor Accepted
                            </span>
                          </div>
                          <div className='mt-4'>
                            <p className='font-medium text-purple-300'>{request.planType}</p>
                            <p className='mt-1 text-sm text-gray-400'>{request.message}</p>
                          </div>
                          <div className='mt-4 flex items-center gap-4 text-sm text-gray-400'>
                            <div className='flex items-center gap-2'>
                              <CalendarIcon />
                              <span>{request.slotDate}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <ClockIcon />
                              <span>
                                {new Date(request.slotStartTime).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}{" "}
                                -{" "}
                                {new Date(request.slotEndTime).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className='mt-4 flex items-center justify-between'>
                            <span className='text-lg font-semibold text-purple-400'>${request.planCharge}</span>
                            <div className='flex gap-2'>
                              <button
                                onClick={() => {
                                  const invoiceUrl = [path.MENTEE, path.MENTEE_INVOICE, request.id].join("/");
                                  void navigate(invoiceUrl);
                                }}
                                className='flex items-center gap-2 rounded border border-purple-600 bg-transparent px-4 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-900/30'
                              >
                                View Invoice
                              </button>
                              <button
                                onClick={() => void handlePayForRequest(request)}
                                className='flex items-center gap-2 rounded bg-purple-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600'
                              >
                                <CreditCardIcon />
                                Pay Now
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Declined Requests (Mentor Declined with Reason) */}
                {hasDeclinedRequests && (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <h2 className='text-xl font-medium text-red-500'>Declined</h2>
                      <span className='flex h-7 w-8 items-center justify-center rounded-full bg-red-700 text-sm text-white'>
                        {declinedRequests.length}
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {declinedRequests.map((request) => (
                        <div key={request.id} className='rounded-lg border border-red-600/30 bg-gray-800 p-4'>
                          <div className='flex items-start justify-between'>
                            <div className='flex items-start gap-4'>
                              <img
                                src={request.mentorAvatar || "https://i.pravatar.cc/150?img=1"}
                                alt={request.mentorName}
                                className='h-12 w-12 rounded-full object-cover'
                              />
                              <div>
                                <h3 className='font-medium text-white'>{request.mentorName}</h3>
                                <p className='text-sm text-gray-400'>{request.mentorSpecialty}</p>
                                <p className='text-sm text-red-400'>${request.planCharge}/hour</p>
                              </div>
                            </div>
                            <span className='rounded-full bg-red-600/20 px-3 py-1 text-xs font-medium text-red-400'>
                              Declined
                            </span>
                          </div>
                          <div className='mt-4'>
                            <p className='font-medium text-red-300'>{request.planType}</p>
                            <p className='mt-1 text-sm text-gray-400'>{request.message}</p>
                          </div>
                          {/* Decline Reason */}
                          {request.declineReason && (
                            <div className='mt-4 rounded-lg border border-red-600/20 bg-red-900/20 p-3'>
                              <p className='text-sm font-medium text-red-400'>Reason for Decline:</p>
                              <p className='mt-1 text-sm text-gray-300'>{request.declineReason}</p>
                            </div>
                          )}
                          <div className='mt-4 flex items-center gap-4 text-sm text-gray-400'>
                            <div className='flex items-center gap-2'>
                              <CalendarIcon />
                              <span>{request.slotDate}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <ClockIcon />
                              <span>
                                {new Date(request.slotStartTime).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}{" "}
                                -{" "}
                                {new Date(request.slotEndTime).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className='mt-4 flex items-center justify-between'>
                            <button
                              onClick={() => {
                                handleHideDeclinedRequest(request);
                              }}
                              className='rounded bg-red-700 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600'
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => {
                                void navigate(path.MENTOR_BROWSE);
                              }}
                              className='rounded border border-gray-600 bg-transparent px-4 py-2 text-sm text-white transition-colors hover:border-gray-500'
                            >
                              Find Another Mentor
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accepted Sessions (from API - Paid & Scheduled) */}
                {hasAcceptedSessions && (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <h2 className='text-xl font-medium text-cyan-500'>Accepted</h2>
                      <span className='flex h-7 w-8 items-center justify-center rounded-full bg-cyan-700 text-sm text-white'>
                        {allAcceptedSessions.length}
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {allAcceptedSessions.map((session) => (
                        <div key={session.id} className='rounded-lg border border-cyan-600/30 bg-gray-800 p-4'>
                          <div className='flex items-start justify-between'>
                            <div className='flex items-start gap-4'>
                              <img
                                src={session.mentorAvatar}
                                alt={session.mentorName}
                                className='h-12 w-12 rounded-full object-cover'
                              />
                              <div>
                                <h3 className='font-medium text-white'>{session.mentorName}</h3>
                                <p className='text-sm text-gray-400'>{session.mentorSpecialty}</p>
                                <p className='text-sm text-cyan-500'>${session.planCharge}/hour</p>
                              </div>
                            </div>
                            <span className='rounded-full bg-cyan-600/20 px-3 py-1 text-xs font-medium text-cyan-400'>
                              Confirmed
                            </span>
                          </div>
                          <div className='mt-4'>
                            <p className='font-medium text-cyan-400'>{session.topic}</p>
                          </div>
                          <div className='mt-4 flex items-center justify-between'>
                            <div className='flex items-center gap-4 text-sm text-gray-400'>
                              <div className='flex items-center gap-2'>
                                <CalendarIcon />
                                <span>{session.scheduledDate}</span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <ClockIcon />
                                <span>{session.scheduledTime}</span>
                              </div>
                            </div>
                            <span className='text-sm font-medium text-cyan-500'>
                              ${session.amount ?? session.planCharge}
                            </span>
                          </div>
                          <div className='mt-4 flex gap-3'>
                            <button
                              onClick={() => {
                                handleJoinMeeting(session);
                              }}
                              className='flex items-center gap-2 rounded bg-cyan-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600'
                            >
                              <VideoIcon />
                              Join Meeting
                            </button>
                            <button
                              onClick={() => {
                                handleReschedule(session);
                              }}
                              className='rounded border border-gray-600 bg-transparent px-4 py-2 text-sm text-white transition-colors hover:border-gray-500'
                            >
                              Reschedule
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Sessions (from API) */}
                {hasCompletedSessions && (
                  <div>
                    <div className='mb-4 flex items-center justify-between'>
                      <h2 className='text-xl font-medium text-gray-400'>Completed</h2>
                      <span className='flex h-7 w-8 items-center justify-center rounded-full bg-gray-600 text-sm text-white'>
                        {allCompletedSessions.length}
                      </span>
                    </div>
                    <div className='space-y-4'>
                      {allCompletedSessions.map((session) => (
                        <div key={session.id} className='rounded-lg border border-gray-600/30 bg-gray-800 p-4'>
                          <div className='flex items-start justify-between'>
                            <div className='flex items-start gap-4'>
                              <img
                                src={session.mentorAvatar}
                                alt={session.mentorName}
                                className='h-12 w-12 rounded-full object-cover'
                              />
                              <div>
                                <h3 className='font-medium text-white'>{session.mentorName}</h3>
                                <p className='text-sm text-gray-400'>{session.mentorSpecialty}</p>
                                <p className='text-sm text-gray-500'>${session.planCharge}/hour</p>
                              </div>
                            </div>
                            <span className='rounded-full bg-gray-600/20 px-3 py-1 text-xs font-medium text-gray-400'>
                              Completed
                            </span>
                          </div>
                          <div className='mt-4'>
                            <p className='font-medium text-gray-300'>{session.topic}</p>
                          </div>
                          <div className='mt-4 flex items-center justify-between'>
                            <div className='flex items-center gap-4 text-sm text-gray-400'>
                              <div className='flex items-center gap-2'>
                                <CalendarIcon />
                                <span>{session.scheduledDate}</span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <ClockIcon />
                                <span>{session.scheduledTime}</span>
                              </div>
                            </div>
                            <span className='text-sm font-medium text-gray-500'>
                              ${session.amount ?? session.planCharge}
                            </span>
                          </div>
                          {session.reviewLink && (
                            <div className='mt-4'>
                              <a
                                href={session.reviewLink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center gap-2 rounded bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600'
                              >
                                <DocumentIcon />
                                View Review Document
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Calendar */}
          <div className='w-96'>
            <div className='sticky top-6 rounded-xl border border-gray-700 bg-gray-800 p-6'>
              {/* Calendar Header */}
              <div className='mb-6 flex items-center justify-between'>
                <h2 className='font-semibold text-white'>{monthLabel}</h2>
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      handleMonthChange("prev");
                    }}
                    disabled={currentMonthIndex === 0}
                    className='p-1 text-gray-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30'
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    onClick={() => {
                      handleMonthChange("next");
                    }}
                    disabled={currentMonthIndex === months.length - 1}
                    className='p-1 text-gray-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30'
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>

              {/* Weekday Labels */}
              <div className='mb-2 grid grid-cols-7'>
                {WEEKDAY_LABELS.map((label, i) => (
                  <div key={i} className='py-2 text-center text-sm font-medium text-gray-500'>
                    {label}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className='grid grid-cols-7 gap-1'>
                {calendarWeeks.flat().map((day, i) => {
                  if (day === null) {
                    return <div key={`empty-${String(i)}`} className='h-10' />;
                  }

                  const hasSession = datesWithSessions.has(day);
                  const selected = isSelectedDay(day);
                  const todayDay = isToday(day);
                  const future = isFutureDay(day);

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        handleDayClick(day);
                      }}
                      className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors ${selected ? "bg-purple-800 text-white" : ""} ${!selected && hasSession && future ? "text-purple-500 hover:bg-gray-700" : ""} ${!selected && !hasSession ? "text-gray-500 hover:bg-gray-700" : ""} ${todayDay && !selected ? "ring-1 ring-purple-500" : ""} `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenteeDashboard;
