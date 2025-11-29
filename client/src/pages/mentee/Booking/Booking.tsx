import { Clock, Globe, Star, Users, Video } from "lucide-react";

function Booking() {
  return (
    <>
      <div className='flex w-full items-center justify-center bg-(--secondary)'>
        <div className='flex w-11/12 border border-red-300'>
          {/* Left side */}
          <div className='flex w-1/3 flex-col gap-5'>
            {/* Information of session */}
            <div className='flex w-10/12 items-center justify-center rounded-xl border border-gray-500 bg-gray-800'>
              <div className='flex w-10/12 flex-col justify-center gap-4 py-5 text-gray-400'>
                <div className='flex items-center gap-3'>
                  <img
                    src='https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                    alt='avt'
                    className='h-15 w-15 rounded-full'
                  />
                  <div className='flex flex-col gap-1'>
                    <span>
                      <strong className='font-semibold text-white'>Alex Chen</strong>
                    </span>
                    <span className='text-(--light-purple)/90'>Senior AI Engineer</span>
                    <span className='flex items-center'>
                      <Star /> (127 reviews)
                    </span>
                  </div>
                </div>
                <span className='font-semibold text-white'>AI Strategy Session</span>
                <div className='flex flex-col gap-3 text-gray-300'>
                  <span className='flex items-center gap-2'>
                    <Video className='fill-(--green) text-(--green)' />
                    Video Call
                  </span>
                  <span className='flex items-center gap-2'>
                    <Clock className='text-(--primary)' />
                    60 Minutes
                  </span>
                  <span className='flex items-center gap-2'>
                    <Users className='fill-(--light-purple) text-(--light-purple)' />
                    One-on-One
                  </span>
                </div>
                <div className='flex items-center justify-between border-t border-gray-600 pt-6'>
                  <span>Session Fee</span>
                  <span>
                    <strong className='text-xl text-white'>$120</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Right side */}
          <div className='flex w-2/3 flex-col gap-5'>
            <div className='flex w-full items-center justify-center rounded-xl border border-gray-500 bg-gray-800'>
              <div className='flex w-11/12 flex-col gap-4'>
                <div className='flex items-center gap-2'>
                  <Globe className='h-7 w-7 fill-(--green) text-gray-800' />
                  <span className='text-white'>(GMT-08:00) Pacific Time - Los Angeles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Booking;
