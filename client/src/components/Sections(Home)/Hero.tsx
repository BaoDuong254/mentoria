import { Search } from "lucide-react";

export default function Hero() {
  return (
    <section className='bg-[var(--bg-grey)]'>
      <div className='flex gap-8'>
        {/* Left: Image */}
        <div className='flex w-[48%] items-center justify-center overflow-hidden rounded-xl bg-slate-700'>
          {/* placeholder image box */}
          <img
            src='https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80&auto=format&fit=crop'
            alt='mentors'
            className='h-full w-full object-cover'
          />
        </div>

        {/* Right: Content */}
        <div className='w-[52%] pl-6'>
          <h2 className='mb-4 text-4xl font-extrabold text-white'>
            Connect with{" "}
            <span className='' style={{ color: "var(--primary)" }}>
              Expert
            </span>{" "}
            Mentors
          </h2>
          <p className='mb-6' style={{ color: "var(--text-grey)" }}>
            Transform your career with personalized guidance from industry professionals. Book one-on-one sessions to
            accelerate your growth.
          </p>

          {/* Search / CTA */}
          <div className='relative w-full max-w-xl'>
            {/* Search input */}
            <input
              type='text'
              placeholder='Search by skill, role or mentor name'
              className='w-full rounded-lg bg-slate-700 py-3 pr-32 pl-10 text-white placeholder-slate-400 focus:ring-2 focus:ring-[var(--green)] focus:outline-none'
            />

            {/* Search icon */}
            <Search size={18} className='absolute top-1/2 left-4 -translate-y-1/2 text-slate-400' />

            {/* Find Mentors button */}
            <button
              className='absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md px-4 py-2 font-semibold text-white transition-colors'
              style={{
                backgroundColor: "var(--green)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--green), white 15%)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--green)")}
            >
              Find Mentors
            </button>
          </div>
          {/* Popular Tags */}
          <div className='mt-4 space-y-2'>
            <div className='mb-2 text-sm text-slate-400'>Popular:</div>
            <div className='flex flex-wrap gap-3'>
              {["Product Managers", "Career Coaches", "Software Engineers", "Leadership Mentors", "UX Designers"].map(
                (tag) => (
                  <button
                    key={tag}
                    className='rounded-full bg-slate-700 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-[var(--green)] hover:text-white focus:ring-2 focus:ring-[var(--green)] focus:outline-none'
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Stats */}
          <div className='mt-8 flex justify-center gap-16 text-center'>
            <div>
              <div className='text-2xl font-bold' style={{ color: "var(--primary)" }}>
                500+
              </div>
              <div className='text-sm' style={{ color: "var(--text-dark-grey)" }}>
                Expert Mentors
              </div>
            </div>

            <div>
              <div className='text-2xl font-bold' style={{ color: "var(--green)" }}>
                10k+
              </div>
              <div className='text-sm' style={{ color: "var(--text-dark-grey)" }}>
                Sessions Completed
              </div>
            </div>

            <div>
              <div className='text-2xl font-bold' style={{ color: "var(--text-light-purple)" }}>
                98%
              </div>
              <div className='text-sm' style={{ color: "var(--text-dark-grey)" }}>
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
