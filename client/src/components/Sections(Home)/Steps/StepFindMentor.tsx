export default function StepFindMentor() {
  const mentors = [
    { name: "Sarah Chen", role: "Product Designer", rating: 4.9 },
    { name: "Marcus Johnson", role: "Senior Engineer", rating: 4.8 },
  ];

  return (
    <div className='rounded-2xl bg-slate-800 p-6 shadow-md'>
      <div className='mb-4 flex items-start gap-4'>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 font-bold'>2</div>
        <div>
          <h4 className='text-lg font-semibold text-slate-100'>Find Your Mentor</h4>
          <p className='text-sm text-slate-400'>Browse our curated list and filter by expertise and availability.</p>
        </div>
      </div>

      <div className='mt-4 space-y-3'>
        {mentors.map((m, i) => (
          <div key={i} className='flex items-center justify-between rounded-lg bg-slate-700 p-3'>
            <div>
              <div className='font-semibold text-slate-100'>{m.name}</div>
              <div className='text-sm text-slate-400'>{m.role}</div>
            </div>
            <div className='text-right'>
              <div className='text-sm font-semibold text-slate-200'>{m.rating} ★</div>
              <div className='text-xs text-slate-400'>Available</div>
            </div>
          </div>
        ))}

        <button className='mt-2 w-full rounded-md bg-teal-500 py-2 font-semibold text-slate-900'>
          View All Mentors
        </button>
      </div>
    </div>
  );
}
