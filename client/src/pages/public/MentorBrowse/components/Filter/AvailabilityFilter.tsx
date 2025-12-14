import { ChevronDown, Clock } from "lucide-react";
import { useState } from "react";
import { useSearchStore } from "@/store/useSearchStore";

export default function AvailabilityFilter() {
  const { availability, setAvailability } = useSearchStore();
  const [isOpen, setIsOpen] = useState(false);

  const availabilityOptions = [
    { value: "available_now", label: "Available Now" },
    { value: "within_24h", label: "Within 24 Hours" },
    { value: "within_week", label: "Within This Week" },
    { value: "has_slots", label: "Has Available Slots" },
  ];

  const handleSelect = (value: string) => {
    setAvailability(availability === value ? undefined : value);
    setIsOpen(false);
  };

  const handleClear = () => {
    setAvailability(undefined);
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-center gap-2 rounded-full px-3 py-1 text-gray-300 transition-colors ${
          availability !== undefined ? "bg-purple-600 text-white" : "bg-gray-700 hover:bg-gray-600"
        }`}
      >
        Availability <ChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-10'
            onClick={() => {
              setIsOpen(false);
            }}
          />
          <div className='absolute top-full left-0 z-20 mt-2 w-56 rounded-lg border border-gray-700 bg-gray-800 p-3 shadow-xl'>
            <div className='mb-2 flex items-center gap-2'>
              <Clock className='h-5 w-5 text-purple-400' />
              <h3 className='font-semibold text-white'>Availability</h3>
            </div>
            <p className='mb-2 text-xs text-gray-400'>(Coming soon - not filtering yet)</p>

            <div className='space-y-1'>
              {availabilityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleSelect(option.value);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    availability === option.value
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>

            {availability !== undefined && (
              <button
                onClick={handleClear}
                className='mt-2 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-600'
              >
                Clear Filter
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
