import Filter from "./components/Filter";
import Card from "./components/Card";
import { Search } from "lucide-react";
import SkillsFilter from "./components/SkillsFilter";
function MentorBrowse() {
  return (
    <>
      <div className='flex w-full justify-center bg-(--secondary)'>
        <div className='my-20 flex w-10/12 justify-between text-white'>
          {/* Search Box */}
          <div className='flex w-1/4 flex-col'>
            <SkillsFilter />
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
                <h2 className='text-2xl font-bold'>1256 Mentors Available for Mentoring</h2>
              </div>
            </div>
            {/* List of mentor card */}
            <div>
              <Card />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default MentorBrowse;
