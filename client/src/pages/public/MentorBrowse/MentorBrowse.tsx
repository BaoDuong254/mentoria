import Filter from "./components/Filter";
import Card from "./components/Card";
import { Search } from "lucide-react";
import SkillsFilter from "./components/SkillsFilter";
import JobTitlesFilter from "./components/JobTitlesFilter";
import CompaniesFilter from "./components/CompaniesFilter";
import { useSearchStore } from "@/store/useSearchStore";
import { useEffect } from "react";
function MentorBrowse() {
  const { mentors, fetchMentors, isFetchingMentors, fetchInitialFilterData } = useSearchStore();

  useEffect(() => {
    void fetchInitialFilterData();
    void fetchMentors(1, 10);
  }, []);
  return (
    <>
      <div className='flex w-full justify-center bg-(--secondary)'>
        <div className='my-20 flex w-10/12 justify-between text-white'>
          {/* Search Box */}
          <div className='flex w-1/4 flex-col gap-10'>
            <SkillsFilter />
            <JobTitlesFilter />
            <CompaniesFilter />
          </div>
          {/* The right side */}
          <div className='flex w-3/4 flex-col'>
            {/* Filter and Search Input */}
            <div className='flex flex-col gap-5'>
              <div>
                <h2 className='text-[36px] font-bold'>Find Your Perfect Mentor</h2>
                <p className='mt-2 text-gray-300'>Browse through our curated list of expert mentors</p>
              </div>
              <div className='flex flex-col gap-2'>
                <p className='text-sm text-gray-300'>Looking for</p>
                <div className='flex w-2/3 gap-2'>
                  <div className='flex flex-1 items-center rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-300 focus-within:border-purple-500'>
                    <input
                      type='text'
                      placeholder='e.g. AI Engineer, Software Engineer'
                      className='flex-1 bg-transparent placeholder-gray-500 outline-none'
                    />

                    <Search className='h-5 w-5 text-gray-300' />
                  </div>
                  <button className='cursor-pointer rounded-lg bg-(--primary) px-4 py-2 hover:bg-purple-600'>
                    Search
                  </button>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Filter filterName='Experience Level' />
                <Filter filterName='Price Range' />
                <Filter filterName='Rating' />
                <Filter filterName='Availability' />
                <p className='cursor-pointer text-(--green)'>Reset All</p>
              </div>
              <div>
                <h2 className='text-2xl font-bold'>{mentors.length} Mentors Available for Mentoring</h2>
              </div>
            </div>
            {/* List of mentor card */}
            <div>
              {isFetchingMentors ? (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className='h-[380px] w-full animate-pulse rounded-xl border border-gray-800 bg-gray-800/50'
                    ></div>
                  ))}
                </div>
              ) : (
                <>
                  {mentors.length > 0 ? (
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                      {mentors.map((mentor) => (
                        <Card key={mentor.user_id} mentor={mentor} />
                      ))}
                    </div>
                  ) : (
                    <div className='flex h-60 w-full flex-col items-center justify-center rounded-xl border border-gray-800 bg-[--secondary] text-gray-400'>
                      <p className='text-lg'>No mentors found matching your criteria.</p>
                      <p className='text-sm'>Try adjusting your filters.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default MentorBrowse;
