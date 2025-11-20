//ver3
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import path from "@/constants/path";
import menteeApi from "@/apis/mentee.api";
import { useMenteeStore } from "@/store/useMenteeStore";
import type { DashboardSessionStatus, MenteeDashboardSession } from "@/types";

interface MonthConfig {
  month: number;
  year: number;
}

interface MentorSession {
  id: string;
  sessionId: number;
  isoDate: string;
  name: string;
  avatar: string;
  specialty: string;
  hourlyRate: number;
  sessionPrice: number;
  topic: string;
  scheduledDate: string;
  startTime: string;
  endTime?: string | null;
  status: DashboardSessionStatus;
}

type SessionsByDate = Record<string, MentorSession[] | undefined>;

const MONTHS: MonthConfig[] = [
  { month: 11, year: 2024 },
  { month: 12, year: 2024 },
  { month: 1, year: 2025 },
];

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const STATUS_ORDER: DashboardSessionStatus[] = ["accepted", "payment_required", "pending", "completed", "cancelled"];

const STATUS_META: Record<
  DashboardSessionStatus,
  {
    label: string;
    badgeClass: string;
    accentClass: string;
  }
> = {
  accepted: {
    label: "Accepted",
    badgeClass: "bg-emerald-100 text-emerald-700",
    accentClass: "bg-emerald-400",
  },
  payment_required: {
    label: "Payment Required",
    badgeClass: "bg-amber-100 text-amber-700",
    accentClass: "bg-amber-400",
  },
  pending: {
    label: "Pending Requests",
    badgeClass: "bg-indigo-100 text-indigo-700",
    accentClass: "bg-indigo-400",
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-slate-200 text-slate-700",
    accentClass: "bg-slate-400",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-rose-100 text-rose-700",
    accentClass: "bg-rose-500",
  },
};

const formatDateLabel = (isoDate: string) => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));
};

const formatFullDate = (isoDate: string | null) => {
  if (!isoDate) return "No date selected";
  return formatDateLabel(isoDate);
};

const formatTimeRange = (start: string, end?: string | null) => {
  const normalize = (time: string) => {
    if (!time) return "00:00";
    return time.length === 5 ? `${time}:00` : time;
  };
  const formatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
  const startLabel = formatter.format(new Date(`1970-01-01T${normalize(start)}`));
  if (!end) return startLabel;
  return `${startLabel} - ${formatter.format(new Date(`1970-01-01T${normalize(end)}`))}`;
};

const pad = (value: number) => value.toString().padStart(2, "0");

const getMonthKey = (year: number, month: number) => `${String(year)}-${pad(month)}`;

const buildCalendarMatrix = (year: number, month: number) => {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  for (let i = 0; i < firstDay; i += 1) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
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
};

const getFirstAvailableDateForMonth = (targetMonthKey: string, data: SessionsByDate) => {
  const sortedDates = Object.keys(data)
    .filter((date) => date.startsWith(targetMonthKey) && (data[date]?.length ?? 0) > 0)
    .sort();
  return sortedDates[0] ?? null;
};

const normalizeSession = (session: MenteeDashboardSession): MentorSession => ({
  id: String(session.sessionId),
  sessionId: session.sessionId,
  isoDate: session.sessionDate,
  name: session.mentorName,
  avatar: session.mentorAvatar ?? "https://via.placeholder.com/64",
  specialty: session.mentorHeadline ?? "Mentor",
  hourlyRate: session.ratePerHour,
  sessionPrice: session.sessionPrice,
  topic: session.topic,
  scheduledDate: formatDateLabel(session.sessionDate),
  startTime: session.startTime,
  endTime: session.endTime,
  status: session.status,
});

const INITIAL_SELECTION_BY_MONTH: Partial<Record<string, string>> = {
  "2024-11": "2024-11-05",
  "2024-12": "2024-12-12",
  "2025-01": "2025-01-15",
};

const SAMPLE_SESSIONS: SessionsByDate = {
  "2024-11-05": [
    {
      id: "nov5-1",
      sessionId: 9001,
      isoDate: "2024-11-05",
      name: "Avery Kim",
      avatar: "https://i.pravatar.cc/150?img=28",
      specialty: "Product Manager",
      hourlyRate: 85,
      sessionPrice: 85,
      topic: "Building cross-functional trust",
      scheduledDate: formatDateLabel("2024-11-05"),
      startTime: "09:00",
      endTime: "10:00",
      status: "completed",
    },
    {
      id: "nov5-2",
      sessionId: 9002,
      isoDate: "2024-11-05",
      name: "Liam Carter",
      avatar: "https://i.pravatar.cc/150?img=14",
      specialty: "AI Architect",
      hourlyRate: 110,
      sessionPrice: 110,
      topic: "Evaluating ML roadmaps",
      scheduledDate: formatDateLabel("2024-11-05"),
      startTime: "11:00",
      endTime: "12:00",
      status: "completed",
    },
    {
      id: "nov5-3",
      sessionId: 9003,
      isoDate: "2024-11-05",
      name: "Priya Patel",
      avatar: "https://i.pravatar.cc/150?img=32",
      specialty: "UX Lead",
      hourlyRate: 95,
      sessionPrice: 95,
      topic: "Design critiques that work",
      scheduledDate: formatDateLabel("2024-11-05"),
      startTime: "14:00",
      endTime: "15:00",
      status: "completed",
    },
    {
      id: "nov5-4",
      sessionId: 9004,
      isoDate: "2024-11-05",
      name: "Ethan Moore",
      avatar: "https://i.pravatar.cc/150?img=50",
      specialty: "Startup Advisor",
      hourlyRate: 70,
      sessionPrice: 70,
      topic: "Pivoting early-stage products",
      scheduledDate: formatDateLabel("2024-11-05"),
      startTime: "16:00",
      endTime: "17:00",
      status: "cancelled",
    },
  ],
  "2024-12-12": [
    {
      id: "dec12-1",
      sessionId: 9011,
      isoDate: "2024-12-12",
      name: "Dr. Sarah Chen",
      avatar: "https://i.pravatar.cc/150?img=5",
      specialty: "AI Research Scientist",
      hourlyRate: 80,
      sessionPrice: 80,
      topic: "System Design and Architecture",
      scheduledDate: formatDateLabel("2024-12-12"),
      startTime: "10:00",
      endTime: "11:30",
      status: "accepted",
    },
    {
      id: "dec12-2",
      sessionId: 9012,
      isoDate: "2024-12-12",
      name: "Mark Rodriguez",
      avatar: "https://i.pravatar.cc/150?img=11",
      specialty: "Senior Software Engineer",
      hourlyRate: 90,
      sessionPrice: 90,
      topic: "Machine Learning Career Growth",
      scheduledDate: formatDateLabel("2024-12-12"),
      startTime: "13:00",
      endTime: "14:00",
      status: "accepted",
    },
    {
      id: "dec12-3",
      sessionId: 9013,
      isoDate: "2024-12-12",
      name: "Emily Johnson",
      avatar: "https://i.pravatar.cc/150?img=47",
      specialty: "UX Design Lead",
      hourlyRate: 75,
      sessionPrice: 75,
      topic: "Career Transition to AI Engineering",
      scheduledDate: formatDateLabel("2024-12-12"),
      startTime: "15:00",
      endTime: "16:00",
      status: "payment_required",
    },
    {
      id: "dec12-4",
      sessionId: 9014,
      isoDate: "2024-12-12",
      name: "Noah Williams",
      avatar: "https://i.pravatar.cc/150?img=33",
      specialty: "Cloud Architect",
      hourlyRate: 105,
      sessionPrice: 105,
      topic: "Scaling infra safely",
      scheduledDate: formatDateLabel("2024-12-12"),
      startTime: "17:00",
      endTime: "18:00",
      status: "pending",
    },
  ],
  "2025-01-15": [
    {
      id: "jan15-1",
      sessionId: 9021,
      isoDate: "2025-01-15",
      name: "Anika Rao",
      avatar: "https://i.pravatar.cc/150?img=55",
      specialty: "Data Science Director",
      hourlyRate: 120,
      sessionPrice: 120,
      topic: "Roadmapping analytics orgs",
      scheduledDate: formatDateLabel("2025-01-15"),
      startTime: "08:00",
      endTime: "09:00",
      status: "accepted",
    },
    {
      id: "jan15-2",
      sessionId: 9022,
      isoDate: "2025-01-15",
      name: "Lucas Martin",
      avatar: "https://i.pravatar.cc/150?img=8",
      specialty: "Security Principal",
      hourlyRate: 95,
      sessionPrice: 95,
      topic: "Zero Trust implementations",
      scheduledDate: formatDateLabel("2025-01-15"),
      startTime: "10:30",
      endTime: "12:00",
      status: "accepted",
    },
    {
      id: "jan15-3",
      sessionId: 9023,
      isoDate: "2025-01-15",
      name: "Sofia Alvarez",
      avatar: "https://i.pravatar.cc/150?img=21",
      specialty: "Leadership Coach",
      hourlyRate: 85,
      sessionPrice: 85,
      topic: "Leading through change",
      scheduledDate: formatDateLabel("2025-01-15"),
      startTime: "14:00",
      endTime: "15:00",
      status: "payment_required",
    },
  ],
};

function MenteeDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useMenteeStore((state) => ({
    user: state.user,
    loading: state.loading,
  }));

  const [sessionsByDate, setSessionsByDate] = useState<SessionsByDate>(SAMPLE_SESSIONS);
  const [selectionByMonth, setSelectionByMonth] = useState<Partial<Record<string, string>>>(INITIAL_SELECTION_BY_MONTH);
  const [loadedMonths, setLoadedMonths] = useState<Record<string, boolean>>({});
  const [monthLoading, setMonthLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [currentMonthIndex, setCurrentMonthIndex] = useState(1);
  const currentMonth = MONTHS[currentMonthIndex] ?? MONTHS[0];
  const monthKey = getMonthKey(currentMonth.year, currentMonth.month);
  const isMonthLoaded = loadedMonths[monthKey] ?? false;

  const storedSelection = selectionByMonth[monthKey] ?? null;
  const fallbackSelection = useMemo(
    () => getFirstAvailableDateForMonth(monthKey, sessionsByDate),
    [monthKey, sessionsByDate]
  );
  const selectedDate = storedSelection ?? fallbackSelection;

  const loadMonthSessions = useCallback(
    async (abortSignal: { cancelled: boolean }) => {
      if (user?.role !== "Mentee") return;
      const menteeUser = user;

      setMonthLoading(true);
      setFetchError(null);

      try {
        const response = await menteeApi.getDashboardSessions(menteeUser.user_id, {
          month: currentMonth.month,
          year: currentMonth.year,
        });

        if (abortSignal.cancelled) return;

        const normalizedSessions = response.data.sessions.map(normalizeSession);
        setSessionsByDate((prev) => {
          const next: SessionsByDate = { ...prev };

          Object.keys(next).forEach((dateKey) => {
            if (dateKey.startsWith(monthKey)) {
              next[dateKey] = undefined;
            }
          });

          normalizedSessions.forEach((session) => {
            const existingSessions = next[session.isoDate];
            const bucket = existingSessions ? [...existingSessions] : [];
            const index = bucket.findIndex((item) => item.sessionId === session.sessionId);
            if (index >= 0) {
              bucket[index] = session;
            } else {
              bucket.push(session);
            }
            bucket.sort((a, b) => a.startTime.localeCompare(b.startTime));
            next[session.isoDate] = bucket;
          });

          return next;
        });

        setLoadedMonths((prev) => ({ ...prev, [monthKey]: true }));
      } catch (error) {
        if (abortSignal.cancelled) return;
        setFetchError(error instanceof Error ? error.message : "Unable to load mentee sessions");
      } finally {
        if (!abortSignal.cancelled) {
          setMonthLoading(false);
        }
      }
    },
    [user, currentMonth.month, currentMonth.year, monthKey]
  );

  useEffect(() => {
    if (isMonthLoaded) return;
    const signal = { cancelled: false };
    void loadMonthSessions(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [isMonthLoaded, loadMonthSessions]);

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

  const selectedDateLabel = useMemo(() => formatFullDate(selectedDate), [selectedDate]);

  const sessionsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return sessionsByDate[selectedDate] ?? [];
  }, [selectedDate, sessionsByDate]);

  const groupedSessions = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        status,
        label: STATUS_META[status].label,
        sessions: sessionsForSelectedDate.filter((session) => session.status === status),
      })).filter((group) => group.sessions.length > 0),
    [sessionsForSelectedDate]
  );

  const hasSessions = groupedSessions.length > 0;

  const handleMonthChange = (direction: "prev" | "next") => {
    const newIndex = currentMonthIndex + (direction === "prev" ? -1 : 1);
    if (newIndex < 0 || newIndex >= MONTHS.length) return;
    const nextMonth = MONTHS[newIndex];
    const nextMonthKey = getMonthKey(nextMonth.year, nextMonth.month);
    const nextSelection = selectionByMonth[nextMonthKey] ?? getFirstAvailableDateForMonth(nextMonthKey, sessionsByDate);
    if (nextSelection) {
      setSelectionByMonth((prev) => ({ ...prev, [nextMonthKey]: nextSelection }));
    }
    setCurrentMonthIndex(newIndex);
  };

  const handleDaySelect = (day: number | null) => {
    if (!day) return;
    const iso = `${monthKey}-${pad(day)}`;
    setSelectionByMonth((prev) => ({ ...prev, [monthKey]: iso }));
  };

  const handleJoinMeeting = (session: MentorSession) => {
    console.info("[MenteeDashboard] Join meeting", session.sessionId);
  };

  const handleReschedule = (session: MentorSession) => {
    console.info("[MenteeDashboard] Reschedule session", session.sessionId);
  };

  const handlePayNow = (session: MentorSession) => {
    console.info("[MenteeDashboard] Pay session", session.sessionId);
  };

  const handleReviewCourse = (session: MentorSession) => {
    console.info("[MenteeDashboard] Review session", session.sessionId);
  };

  const handleNewBooking = () => {
    void navigate(path.MENTOR_BROWSE);
  };

  const handleCancelPending = async (session: MentorSession) => {
    if (user?.role !== "Mentee") {
      setFetchError("Please log in to cancel this session.");
      return;
    }

    const menteeUser = user;

    try {
      await menteeApi.cancelSession(menteeUser.user_id, session.sessionId);
      setSessionsByDate((prev) => {
        const daySessions = prev[session.isoDate];
        if (!daySessions) return prev;
        const updatedDaySessions = daySessions.map((item) =>
          item.sessionId === session.sessionId ? { ...item, status: "cancelled" as DashboardSessionStatus } : item
        );
        return { ...prev, [session.isoDate]: updatedDaySessions };
      });
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Could not cancel the session");
    }
  };

  const renderActionButtons = (session: MentorSession) => {
    switch (session.status) {
      case "accepted":
        return (
          <>
            <button
              type='button'
              className='rounded-xl bg-[#1bb17b] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-[#25c487]'
              onClick={() => {
                handleJoinMeeting(session);
              }}
            >
              Join Meeting
            </button>
            <button
              type='button'
              className='rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10'
              onClick={() => {
                handleReschedule(session);
              }}
            >
              Reschedule
            </button>
          </>
        );
      case "payment_required":
        return (
          <>
            <button
              type='button'
              className='rounded-xl bg-[#fbbf24] px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-800/30 transition hover:bg-[#facc15]'
              onClick={() => {
                handlePayNow(session);
              }}
            >
              Pay Now
            </button>
            <button
              type='button'
              className='rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10'
              onClick={() => {
                handleReschedule(session);
              }}
            >
              Reschedule
            </button>
          </>
        );
      case "pending":
        return (
          <button
            type='button'
            className='rounded-xl border border-rose-400/60 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10'
            onClick={() => {
              void handleCancelPending(session);
            }}
          >
            Cancel
          </button>
        );
      case "completed":
        return (
          <>
            <button
              type='button'
              className='rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10'
              onClick={() => {
                handleReviewCourse(session);
              }}
            >
              Review Course
            </button>
            <button
              type='button'
              className='rounded-xl bg-[#8b3ffc] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:bg-[#9b54ff]'
              onClick={handleNewBooking}
            >
              New booking
            </button>
          </>
        );
      case "cancelled":
        return (
          <button
            type='button'
            className='rounded-xl bg-[#8b3ffc] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:bg-[#9b54ff]'
            onClick={handleNewBooking}
          >
            New booking
          </button>
        );
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center bg-[#050915] text-white'>
        Preparing your dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#050915] px-4 text-center text-white'>
        <p className='text-lg font-semibold'>Please log in to view your mentee dashboard.</p>
        <button
          type='button'
          className='rounded-full bg-[#8b3ffc] px-6 py-3 font-semibold shadow-lg shadow-purple-900/50 transition hover:bg-[#9b54ff]'
          onClick={() => {
            void navigate(path.LOGIN);
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (user.role !== "Mentee") {
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#050915] px-4 text-center text-white'>
        <p className='text-lg font-semibold'>This page is available for mentee accounts only.</p>
        <button
          type='button'
          className='rounded-full border border-white/30 px-6 py-3 font-semibold transition hover:bg-white/10'
          onClick={() => {
            void navigate(path.HOME);
          }}
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className='min-h-[calc(100vh-160px)] bg-[#050915] px-4 py-10 text-white'>
      <div className='mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row'>
        <section className='flex-1 space-y-8'>
          <header className='space-y-2'>
            <h1 className='text-3xl font-semibold'>MenteeDashboard</h1>
            <p className='text-sm text-white/70'>Manage your mentoring sessions and requests</p>
            <p className='text-xs tracking-wider text-white/50 uppercase'>Schedule for {selectedDateLabel}</p>
          </header>

          {fetchError && (
            <div className='rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100'>
              {fetchError}
            </div>
          )}

          {monthLoading && !isMonthLoaded && (
            <div className='rounded-2xl border border-white/5 bg-[#0b1120] px-4 py-3 text-sm text-white/70'>
              Loading your schedule for {monthLabel}...
            </div>
          )}

          {hasSessions ? (
            groupedSessions.map((group) => (
              <article
                key={group.status}
                className='rounded-3xl border border-white/5 bg-[#0b1120] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)]'
              >
                <div className='mb-4 flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <span className={`h-2.5 w-2.5 rounded-full ${STATUS_META[group.status].accentClass}`} />
                    <h2 className='text-lg font-semibold'>{group.label}</h2>
                  </div>
                  <span className='flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-semibold'>
                    {group.sessions.length}
                  </span>
                </div>

                <div className='space-y-4'>
                  {group.sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      className='rounded-2xl border border-white/5 bg-[#0f1d33] p-5 transition hover:border-white/15'
                    >
                      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                        <div className='flex items-center gap-4'>
                          <img
                            src={session.avatar}
                            alt={session.name}
                            className='h-16 w-16 rounded-full border-2 border-[#1ba0e2] object-cover'
                          />
                          <div>
                            <h3 className='text-lg font-semibold'>{session.name}</h3>
                            <p className='text-sm text-white/70'>{session.specialty}</p>
                            <p className='text-sm font-semibold text-[#1ba0e2]'>${session.hourlyRate}/hour</p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-semibold ${STATUS_META[session.status].badgeClass}`}
                        >
                          {STATUS_META[session.status].label}
                        </span>
                      </div>

                      <div className='mt-4 rounded-xl border border-white/5 bg-white/5 px-4 py-3'>
                        <p className='text-xs tracking-wide text-white/50 uppercase'>Topic</p>
                        <p className='text-base font-semibold text-[#8bcbff]'>{session.topic}</p>
                      </div>

                      <div className='mt-4 flex flex-wrap items-center justify-between gap-4'>
                        <div className='space-y-2 text-sm text-white/70'>
                          <div className='flex items-center gap-2'>
                            <span role='img' aria-label='calendar'>
                              📅
                            </span>
                            <span>{session.scheduledDate}</span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <span role='img' aria-label='time'>
                              🕑
                            </span>
                            <span>{formatTimeRange(session.startTime, session.endTime)}</span>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-xs tracking-wide text-white/50 uppercase'>Compensation</p>
                          <p className='text-xl font-semibold text-[#1ba0e2]'>${session.sessionPrice.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className='mt-4 flex flex-wrap gap-3'>{renderActionButtons(session)}</div>
                    </div>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <div className='rounded-3xl border border-white/5 bg-[#0c1323] px-8 py-14 text-center shadow-[0_25px_60px_rgba(0,0,0,0.45)]'>
              <div className='mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-[#2e0b4d] text-[#c084fc]'>
                <CalendarDays size={48} strokeWidth={1.2} />
              </div>
              <h2 className='text-2xl font-semibold'>Your schedule is empty</h2>
              <p className='mt-2 text-base text-white/70'>There are no appointments scheduled</p>
              <button
                type='button'
                className='mt-8 w-full rounded-full bg-[#8b3ffc] px-6 py-3 text-base font-semibold shadow-lg shadow-purple-900/50 transition hover:bg-[#9b54ff]'
                onClick={handleNewBooking}
              >
                Book a mentor
              </button>
            </div>
          )}
        </section>

        <aside className='w-full max-w-sm self-start rounded-3xl border border-white/5 bg-[#0b1120] p-6 text-sm shadow-[0_25px_60px_rgba(0,0,0,0.45)]'>
          <div className='mb-6 flex items-center justify-between'>
            <div>
              <p className='text-lg font-semibold'>{monthLabel}</p>
              <p className='text-xs tracking-wide text-white/50 uppercase'>Select a date</p>
            </div>
            <div className='flex gap-2 text-white/60'>
              <button
                type='button'
                className='rounded-full border border-white/10 p-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40'
                aria-label='Previous month'
                disabled={currentMonthIndex === 0}
                onClick={() => {
                  handleMonthChange("prev");
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type='button'
                className='rounded-full border border-white/10 p-2 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40'
                aria-label='Next month'
                disabled={currentMonthIndex === MONTHS.length - 1}
                onClick={() => {
                  handleMonthChange("next");
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className='grid grid-cols-7 gap-1 text-center text-xs tracking-wide text-white/50 uppercase'>
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className='py-2'>
                {label}
              </span>
            ))}
          </div>

          <div className='mt-1 space-y-2'>
            {calendarWeeks.map((week, weekIndex) => (
              <div key={`week-${String(weekIndex)}`} className='grid grid-cols-7 gap-1'>
                {week.map((day, idx) => {
                  if (!day) {
                    return <span key={`empty-${String(weekIndex)}-${String(idx)}`} className='h-10 rounded-xl' />;
                  }

                  const iso = `${monthKey}-${pad(day)}`;
                  const isSelected = iso === selectedDate;
                  const dayHasSessions = (sessionsByDate[iso]?.length ?? 0) > 0;

                  const buttonClass = isSelected
                    ? "bg-[#8b3ffc] text-white shadow-lg shadow-purple-900/50"
                    : dayHasSessions
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "text-white/60 hover:bg-white/10";

                  return (
                    <button
                      key={iso}
                      type='button'
                      className={`relative h-10 rounded-xl text-sm font-medium transition ${buttonClass}`}
                      onClick={() => {
                        handleDaySelect(day);
                      }}
                    >
                      {day}
                      {dayHasSessions && (
                        <span className='absolute inset-x-0 bottom-1 mx-auto h-1.5 w-1.5 rounded-full bg-[#8b3ffc]' />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MenteeDashboard;
