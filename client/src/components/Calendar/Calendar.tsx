import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  meetingDates?: string[]; // Array of dates with meetings (YYYY-MM-DD format)
  variant?: "mentee" | "mentor"; // Different styles for mentee and mentor dashboards
}

export default function Calendar({ selectedDate, onDateChange, meetingDates = [], variant = "mentee" }: CalendarProps) {
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames =
    variant === "mentor" ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : ["S", "M", "T", "W", "T", "F", "S"];

  const handlePrevMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    onDateChange(newDate);
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateChange(newDate);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  const hasMeeting = (day: number) => {
    const dateStr = `${String(currentYear)}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return meetingDates.includes(dateStr);
  };

  const isPast = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentYear, currentMonth, day);
    return checkDate < today;
  };

  // Generate calendar days
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Today indicator color based on variant
  const todayColor = variant === "mentor" ? "bg-green-600 text-white" : "bg-cyan-700 text-white";

  return (
    <div className='rounded-xl bg-gray-800 p-6 outline-1 outline-gray-700'>
      {/* Header */}
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-base font-semibold text-white'>
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <div className='flex items-center gap-2'>
          <button onClick={handlePrevMonth} className='p-1 text-gray-400 transition-colors hover:text-white'>
            <ChevronLeft className='h-4 w-4' />
          </button>
          <button onClick={handleNextMonth} className='p-1 text-gray-400 transition-colors hover:text-white'>
            <ChevronRight className='h-4 w-4' />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className='mb-2 grid grid-cols-7 gap-1'>
        {dayNames.map((day, index) => (
          <div key={index} className='py-2 text-center text-sm font-medium text-gray-500'>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className='grid grid-cols-7 gap-1'>
        {days.map((day, index) => (
          <div key={index} className='flex aspect-square items-center justify-center'>
            {day && (
              <button
                onClick={() => {
                  handleDateClick(day);
                }}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${isSelected(day) ? "bg-purple-800 text-white" : ""} ${isToday(day) && !isSelected(day) ? todayColor : ""} ${!isSelected(day) && !isToday(day) && hasMeeting(day) ? "text-purple-400" : ""} ${!isSelected(day) && !isToday(day) && !hasMeeting(day) && isPast(day) ? "text-gray-600" : ""} ${!isSelected(day) && !isToday(day) && !hasMeeting(day) && !isPast(day) ? "text-gray-400 hover:bg-gray-700" : ""} `}
              >
                {day}
                {hasMeeting(day) && !isSelected(day) && (
                  <span className='absolute bottom-0.5 h-1 w-1 rounded-full bg-purple-500' />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
