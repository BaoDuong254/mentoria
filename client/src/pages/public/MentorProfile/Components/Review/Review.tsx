import { Star } from "lucide-react";
interface ReviewProps {
  avt: string;
  name: string;
  star: number;
  review: string;
}
export default function Review({ avt, name, star, review }: ReviewProps) {
  return (
    <>
      <div className='flex w-full flex-col gap-2 rounded-lg border border-gray-600 py-4 pl-4'>
        {/* Avt */}
        <div className='flex gap-2'>
          <img src={avt} alt='avatar' className='h-10 w-10 rounded-full' />
          <div className='flex flex-col gap-1'>
            <span>{name}</span>
            <div className='flex'>
              {Array.from({ length: 5 }, (_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= star;
                return (
                  <Star
                    className='mr-1 h-4 w-4 text-yellow-500'
                    fill={isFilled ? "currentColor" : "none"}
                    key={index}
                  />
                );
              })}
            </div>
          </div>
        </div>
        {/* Review */}
        <div className='text-gray-400'>
          <span>"{review}"</span>
        </div>
      </div>
    </>
  );
}
