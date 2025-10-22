import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";
export default function Footer() {
  return (
    <>
      <footer className='h-80 w-screen bg-[var(--secondary)] text-white'>
        {/* Top Footer */}
        <div className='flex w-screen justify-center pt-12'>
          <div className='bg-secondary flex w-full max-w-7xl justify-between pl-3'>
            <div className='flex h-[160px] w-1/4 flex-col justify-between'>
              <div className='text-2xl font-bold text-[var(--primary)]'>Mentoria</div>
              <p className='max-w-64 text-gray-300'>
                Connecting mentees with expert mentors for career growth and success.
              </p>
              <div className='flex gap-3'>
                <FaTwitter className='text-gray-300' size={20} />
                <FaLinkedin className='text-gray-300' size={20} />
                <FaGithub className='text-gray-300' size={20} />
              </div>
            </div>
            <div className='flex h-[160px] w-1/4 flex-col gap-6'>
              <div className='font-semibold'>For Mentees</div>
              <div>
                <ul className='flex h-[88px] flex-col justify-between'>
                  {["Find Mentors", "Book Sessions", "Mentee Dashboard"].map((item) => (
                    <li key={item} className='text-gray-300'>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className='flex h-[160px] w-1/4 flex-col gap-6'>
              <div className='font-semibold'>For Mentors</div>
              <div>
                <ul className='flex h-[88px] flex-col justify-between'>
                  {["Become a Mentor", "Mentor Dashboard", "Resources"].map((item) => (
                    <li key={item} className='text-gray-300'>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className='flex h-[160px] w-1/4 flex-col gap-6'>
              <div className='font-semibold'>Support</div>
              <div>
                <ul className='flex h-[88px] flex-col justify-between'>
                  {["Help Center", "Contact Us", "Privacy Policy"].map((item) => (
                    <li key={item} className='text-gray-300'>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Bot Footer */}
        </div>
        <div className='flex w-screen justify-center'>
          <div className='bg-secondary mt-10 flex w-full max-w-7xl items-center justify-center border-t border-gray-700'>
            <div className='flex flex-col items-center justify-center pt-2'>
              <p className='text-gray-300'>&copy; HCMUT L07 Group 1</p>
              <p className='text-gray-300'>Programming Integration Project (CO30103)</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
