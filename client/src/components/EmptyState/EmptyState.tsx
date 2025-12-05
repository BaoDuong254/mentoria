import { Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center justify-center py-20'>
      <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-purple-800/20'>
        <CalendarIcon className='h-12 w-12 text-purple-500' />
      </div>
      <h2 className='mb-2 text-2xl font-bold text-white'>Your schedule is empty</h2>
      <p className='mb-8 text-gray-400'>There are no appointments scheduled</p>
      <button
        onClick={() => {
          void navigate("/mentor-browse");
        }}
        className='rounded-lg bg-purple-800 px-8 py-3 text-white transition-colors hover:bg-purple-700'
      >
        Book a mentor
      </button>
    </div>
  );
}
