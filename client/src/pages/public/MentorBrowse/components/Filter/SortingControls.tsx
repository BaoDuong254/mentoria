import { useState } from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";

export default function SortingControls() {
  const { sortColumn, sortDirection, setSorting } = useSearchStore();
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: "average_rating", label: "Rating" },
    { value: "total_reviews", label: "Reviews" },
    { value: "lowest_plan_price", label: "Price" },
    { value: "first_name", label: "Name" },
  ];

  const currentOption = sortOptions.find((opt) => opt.value === sortColumn) ?? sortOptions[0];

  const handleSortChange = (value: string) => {
    setSorting(value, sortDirection);
    setIsOpen(false);
  };

  const toggleDirection = () => {
    setSorting(sortColumn, sortDirection === "ASC" ? "DESC" : "ASC");
  };

  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm text-gray-300'>Sort by:</span>

      <div className='relative'>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className='flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-600'
        >
          {currentOption.label}
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <>
            <div
              className='fixed inset-0 z-10'
              onClick={() => {
                setIsOpen(false);
              }}
            />
            <div className='absolute top-full right-0 z-20 mt-2 w-40 rounded-lg border border-gray-700 bg-gray-800 p-2 shadow-xl'>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    handleSortChange(option.value);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    sortColumn === option.value ? "bg-purple-600 text-white" : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={toggleDirection}
        className='rounded-lg border border-gray-600 bg-gray-700 p-2 text-white transition-colors hover:bg-gray-600'
        title={sortDirection === "ASC" ? "Ascending" : "Descending"}
      >
        <ArrowUpDown className={`h-4 w-4 ${sortDirection === "DESC" ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
