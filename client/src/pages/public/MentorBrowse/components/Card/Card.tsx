import { Star } from "lucide-react";
import React from "react";
export default function Card() {
  const skills = ["Object Detection", "3D Vision", "Edge AI"];
  const experience = "8+ years experience";
  const abilities = ["Mentoring", "Code Review"];
  return (
    <>
      <div className='flex h-[554px] w-[280px] justify-center rounded-xl border border-gray-600 bg-gray-800 text-gray-300'>
        <div className='mt-8 flex w-10/12 flex-col gap-7'>
          <div className='flex gap-3'>
            {/* Avt */}
            <div>
              <div className='h-16 w-16 rounded-full bg-amber-400'></div>
            </div>
            {/* Name and Job */}
            <div className='flex flex-col gap-2'>
              {/* Name */}
              <span>
                <strong className='text-[20px] text-white'>Daniel Lopez</strong>
              </span>
              {/* Job */}
              <span className='text-[16px] leading-6'>Senior Computer Vision Scientist at Nvidia</span>
              {/* Rating stars */}
              <div className='flex items-center'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className='h-5 w-5 fill-yellow-400 stroke-yellow-400' />
                ))}
                <span className='ml-2 text-sm'>(4.9) • 118 sessions</span>
              </div>
            </div>
          </div>
          {/* Skills */}
          <div className='leading-relaxed'>
            {skills.map((skill) => (
              <React.Fragment key={skill}>
                <span className='tracking-wide'>{skill}</span>
                <span className='mx-1.5'>|</span>
              </React.Fragment>
            ))}
            <br />
            <span className='tracking-wide'>{experience}</span>
          </div>
          {/* Available */}
          <div>
            <span>Available for:</span>
            <div className='mt-1.5 flex gap-2'>
              {abilities.map((ability) => (
                <div key={ability} className='rounded-full bg-[#374151] px-2 py-1 text-sm text-gray-300'>
                  {ability}
                </div>
              ))}
            </div>
          </div>
          {/* Price and book */}
          <div className='flex gap-6'>
            <span>
              <strong className='text-2xl text-white'>$105</strong> <br />
              /hour
            </span>
            <div className='flex flex-1 items-center justify-center rounded-lg bg-(--primary) text-[18px] text-white'>
              Book Session
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
