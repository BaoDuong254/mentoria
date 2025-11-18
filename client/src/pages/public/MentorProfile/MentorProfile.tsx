import { Star, Users, Clock, Check } from "lucide-react";
import { FaLinkedinIn, FaTwitter, FaGithub, FaGlobe } from "react-icons/fa";
import Review from "./Components/Review";
function MentorProfile() {
  const skills = [
    "Machine Learning",
    "Deep Learning",
    "Natural Language Processing",
    "Computer Vision",
    "Python",
    "TensorFlow",
    "PyTorch",
    "Research",
  ];
  const about =
    "I'm a Senior AI Engineer at Google DeepMind with over 10 years of experience in machine learning and artificial intelligence. I hold a PhD in Computer Science from Stanford University and have published over 50 research papers in top-tier conferences.\r\n My passion lies in making AI accessible and helping the next generation of engineers build impactful AI solutions. I specialize in deep learning, natural language processing, and computer vision, and I love sharing my knowledge through mentorship.";
  const review = {
    avt: "https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Alex Johnson",
    star: 4,
    review:
      "Sarah's guidance was invaluable in helping me transition from web development to AI. Her practical approach and industry insights made complex concepts easy to understand.",
  };
  const benefits = ["1-on-1 video call", "Personalized guidance", "Follow-up resources", "Career roadmap"];
  return (
    <>
      <div className='flex w-full justify-center bg-(--secondary) py-15'>
        <div className='flex w-11/12'>
          <div className='h-full w-2/3'>
            <div className='flex h-full w-11/12 flex-col gap-7'>
              {/* First component Info */}
              <div className='rounded-xl bg-gray-800 px-7 py-7'>
                <div className='flex'>
                  {/* Avt */}
                  <div className='flex w-2/12 justify-center'>
                    <div className='h-20 w-20 rounded-full bg-red-200 ring-3 ring-(--primary)'></div>
                  </div>
                  {/* Info */}
                  <div className='flex w-10/12 flex-col gap-4'>
                    <div className='text-2xl font-bold text-white'> Dr. Alex Chen</div>
                    <span className='text-gray-300'>Senior AI Engineer at Google DeepMind</span>
                    <span className='text-[-16px] text-gray-400'>
                      10+ years in Machine Learning & AI | PhD in Computer Science | Published 50+ research papers
                    </span>
                    <div className='flex gap-5'>
                      <div className='flex gap-2'>
                        <Star className='h-4 w-4 fill-yellow-400 stroke-yellow-400' />
                        <span className='font-bold text-white'>4.9</span>
                        <span className='text-gray-400'>(127 reviews)</span>
                      </div>
                      <div className='flex gap-2'>
                        <Users className='h-4 w-4 fill-(--green) stroke-(--green)' />
                        <span className='text-gray-300'>450+ mentees</span>
                      </div>
                      <div className='flex gap-2'>
                        <Clock className='h-4 w-4 rounded-full bg-purple-400 stroke-black' />
                        <span className='text-gray-300'>Usually responds in 2 hours</span>
                      </div>
                    </div>
                    <div className='flex gap-3'>
                      <div className='cursor-pointer rounded-xl bg-[#374151] p-2'>
                        <FaLinkedinIn className='h-4 w-4 text-[#60A5FA]' />
                      </div>

                      <div className='cursor-pointer rounded-xl bg-[#374151] p-2'>
                        <FaTwitter className='h-4 w-4 text-[#60A5FA]' />
                      </div>

                      <div className='cursor-pointer rounded-xl bg-[#374151] p-2'>
                        <FaGithub className='h-4 w-4 text-gray-200' />
                      </div>

                      <div className='cursor-pointer rounded-xl bg-[#374151] p-2'>
                        <FaGlobe className='h-4 w-4 text-teal-400' />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Second component Skills and Expertise */}
              <div className='rounded-xl bg-gray-800 px-7 py-7'>
                <span className='text-2xl font-bold text-white'>Skills & Expertise</span>
                <div className='mt-4 flex flex-wrap gap-3 font-normal text-white'>
                  {skills.map((skill) => (
                    <span key={skill} className='inline-block rounded-full bg-(--primary) px-2 py-2 whitespace-nowrap'>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              {/* Third component About */}
              <div className='rounded-xl bg-gray-800 px-7 py-7'>
                <span className='text-2xl font-bold text-white'>About</span>
                <div className='mt-4 text-gray-400'>{about}</div>
              </div>
              {/* Fourth component Mentee Reviews */}
              <div className='rounded-xl bg-gray-800 px-7 py-7'>
                <span className='text-2xl font-bold text-white'>Mentee Reviews</span>
                <div className='mt-4 text-white'>
                  <Review name={review.name} star={review.star} avt={review.avt} review={review.review} />
                </div>
              </div>
            </div>
          </div>
          <div className='h-full w-1/3 text-gray-400'>
            <div className='flex flex-col items-center justify-between gap-7 rounded-xl border border-(--primary) bg-gray-800 py-7'>
              <div className='flex w-full flex-col items-center justify-between gap-2'>
                <span>
                  <strong className='text-3xl text-white'>$75</strong>/session
                </span>
                <span>60-minute mentoring session</span>
              </div>
              <div className='flex w-10/12 flex-col gap-4'>
                {benefits.map((benefit) => (
                  <span className='flex gap-3' key={benefit}>
                    <Check className='h-5 w-5 text-(--green)' /> {benefit}
                  </span>
                ))}
              </div>
              <button className='flex w-10/12 cursor-pointer items-center justify-center rounded-lg bg-(--primary) py-3 text-white'>
                Book a Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default MentorProfile;
