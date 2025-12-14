import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";

export default function RatingFilter() {
  const { minRating, setMinRating } = useSearchStore();
  const [isOpen, setIsOpen] = useState(false);

  const ratings = [
    { value: 5, label: "5 Stars" },
    { value: 4.5, label: "4.5+ Stars" },
    { value: 4, label: "4+ Stars" },
    { value: 3.5, label: "3.5+ Stars" },
    { value: 3, label: "3+ Stars" },
  ];

  const handleSelect = (rating: number) => {
    setMinRating(minRating === rating ? undefined : rating);
    setIsOpen(false);
  };

  const handleClear = () => {
    setMinRating(undefined);
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-center gap-2 rounded-full px-3 py-1 text-gray-300 transition-colors ${
          minRating !== undefined ? "bg-purple-600 text-white" : "bg-gray-700 hover:bg-gray-600"
        }`}
      >
        Rating <ChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
              <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
              <h3 className='font-semibold text-white'>Minimum Rating</h3>
            </div>

            <div className='space-y-1'>
              {ratings.map((rating) => (
                <button
                  key={rating.value}
                  onClick={() => {
                    handleSelect(rating.value);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    minRating === rating.value
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                  <span>{rating.label}</span>
                </button>
              ))}
            </div>

            {minRating !== undefined && (
              <button
                onClick={handleClear}
                className='mt-2 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-600'
              >
                Clear Rating
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
