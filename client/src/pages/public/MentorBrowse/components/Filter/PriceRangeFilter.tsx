import { useState } from "react";
import { ChevronDown, DollarSign } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";

export default function PriceRangeFilter() {
  const { minPrice, maxPrice, setPriceRange } = useSearchStore();
  const [isOpen, setIsOpen] = useState(false);
  const [localMin, setLocalMin] = useState<string>(minPrice !== undefined ? String(minPrice) : "");
  const [localMax, setLocalMax] = useState<string>(maxPrice !== undefined ? String(maxPrice) : "");

  const handleApply = () => {
    const min = localMin.trim() !== "" && !Number.isNaN(Number(localMin)) ? Number(localMin) : undefined;
    const max = localMax.trim() !== "" && !Number.isNaN(Number(localMax)) ? Number(localMax) : undefined;
    setPriceRange(min, max);
    setIsOpen(false);
  };

  const handleClear = () => {
    setLocalMin("");
    setLocalMax("");
    setPriceRange(undefined, undefined);
  };

  const hasValue = minPrice !== undefined || maxPrice !== undefined;

  return (
    <div className='relative'>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-center gap-2 rounded-full px-3 py-1 text-gray-300 transition-colors ${
          hasValue ? "bg-purple-600 text-white" : "bg-gray-700 hover:bg-gray-600"
        }`}
      >
        Price Range <ChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-10'
            onClick={() => {
              setIsOpen(false);
            }}
          />
          <div className='absolute top-full left-0 z-20 mt-2 w-72 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-xl'>
            <div className='mb-3 flex items-center gap-2'>
              <DollarSign className='h-5 w-5 text-purple-400' />
              <h3 className='font-semibold text-white'>Price Range</h3>
            </div>

            <div className='flex gap-3'>
              <div className='flex-1'>
                <label className='mb-1 block text-xs text-gray-400'>Min ($)</label>
                <input
                  type='number'
                  min='0'
                  placeholder='0'
                  value={localMin}
                  onChange={(e) => {
                    setLocalMin(e.target.value);
                  }}
                  className='w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                />
              </div>
              <div className='flex-1'>
                <label className='mb-1 block text-xs text-gray-400'>Max ($)</label>
                <input
                  type='number'
                  min='0'
                  placeholder='Any'
                  value={localMax}
                  onChange={(e) => {
                    setLocalMax(e.target.value);
                  }}
                  className='w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none'
                />
              </div>
            </div>

            <div className='mt-4 flex gap-2'>
              <button
                onClick={handleClear}
                className='flex-1 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-600'
              >
                Clear
              </button>
              <button
                onClick={handleApply}
                className='flex-1 rounded-lg bg-purple-600 px-3 py-2 text-sm text-white transition-colors hover:bg-purple-700'
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
