//ver1
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import path from "@/constants/path";

type SessionStatus = "accepted" | "payment_required" | "pending" | "completed" | "cancelled";

interface MentorSession {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  hourlyRate: number;
  topic: string;
  scheduledDate: string;
  scheduledTime: string;
  status: SessionStatus;
}

type SessionsByDate = Record<string, MentorSession[]>;

interface MonthConfig {
  month: number; // 1-12
  year: number;
}

const MONTHS: MonthConfig[] = [
  { month: 11, year: 2024 },
  { month: 12, year: 2024 },
  { month: 1, year: 2025 },
];

const initialSessionsByDate: SessionsByDate = {
  "2024-11-05": [
    {
      id: "nov5-1",
      name: "Avery Kim",
      avatar: "https://i.pravatar.cc/150?img=28",
      specialty: "Product Manager",
      hourlyRate: 85,
      topic: "Building cross-functional trust",
      scheduledDate: "Nov 5, 2024",
      scheduledTime: "9:00 AM - 10:00 AM",
      status: "completed",
    },
    {
      id: "nov5-2",
      name: "Liam Carter",
      avatar: "https://i.pravatar.cc/150?img=14",
      specialty: "AI Architect",
      hourlyRate: 110,
      topic: "Evaluating ML roadmaps",
      scheduledDate: "Nov 5, 2024",
      scheduledTime: "11:00 AM - 12:00 PM",
      status: "completed",
    },
    {
      id: "nov5-3",
      name: "Priya Patel",
      avatar: "https://i.pravatar.cc/150?img=32",
      specialty: "UX Lead",
      hourlyRate: 95,
      topic: "Design critiques that work",
      scheduledDate: "Nov 5, 2024",
      scheduledTime: "2:00 PM - 3:00 PM",
      status: "completed",
    },
    {
      id: "nov5-4",
      name: "Ethan Moore",
      avatar: "https://i.pravatar.cc/150?img=50",
      specialty: "Startup Advisor",
      hourlyRate: 70,
      topic: "Pivoting early-stage products",
      scheduledDate: "Nov 5, 2024",
      scheduledTime: "4:00 PM - 5:00 PM",
      status: "cancelled",
    },
  ],
  "2024-12-12": [
    {
      id: "dec12-1",
      name: "Dr. Sarah Chen",
      avatar: "https://i.pravatar.cc/150?img=5",
      specialty: "AI Research Scientist",
      hourlyRate: 80,
      topic: "System Design and Architecture",
      scheduledDate: "Dec 12, 2024",
      scheduledTime: "10:00 AM - 11:30 AM",
      status: "accepted",
    },
    {
      id: "dec12-2",
      name: "Mark Rodriguez",
      avatar: "https://i.pravatar.cc/150?img=11",
      specialty: "Senior Software Engineer",
      hourlyRate: 90,
      topic: "Machine Learning Career Growth",
      scheduledDate: "Dec 12, 2024",
      scheduledTime: "1:00 PM - 2:00 PM",
      status: "accepted",
    },
    {
      id: "dec12-3",
      name: "Emily Johnson",
      avatar: "https://i.pravatar.cc/150?img=47",
      specialty: "UX Design Lead",
      hourlyRate: 75,
      topic: "Career Transition to AI Engineering",
      scheduledDate: "Dec 12, 2024",
      scheduledTime: "3:00 PM - 4:00 PM",
      status: "payment_required",
    },
    {
      id: "dec12-4",
      name: "Noah Williams",
      avatar: "https://i.pravatar.cc/150?img=33",
      specialty: "Cloud Architect",
      hourlyRate: 105,
      topic: "Scaling infra safely",
      scheduledDate: "Dec 12, 2024",
      scheduledTime: "5:00 PM - 6:00 PM",
      status: "pending",
    },
  ],
  "2025-01-15": [
    {
      id: "jan15-1",
      name: "Anika Rao",
      avatar: "https://i.pravatar.cc/150?img=55",
      specialty: "Data Science Director",
      hourlyRate: 120,
      topic: "Roadmapping analytics orgs",
      scheduledDate: "Jan 15, 2025",
      scheduledTime: "8:00 AM - 9:00 AM",
      status: "accepted",
    },
    {
      id: "jan15-2",
      name: "Lucas Martin",
      avatar: "https://i.pravatar.cc/150?img=8",
      specialty: "Security Principal",
      hourlyRate: 95,
      topic: "Zero Trust implementations",
      scheduledDate: "Jan 15, 2025",
      scheduledTime: "10:30 AM - 12:00 PM",
      status: "accepted",
    },
    {
      id: "jan15-3",
      name: "Sofia Alvarez",
      avatar: "https://i.pravatar.cc/150?img=21",
      specialty: "Leadership Coach",
      hourlyRate: 85,
      topic: "Leading through change",
      scheduledDate: "Jan 15, 2025",
      scheduledTime: "2:00 PM - 3:00 PM",
      status: "payment_required",
    },
  ],
};

const initialSelectionByMonth: Record<string, string> = {
  "2024-11": "2024-11-05",
  "2024-12": "2024-12-12",
  "2025-01": "2025-01-15",
};

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const STATUS_ORDER: SessionStatus[] = ["accepted", "payment_required", "pending", "completed", "cancelled"];

const STATUS_META: Record<
  SessionStatus,
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

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function getMonthKey(year: number, month: number) {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${year}-${pad(month)}`;
}

function formatFullDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function buildCalendarMatrix(year: number, month: number) {
  const firstDayIndex = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks: (number | null)[][] = [];
  let currentWeek: (number | null)[] = [];

  for (let i = 0; i < firstDayIndex; i += 1) {
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
}

function MenteeDashboard() {
  const navigate = useNavigate();
  const [sessionsByDate, setSessionsByDate] = useState<SessionsByDate>(initialSessionsByDate);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(1);
  const [selectedDate, setSelectedDate] = useState("2024-12-12");
  const [selectionByMonth, setSelectionByMonth] = useState<Record<string, string>>(initialSelectionByMonth);

  const currentMonth = MONTHS[currentMonthIndex];
  const monthKey = getMonthKey(currentMonth.year, currentMonth.month);

  const calendarWeeks = useMemo(
    () => buildCalendarMatrix(currentMonth.year, currentMonth.month),
    [currentMonth.year, currentMonth.month]
  );

  const selectedDateLabel = useMemo(() => formatFullDate(selectedDate), [selectedDate]);

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
        new Date(currentMonth.year, currentMonth.month - 1)
      ),
    [currentMonth.year, currentMonth.month]
  );

  const groupedSessions = useMemo(() => {
    const sessionsForSelectedDate = sessionsByDate[selectedDate] ?? [];
    return STATUS_ORDER.map((status) => ({
      status,
      label: STATUS_META[status].label,
      sessions: sessionsForSelectedDate.filter((session) => session.status === status),
    })).filter((group) => group.sessions.length > 0);
  }, [sessionsByDate, selectedDate]);

  const hasSessions = groupedSessions.length > 0;

  const setSelectedDateForMonth = (iso: string) => {
    setSelectedDate(iso);
    setSelectionByMonth((prev) => ({ ...prev, [iso.slice(0, 7)]: iso }));
  };

  const getFirstAvailableDateForMonth = (targetMonthKey: string) => {
    const sortedDates = Object.keys(sessionsByDate)
      .filter((date) => date.startsWith(targetMonthKey) && sessionsByDate[date].length > 0)
      .sort();
    return sortedDates[0] ?? `${targetMonthKey}-01`;
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    const newIndex = currentMonthIndex + (direction === "prev" ? -1 : 1);
    if (newIndex < 0 || newIndex >= MONTHS.length) return;
    const nextMonth = MONTHS[newIndex];
    const nextMonthKey = getMonthKey(nextMonth.year, nextMonth.month);
    const storedSelection = selectionByMonth[nextMonthKey] ?? getFirstAvailableDateForMonth(nextMonthKey);
    setCurrentMonthIndex(newIndex);
    setSelectedDateForMonth(storedSelection);
  };

  const handleDaySelect = (day: number | null) => {
    if (!day) return;
    const iso = `${monthKey}-${pad(day)}`;
    setSelectedDateForMonth(iso);
  };

  const handleJoinMeeting = (sessionId: string) => {
    console.info("[MenteeDashboard] Join meeting:", sessionId);
  };

  const handleReschedule = (sessionId: string) => {
    console.info("[MenteeDashboard] Reschedule session:", sessionId);
  };

  const handlePayNow = (sessionId: string) => {
    console.info("[MenteeDashboard] Pay now for session:", sessionId);
  };

  const handleReviewCourse = (sessionId: string) => {
    console.info("[MenteeDashboard] Review course for session:", sessionId);
  };

  const handleNewBooking = () => {
    void navigate(path.MENTOR_BROWSE);
  };

  const handleCancelPending = (sessionId: string, dateKey: string) => {
    setSessionsByDate((prev) => {
      const daySessions = prev[dateKey] ?? [];
      const updatedDaySessions = daySessions.map((session) =>
        session.id === sessionId ? { ...session, status: "cancelled" as SessionStatus } : session
      );
      return { ...prev, [dateKey]: updatedDaySessions };
    });
  };

  const renderActionButtons = (session: MentorSession) => {
    switch (session.status) {
      case "accepted":
        return (
          <>
            <button
              type='button'
              className='cursor-pointer rounded-xl bg-[#1bb17b] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-[#25c487]'
              onClick={() => {
                handleJoinMeeting(session.id);
              }}
            >
              Join Meeting
            </button>
            <button
              type='button'
              className='cursor-pointer rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10'
              onClick={() => {
                handleReschedule(session.id);
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
              className='cursor-pointer rounded-xl bg-[#fbbf24] px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-800/30 transition hover:bg-[#facc15]'
              onClick={() => {
                handlePayNow(session.id);
              }}
            >
              Pay Now
            </button>
            <button
              type='button'
              className='cursor-pointer rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10'
              onClick={() => {
                handleReschedule(session.id);
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
            className='cursor-pointer rounded-xl border border-rose-400/60 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10'
            onClick={() => {
              handleCancelPending(session.id, selectedDate);
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
              className='cursor-pointer rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10'
              onClick={() => {
                handleReviewCourse(session.id);
              }}
            >
              Review Course
            </button>
            <button
              type='button'
              className='cursor-pointer rounded-xl bg-[#8b3ffc] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:bg-[#9b54ff]'
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
            className='cursor-pointer rounded-xl bg-[#8b3ffc] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:bg-[#9b54ff]'
            onClick={handleNewBooking}
          >
            New booking
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className='min-h-[calc(100vh-160px)] bg-[#050915] px-4 py-10 text-white'>
      <div className='mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row'>
        <section className='flex-1 space-y-8'>
          <header className='space-y-2'>
            <h1 className='text-3xl font-semibold'>MenteeDashboard</h1>
            <p className='text-sm text-white/70'>Manage your mentoring sessions and requests</p>
            <p className='text-xs tracking-wider text-white/50 uppercase'>Schedule for {selectedDateLabel}</p>
          </header>

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
                      key={session.id}
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
                            <span>{session.scheduledTime}</span>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-xs tracking-wide text-white/50 uppercase'>Compensation</p>
                          <p className='text-xl font-semibold text-[#1ba0e2]'>${session.hourlyRate}</p>
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
                className='mt-8 w-full cursor-pointer rounded-full bg-[#8b3ffc] px-6 py-3 text-base font-semibold shadow-lg shadow-purple-900/50 transition hover:bg-[#9b54ff]'
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
              <div key={`week-${weekIndex.toString()}`} className='grid grid-cols-7 gap-1'>
                {week.map((day, idx) => {
                  if (!day) {
                    return <span key={`empty-${weekIndex.toString()}-${idx.toString()}`} className='h-10 rounded-xl' />;
                  }

                  const iso = `${monthKey}-${pad(day)}`;
                  const isSelected = iso === selectedDate;
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  const dayHasSessions = (sessionsByDate[iso] || []).length > 0;

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
