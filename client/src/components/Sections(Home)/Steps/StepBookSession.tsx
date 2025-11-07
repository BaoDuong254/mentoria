export default function StepBookSession() {
  return (
    <div className='rounded-2xl bg-slate-800 p-6 shadow-md'>
      <div className='mb-4 flex items-start gap-4'>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 font-bold'>3</div>
        <div>
          <h4 className='text-lg font-semibold text-slate-100'>Book Your Session</h4>
          <p className='text-sm text-slate-400'>Pick a time, confirm details, and book securely.</p>
        </div>
      </div>

      <div className='mt-4 grid grid-cols-1 gap-3'>
        <div className='rounded-md bg-slate-700 p-3'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='font-semibold text-slate-100'>Sarah Chen</div>
              <div className='text-sm text-slate-400'>Product Designer</div>
            </div>
            <div className='text-sm font-semibold text-slate-200'>$80 / hr</div>
          </div>
        </div>

        <div className='rounded-md bg-slate-700 p-3'>
          <label className='mb-1 block text-sm text-slate-300'>Choose Date & Time</label>
          <input className='w-full rounded-md bg-slate-600 px-3 py-2 text-slate-200' placeholder='Select date' />
        </div>

        <button className='w-full rounded-md bg-indigo-500 py-2 font-semibold text-white'>Proceed to Payment</button>
      </div>
    </div>
  );
}
