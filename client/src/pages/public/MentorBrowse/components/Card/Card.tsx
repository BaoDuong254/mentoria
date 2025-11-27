import path from "@/constants/path";
import type { Mentor } from "@/types";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CardProps {
  mentor: Mentor;
}
export default function Card({ mentor }: CardProps) {
  const skills = mentor.skills.map((skill) => skill.skill_name);
  const languages = mentor.languages.map((language) => language);
  const navigate = useNavigate();

  const handleViewProfile = () => {
    void navigate(`${path.MENTOR_PROFILE}/${String(mentor.user_id)}`);
  };
  return (
    <>
      <div className='flex h-[554px] w-[280px] justify-center rounded-xl border border-gray-600 bg-gray-800 text-gray-300'>
        <div className='mt-8 flex w-10/12 flex-col gap-7'>
          <div className='flex gap-3'>
            {/* Avt */}
            <div>
              <div className='h-16 w-16 rounded-full bg-amber-400'>
                <img src={mentor.avatar_url} alt={`avt of ${mentor.first_name}`} className='rounded-full' />
              </div>
            </div>
            {/* Name and Job */}
            <div className='flex flex-col gap-2'>
              {/* Name */}
              <span>
                <strong className='text-[20px] text-white'>{`${mentor.first_name} ${mentor.last_name}`}</strong>
              </span>
              {/* Job */}
              <span className='text-[16px] leading-6'>{`${mentor.companies[0].job_name} at ${mentor.companies[0].company_name}`}</span>
              {/* Rating stars */}
              <div className='flex items-center'>
                {Array.from({ length: 5 }, (_, index) => {
                  const starValue = index + 1;
                  const isFilled = starValue <= Math.floor(mentor.average_rating ?? 0);
                  return (
                    <Star
                      className='mr-1 h-4 w-4 text-yellow-500'
                      fill={isFilled ? "currentColor" : "none"}
                      key={index}
                    />
                  );
                })}
                <span className='ml-2 text-sm'>
                  ({mentor.average_rating ?? 0}) • {mentor.total_feedbacks} reviews
                </span>
              </div>
            </div>
          </div>
          {/* Skills */}
          <div className='mb-2 flex flex-wrap items-center gap-y-1 text-[16px] text-gray-300'>
            {skills.map((skill, index) => (
              <div key={index} className='flex items-center'>
                {/* whitespace-nowrap giúp tên skill không bị gãy đôi khi xuống dòng */}
                <span className='tracking-wide'>{skill}</span>
                {index < skills.length - 1 && <span className='mx-2 text-gray-500'>|</span>}
              </div>
            ))}
          </div>
          <div className='text-[16px] tracking-wide text-gray-400'>Response {mentor.response_time.toLowerCase()}</div>
          {/* Available */}
          <div>
            <span>Available languages:</span>
            <div className='mt-1.5 flex gap-2'>
              {languages.map((language) => (
                <div key={language} className='rounded-full bg-[#374151] px-2 py-1 text-sm text-gray-300'>
                  {language}
                </div>
              ))}
            </div>
          </div>
          {/* Price and book */}
          <div className='flex gap-6'>
            <span>
              <strong className='text-2xl text-white'>${mentor.lowest_plan_price}</strong> <br />
              /hour
            </span>
            <button
              onClick={handleViewProfile}
              className='flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-(--primary) text-[18px] text-white'
            >
              Book Session
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
