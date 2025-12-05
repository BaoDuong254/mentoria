import { useState, useMemo } from "react";
import { Clock } from "lucide-react";

interface TimeInputProps {
  value: string; // HH:mm format (24h)
  onChange: (value: string) => void;
  className?: string;
}

export default function TimeInput({ value, onChange, className = "" }: TimeInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Parse value to get hour, minute, period
  const { selectedHour, selectedMinute, selectedPeriod } = useMemo(() => {
    if (!value) {
      return { selectedHour: "12", selectedMinute: "00", selectedPeriod: "AM" as const };
    }
    const [hours, minutes] = value.split(":").map(Number);
    const period = hours >= 12 ? ("PM" as const) : ("AM" as const);
    const hour12 = hours % 12 || 12;
    return {
      selectedHour: String(hour12).padStart(2, "0"),
      selectedMinute: String(minutes).padStart(2, "0"),
      selectedPeriod: period,
    };
  }, [value]);

  // Convert to 24h format and call onChange
  const updateValue = (hour: string, minute: string, period: "AM" | "PM") => {
    let hour24 = parseInt(hour);
    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    const newValue = `${String(hour24).padStart(2, "0")}:${minute}`;
    onChange(newValue);
  };

  const handleHourChange = (hour: string) => {
    updateValue(hour, selectedMinute, selectedPeriod);
  };

  const handleMinuteChange = (minute: string) => {
    updateValue(selectedHour, minute, selectedPeriod);
  };

  const handlePeriodChange = (period: "AM" | "PM") => {
    updateValue(selectedHour, selectedMinute, period);
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

  const displayValue = value ? `${selectedHour}:${selectedMinute} ${selectedPeriod}` : "--:-- --";

  // Custom scrollbar hide styles
  const scrollContainerClass =
    "max-h-32 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

  return (
    <div className='relative'>
      <button
        type='button'
        onClick={() => {
          setShowDropdown(!showDropdown);
        }}
        className={`flex w-full items-center justify-between rounded bg-gray-700 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-purple-500 ${className}`}
      >
        <span>{displayValue}</span>
        <Clock className='h-4 w-4 text-white' />
      </button>

      {showDropdown && (
        <div className='absolute top-full left-0 z-50 mt-1 w-full rounded bg-gray-800 p-3 shadow-lg ring-1 ring-gray-600'>
          <div className='flex gap-2'>
            {/* Hours */}
            <div className='flex-1'>
              <div className='mb-1 text-center text-xs text-gray-400'>Hour</div>
              <div className={scrollContainerClass}>
                {hours.map((h) => (
                  <button
                    key={h}
                    type='button'
                    onClick={() => {
                      handleHourChange(h);
                    }}
                    className={`w-full rounded px-2 py-1 text-center text-sm transition-colors ${selectedHour === h ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-purple-600/50"}`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className='flex-1'>
              <div className='mb-1 text-center text-xs text-gray-400'>Min</div>
              <div className={scrollContainerClass}>
                {minutes.map((m) => (
                  <button
                    key={m}
                    type='button'
                    onClick={() => {
                      handleMinuteChange(m);
                    }}
                    className={`w-full rounded px-2 py-1 text-center text-sm transition-colors ${selectedMinute === m ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-purple-600/50"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* AM/PM */}
            <div className='flex-1'>
              <div className='mb-1 text-center text-xs text-gray-400'>Period</div>
              <div className='space-y-1'>
                {(["AM", "PM"] as const).map((p) => (
                  <button
                    key={p}
                    type='button'
                    onClick={() => {
                      handlePeriodChange(p);
                    }}
                    className={`w-full rounded px-2 py-1 text-center text-sm transition-colors ${selectedPeriod === p ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-purple-600/50"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Done button */}
          <button
            type='button'
            onClick={() => {
              setShowDropdown(false);
            }}
            className='mt-3 w-full rounded bg-purple-600 py-1.5 text-sm text-white transition-colors hover:bg-purple-500'
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
