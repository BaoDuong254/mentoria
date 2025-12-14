import { ChevronDown, Briefcase } from "lucide-react";
import { useState } from "react";
import { useSearchStore } from "@/store/useSearchStore";

export default function ExperienceLevelFilter() {
  const { experienceLevel, setExperienceLevel } = useSearchStore();
  const [isOpen, setIsOpen] = useState(false);

  const levels = [
    { value: "junior", label: "Junior (0-2 years)" },
    { value: "mid", label: "Mid-level (3-5 years)" },
    { value: "senior", label: "Senior (6-10 years)" },
    { value: "expert", label: "Expert (10+ years)" },
  ];

  const handleSelect = (level: string) => {
    setExperienceLevel(experienceLevel === level ? undefined : level);
    setIsOpen(false);
  };

  const handleClear = () => {
    setExperienceLevel(undefined);
    setIsOpen(false);
  };

  return (
    <div className='relative'>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-center gap-2 rounded-full px-3 py-1 text-gray-300 transition-colors ${
          experienceLevel !== undefined ? "bg-purple-600 text-white" : "bg-gray-700 hover:bg-gray-600"
        }`}
      >
        Experience Level <ChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
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
              <Briefcase className='h-5 w-5 text-purple-400' />
              <h3 className='font-semibold text-white'>Experience Level</h3>
            </div>
            <p className='mb-2 text-xs text-gray-400'>(Coming soon - not filtering yet)</p>

            <div className='space-y-1'>
              {levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => {
                    handleSelect(level.value);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    experienceLevel === level.value
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <span>{level.label}</span>
                </button>
              ))}
            </div>

            {experienceLevel !== undefined && (
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
