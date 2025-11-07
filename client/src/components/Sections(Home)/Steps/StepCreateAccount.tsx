export default function StepCreateAccount() {
  return (
    <div className='rounded-2xl bg-slate-800 p-6 shadow-md'>
      <div className='mb-4 flex items-start gap-4'>
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 font-bold'>1</div>
        <div>
          <h4 className='text-lg font-semibold text-slate-100'>Login & Create Account</h4>
          <p className='text-sm text-slate-400'>Start your mentorship journey by creating your Mentoría account.</p>
        </div>
      </div>

      {/* Static Create Account form (UI only) */}
      <form className='mt-4 space-y-3'>
        <div>
          <label className='mb-1 block text-sm text-slate-300'>Full name</label>
          <input className='w-full rounded-md bg-slate-700 px-3 py-2 text-slate-200' placeholder='Jane Doe' />
        </div>
        <div>
          <label className='mb-1 block text-sm text-slate-300'>Email</label>
          <input className='w-full rounded-md bg-slate-700 px-3 py-2 text-slate-200' placeholder='you@example.com' />
        </div>
        <div>
          <label className='mb-1 block text-sm text-slate-300'>Role</label>
          <select className='w-full rounded-md bg-slate-700 px-3 py-2 text-slate-200'>
            <option>Choose role</option>
            <option>Student</option>
            <option>Professional</option>
          </select>
        </div>

        <button type='button' className='mt-2 w-full rounded-md bg-indigo-500 py-2 font-semibold text-white'>
          Create Account
        </button>
      </form>
    </div>
  );
}
