import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronDown,
  CalendarDays,
  Star,
  Target,
  Clock,
  MessageCircle,
  Rocket,
} from "lucide-react";
import heroImg from "@/assets/publicHomeImg.jpg";
import avt1 from "@/assets/avt1.png";
import avt2 from "@/assets/avt2.png";
import { useAuthStore } from "@/store/useAuthStore";

function Home() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  // Form states for Create Account card
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [goals, setGoals] = useState("Career Development");
  const [showPassword, setShowPassword] = useState(false);

  // Search state (hero + find mentors card)
  const [heroSearch, setHeroSearch] = useState("");
  const [browseSearch, setBrowseSearch] = useState("");

  // Booking card states
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    // no-op: form is fully client interactive
  }, []);

  const timeSlots = useMemo(() => ["10:00 AM", "2:00 PM", "4:30 PM", "6:00 PM"], []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className='w-full bg-(--bg-grey) text-white'>
      {/* Hero */}
      <section className='flex w-full justify-center px-3 md:pt-16'>
        <div className='grid w-full max-w-7xl grid-cols-1 gap-8 md:grid-cols-2'>
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='order-2 md:order-1'
          >
            <img
              src={heroImg}
              alt='Mentors discussing'
              className='h-auto w-full rounded-xl border border-slate-700/60 shadow-lg'
            />
          </motion.div>

          {/* Copy + Search */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className='order-1 flex flex-col justify-center gap-6 md:order-2'
          >
            <div>
              {user ? <p className='mb-2 text-sm text-(--text-grey)'>Welcome back, {user.last_name}</p> : null}
              <h1 className='text-4xl font-extrabold md:text-5xl'>
                Connect with <span className='text-(--primary)'>Expert</span> Mentors
              </h1>
              <p className='mt-3 max-w-xl text-(--text-grey)'>
                Transform your career with personalized guidance from industry professionals. Book one-on-one sessions
                and accelerate your growth.
              </p>
            </div>

            {/* Search bar */}
            <div className='relative w-full max-w-xl'>
              {/* Search input */}
              <input
                value={heroSearch}
                type='text'
                onChange={(e) => {
                  setHeroSearch(e.target.value);
                }}
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

            {/* Popular chips */}
            <div className='flex flex-wrap items-center gap-2'>
              <span className='mr-1 text-sm text-(--text-grey)'>Popular:</span>
              {["Product Managers", "Career Coaches", "Software Engineers", "Leadership Mentors", "UX Designers"].map(
                (chip) => (
                  <button
                    key={chip}
                    type='button'
                    className='transform rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1 text-sm text-slate-300 transition hover:-translate-y-0.5 hover:border-(--primary) hover:text-white active:translate-y-0'
                  >
                    {chip}
                  </button>
                )
              )}
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
          </motion.div>
        </div>
      </section>

      {/* How to Use Mentoria */}
      <section className='mt-14 flex w-full justify-center bg-(--bg-light-grey) px-3 py-3'>
        <div className='w-full max-w-7xl'>
          <div className='mb-8 text-center'>
            <h2 className='text-2xl font-bold md:text-3xl'>How to Use Mentoria</h2>
            <p className='mt-2 text-(--text-grey)'>
              Follow these simple steps to connect with expert mentors and accelerate your career growth
            </p>
          </div>

          {/* Row 1: Login & Create Account */}
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            {/* Left: copy + checklist */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5 }}
              className='rounded-xl p-6'
            >
              <div className='mb-3 flex items-center gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-(--primary)'>
                  <span className='text-sm font-semibold'>1</span>
                </div>
                <h3 className='text-xl font-semibold'>Login & Create Account</h3>
              </div>
              <p className='mb-4 max-w-xl text-(--text-grey)'>
                Start your mentorship journey by creating your Mentoria account. Sign up with your email or social
                accounts in just minutes.
              </p>
              <ul className='space-y-3 text-white'>
                {["Quick Registration", "Complete Profile", "Set Preferences"].map((item, idx) => (
                  <li key={item} className='flex items-start gap-3'>
                    <CheckCircle2 className='mt-0.5 h-5 w-5 text-(--green)' />
                    <div>
                      <p className='font-medium text-white'>{item}</p>
                      {idx === 0 && (
                        <p className='text-sm text-(--text-dark-grey)'>Enter your email, create password, and verify</p>
                      )}
                      {idx === 1 && (
                        <p className='text-sm text-(--text-dark-grey)'>
                          Add your goals, interests, and current skill level
                        </p>
                      )}
                      {idx === 2 && (
                        <p className='text-sm text-(--text-dark-grey)'>
                          Choose meeting times and communication preferences
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right: Create Account Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className='rounded-xl border border-slate-700 bg-(--bg-grey) p-6 shadow'
            >
              <div className='mb-5 flex items-center gap-2'>
                <div className='flex h-9 w-9 items-center justify-center rounded-md bg-(--primary)'>
                  <Mail className='h-5 w-5' />
                </div>
                <h4 className='text-lg font-semibold'>Create Account</h4>
              </div>

              {/* Email */}
              <label className='text-sm text-gray-300'>Email Address</label>
              <div className='mt-2 flex items-center'>
                <div className='flex h-10 items-center rounded-l-md border border-r-0 border-slate-600 bg-slate-800 px-2'>
                  <Mail className='h-5 w-5 text-slate-400' />
                </div>
                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  placeholder='your.email@example.com'
                  className='h-10 w-full rounded-r-md border border-slate-600 bg-slate-800 px-3 text-slate-300 outline-none placeholder:text-slate-400 focus:border-(--primary)'
                />
              </div>

              {/* Password */}
              <div className='mt-4'>
                <label className='text-sm text-gray-300'>Password</label>
                <div className='mt-2 flex items-center'>
                  <div className='flex h-10 items-center rounded-l-md border border-r-0 border-slate-600 bg-slate-800 px-2'>
                    <Lock className='h-5 w-5 text-slate-400' />
                  </div>
                  <input
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    type={showPassword ? "text" : "password"}
                    placeholder='Create secure password'
                    className='h-10 w-full border-y border-slate-600 bg-slate-800 px-3 text-slate-300 outline-none placeholder:text-slate-400 focus:border-(--primary)'
                  />
                  <button
                    type='button'
                    className='flex h-10 items-center justify-center rounded-r-md border border-l-0 border-slate-600 bg-slate-800 px-3 text-slate-300 hover:text-white'
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword((s) => !s);
                    }}
                    aria-label='Toggle password visibility'
                    title='Toggle password visibility'
                  >
                    {showPassword ? <Eye className='h-5 w-5' /> : <EyeOff className='h-5 w-5' />}
                  </button>
                </div>
              </div>

              {/* Goals Dropdown */}
              <div className='mt-4'>
                <label className='text-sm text-gray-300'>Your Goals</label>
                <div className='mt-2 flex items-center rounded-md border border-slate-600 bg-slate-800 px-3'>
                  <select
                    value={goals}
                    onChange={(e) => {
                      setGoals(e.target.value);
                    }}
                    className='w-full appearance-none bg-slate-800 py-2 pr-6 text-slate-300 outline-none'
                  >
                    <option className='bg-slate-800'>Career Development</option>
                    <option className='bg-slate-800'>Learning for Life</option>
                    <option className='bg-slate-800'>Self determination</option>
                  </select>
                  <ChevronDown className='-ml-5 h-4 w-4 text-slate-400' />
                </div>
              </div>

              <button
                type='button'
                className='mt-6 w-full transform rounded-lg bg-(--primary) py-3 font-medium text-white transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0'
              >
                Create Account
              </button>
            </motion.div>
          </div>

          {/* Row 2: Find Mentors */}
          <div className='mt-10 grid grid-cols-1 gap-8 md:grid-cols-2'>
            {/* Find mentors card list */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className='rounded-xl border border-slate-700 bg-(--bg-grey) p-5'
            >
              <div className='mb-3 flex items-center justify-between'>
                <h4 className='text-lg font-semibold'>Find Mentors</h4>
                <span className='text-sm text-slate-400'>Filters</span>
              </div>
              <div className='mb-4 flex items-center rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2'>
                <Search className='mr-2 h-5 w-5 text-slate-400' />
                <input
                  value={browseSearch}
                  onChange={(e) => {
                    setBrowseSearch(e.target.value);
                  }}
                  placeholder='Search by skill or expertise...'
                  className='w-full bg-transparent text-slate-300 outline-none placeholder:text-slate-400'
                />
              </div>

              {/* sample mentors */}
              <div className='space-y-3'>
                {[
                  { name: "Sarah Chen", role: "Sr. AI Engineer at Google", rate: 80, avt: avt1 },
                  { name: "Marcus Johnson", role: "Product Manager at Meta", rate: 65, avt: avt2 },
                ].map((m) => (
                  <div
                    key={m.name}
                    className='flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/50 p-3 hover:border-(--primary)'
                  >
                    <div className='flex items-center gap-3'>
                      <img src={m.avt} alt='avatar' className='h-10 w-10 rounded-full' />
                      <div>
                        <p className='font-medium'>{m.name}</p>
                        <div className='flex items-center gap-2 text-xs text-slate-400'>
                          <Star className='h-4 w-4 text-yellow-400' /> 4.8 (51)
                          <span className='ml-2'>{m.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-slate-300'>${m.rate}/hr</p>
                      <p className='text-xs text-(--green)'>Available</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Copy for Find Your Mentor */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className='rounded-xl p-6'
            >
              <div className='mb-3 flex items-center gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-teal-600'>
                  <span className='text-sm font-semibold'>2</span>
                </div>
                <h3 className='text-xl font-semibold'>Find Your Mentor</h3>
              </div>
              <p className='mb-4 text-slate-300'>
                Browse through our curated list of expert mentors and find the perfect match for your specific goals and
                learning style.
              </p>
              <ul className='space-y-3 text-slate-300'>
                <li className='flex items-start gap-3'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 text-(--primary)' />
                  <div>
                    <p className='font-medium text-white'>Advanced Search</p>
                    <p className='text-sm text-slate-400'>Filter by skill, industry, experience, and price</p>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 text-(--primary)' />
                  <div>
                    <p className='font-medium text-white'>Detailed Profiles</p>
                    <p className='text-sm text-slate-400'>Review backgrounds, ratings, and success stories</p>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 text-(--primary)' />
                  <div>
                    <p className='font-medium text-white'>Perfect Match</p>
                    <p className='text-sm text-slate-400'>Compare options to find your ideal mentor</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Row 3: Book Session */}
          <div className='mt-10 grid grid-cols-1 gap-8 md:grid-cols-2'>
            {/* Left copy */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className='rounded-xl p-6'
            >
              <div className='mb-3 flex items-center gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-full bg-purple-700'>
                  <span className='text-sm font-semibold'>3</span>
                </div>
                <h3 className='text-xl font-semibold'>Book Your Session</h3>
              </div>
              <p className='mb-4 max-w-xl text-slate-300'>
                Once you have found your ideal mentor, booking a session is simple and secure. Choose your preferred
                time and complete payment.
              </p>
              <ul className='space-y-3 text-slate-300'>
                <li className='flex items-start gap-3'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 text-(--green)' />
                  <div>
                    <p className='font-medium text-white'>Choose Date & Time</p>
                    <p className='text-sm text-slate-400'>Select from available slots that fit your schedule</p>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 text-(--green)' />
                  <div>
                    <p className='font-medium text-white'>Secure Payment</p>
                    <p className='text-sm text-slate-400'>Pay safely with encrypted processing</p>
                  </div>
                </li>
                <li className='flex items-start gap-3'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 text-(--green)' />
                  <div>
                    <p className='font-medium text-white'>Instant Confirmation</p>
                    <p className='text-sm text-slate-400'>Get meeting details and invite immediately</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Booking card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className='rounded-xl border border-slate-700 bg-(--bg-grey) p-6'
            >
              <div className='mb-3 flex items-center gap-2'>
                <div className='flex h-9 w-9 items-center justify-center rounded-md bg-(--primary)'>
                  <CalendarDays className='h-5 w-5' />
                </div>
                <h4 className='text-lg font-semibold'>Book Session</h4>
              </div>

              <div className='mb-4 flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/40 p-3'>
                <div className='flex items-center gap-3'>
                  <img src={avt1} alt='avatar' className='h-10 w-10 rounded-full' />
                  <div>
                    <p className='font-medium'>Sarah Chen</p>
                    <p className='text-xs text-slate-400'>AI Engineering Session</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-semibold text-(--primary)'>$80</p>
                  <p className='text-xs text-slate-400'>60 minutes session</p>
                </div>
              </div>

              {/* Date */}
              <label className='text-sm text-gray-300'>Select Date</label>
              <div className='mt-2 flex items-center rounded-md border border-slate-600 bg-slate-800 px-3'>
                <CalendarDays className='mr-2 h-5 w-5 text-slate-400' />
                <input
                  type='date'
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                  }}
                  className='w-full bg-transparent py-2 text-slate-300 outline-none'
                />
              </div>

              {/* Time slots */}
              <div className='mt-4'>
                <label className='text-sm text-gray-300'>Available Times</label>
                <div className='mt-2 grid grid-cols-2 gap-3'>
                  {timeSlots.map((t) => {
                    const active = t === selectedTime;
                    return (
                      <button
                        key={t}
                        onClick={() => {
                          setSelectedTime(t);
                        }}
                        type='button'
                        className={
                          `flex transform items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition hover:-translate-y-0.5 ` +
                          (active
                            ? "border-(--primary) bg-(--primary) text-white"
                            : "border-slate-600 bg-slate-800 text-slate-300 hover:border-(--primary)")
                        }
                      >
                        <Clock className='h-4 w-4' /> {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type='button'
                className='mt-6 w-full transform rounded-lg bg-(--green) py-3 text-white transition hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0'
              >
                Proceed to Payment
              </button>
            </motion.div>
          </div>

          {/* Tips */}
          <div
            className='mt-10 rounded-2xl border border-slate-700 p-6'
            style={{ background: "linear-gradient(90deg, #6a0dad33, #00808033)" }}
          >
            <h4 className='mb-2 text-center text-xl font-semibold'>Tips for Success</h4>
            <p className='mb-6 text-center text-slate-300'>Make the most out of your mentorship sessions</p>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
              {[
                {
                  title: "Be Clear About Goals",
                  desc: "Come prepared with objectives",
                  icon: <Target className='h-6 w-6 text-white' />,
                  color: "from-purple-600 to-purple-400",
                },
                {
                  title: "Be Punctual",
                  desc: "Arrive on time and be prepared",
                  icon: <Clock className='h-6 w-6 text-white' />,
                  color: "from-teal-600 to-teal-400",
                },
                {
                  title: "Ask Questions",
                  desc: "Don’t hesitate to seek clarification",
                  icon: <MessageCircle className='h-6 w-6 text-white' />,
                  color: "from-violet-400 to-violet-200",
                },
                {
                  title: "Take Action",
                  desc: "Implement the advice you receive",
                  icon: <Rocket className='h-6 w-6 text-white' />,
                  color: "from-purple-600 to-fuchsia-500",
                },
              ].map((tip) => (
                <div
                  key={tip.title}
                  className='flex flex-col items-center rounded-xl p-4 text-center transition hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-(--primary)/10 hover:shadow-lg'
                >
                  <div
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${tip.color}`}
                  >
                    {tip.icon}
                  </div>
                  <p className='font-medium'>{tip.title}</p>
                  <p className='mt-1 text-sm text-slate-400'>{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className='h-10 bg-(--bg-light-grey)' />
    </div>
  );
}
export default Home;
