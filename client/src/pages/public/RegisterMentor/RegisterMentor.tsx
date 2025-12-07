import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, UploadCloud, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import path from "@/constants/path";

function RegisterMentor() {
  const navigate = useNavigate();
  // const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const { user, registerMentor } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribeUpdates, setSubscribeUpdates] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      void navigate("/", { replace: true });
    }
  }, [user, navigate]);

  if (loading) return <p>Loading...</p>;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFileName(file.name);
      setCvFile(file);
    } else {
      setCvFileName(null);
      setCvFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!cvFile) {
      setError("Please upload your CV (PDF)");
      return;
    }

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("cv", cvFile);

    try {
      await registerMentor(formData);
      alert("Mentor registered successfully! Please wait for admin approval.");
      void navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    }
  };

  return (
    <div className='w-full bg-(--bg-grey) text-white'>
      <section className='flex w-full justify-center px-3 md:pt-16'>
        <div className='grid w-full max-w-6xl grid-cols-1 gap-10 md:grid-cols-2'>
          {/* Left: Share Expertise / Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='flex flex-col justify-center'
          >
            <div
              className='relative overflow-hidden rounded-2xl border border-slate-700/70 p-6 md:p-8'
              style={{
                background:
                  "radial-gradient(circle at top left, #5b21ff55, transparent 55%), radial-gradient(circle at bottom right, #14b8a655, transparent 55%), #020617",
              }}
            >
              <div className='mb-6 max-w-xs'>
                <p className='text-xs tracking-wide text-(--text-grey) uppercase'>Mentoria for Mentors</p>
                <h2 className='mt-2 text-2xl font-bold md:text-3xl'>Share Your Expertise</h2>
                <p className='mt-3 text-sm text-(--text-grey)'>
                  Join thousands of mentors helping others achieve their career goals while earning from your experience
                  and knowledge.
                </p>
              </div>

              <div className='mt-4 space-y-3 text-sm'>
                <div className='flex items-start gap-2'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 text-(--green)' />
                  <p className='text-slate-200'>Set your own rates and schedule</p>
                </div>
                <div className='flex items-start gap-2'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 text-(--green)' />
                  <p className='text-slate-200'>Connect with motivated learners globally</p>
                </div>
                <div className='flex items-start gap-2'>
                  <CheckCircle2 className='mt-0.5 h-5 w-5 text-(--green)' />
                  <p className='text-slate-200'>Build your personal brand and network</p>
                </div>
              </div>

              <div className='pointer-events-none absolute inset-0 -z-10 opacity-60'>
                <div className='absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-purple-500/30 blur-3xl' />
                <div className='absolute -top-10 -right-8 h-40 w-40 rounded-full bg-teal-500/30 blur-3xl' />
              </div>
            </div>
          </motion.div>

          {/* Right: Signup form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className='flex items-center'
          >
            <div className='w-full rounded-2xl border border-slate-700 bg-(--bg-light-grey) p-6 shadow-lg md:p-8'>
              <div className='mb-6 text-center'>
                <p className='text-xs tracking-wide text-(--text-grey) uppercase'>Become a Mentor</p>
                <h1 className='mt-1 text-2xl font-bold md:text-3xl'>Create your mentor account</h1>
                <p className='mt-2 text-sm text-(--text-grey)'>
                  Create your mentor profile and start making an impact.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSubmit(e);
                }}
                className='space-y-4'
              >
                {/* Name row */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div>
                    <label className='text-xs font-medium text-slate-300'>First Name</label>
                    <div className='mt-1 flex items-center rounded-md border border-slate-700 bg-slate-900/60 px-3'>
                      <User className='mr-2 h-4 w-4 text-slate-400' />
                      <input
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                        }}
                        placeholder='John'
                        className='w-full bg-transparent py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500'
                      />
                    </div>
                  </div>
                  <div>
                    <label className='text-xs font-medium text-slate-300'>Last Name</label>
                    <div className='mt-1 flex items-center rounded-md border border-slate-700 bg-slate-900/60 px-3'>
                      <User className='mr-2 h-4 w-4 text-slate-400' />
                      <input
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                        }}
                        placeholder='Doe'
                        className='w-full bg-transparent py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500'
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className='text-xs font-medium text-slate-300'>Email Address</label>
                  <div className='mt-1 flex items-center rounded-md border border-slate-700 bg-slate-900/60 px-3'>
                    <Mail className='mr-2 h-4 w-4 text-slate-400' />
                    <input
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      type='email'
                      placeholder='john@example.com'
                      className='w-full bg-transparent py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500'
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className='text-xs font-medium text-slate-300'>Password</label>
                  <div className='mt-1 flex items-center rounded-md border border-slate-700 bg-slate-900/60 px-3'>
                    <Lock className='mr-2 h-4 w-4 text-slate-400' />
                    <input
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      type={showPassword ? "text" : "password"}
                      placeholder='Create a strong password'
                      className='w-full bg-transparent py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500'
                    />
                    <button
                      type='button'
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPassword((s) => !s);
                      }}
                      className='ml-2 text-slate-400 hover:text-slate-200'
                      aria-label='Toggle password visibility'
                    >
                      {showPassword ? <Eye className='h-4 w-4' /> : <EyeOff className='h-4 w-4' />}
                    </button>
                  </div>
                </div>

                {/* Upload CV */}
                <div>
                  <label className='text-xs font-medium text-slate-300'>Upload your CV</label>
                  <label className='mt-1 flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-600 bg-slate-900/40 px-4 py-5 text-center text-xs text-slate-400 hover:border-(--primary) hover:bg-slate-900/70'>
                    <UploadCloud className='mb-2 h-6 w-6' />
                    <span className='font-medium text-slate-200'>{cvFileName ?? "Drag your file here"}</span>
                    {!cvFileName && <span className='mt-1 text-[11px] text-slate-400'>or click to browse</span>}
                    <input type='file' name='cv' className='hidden' onChange={handleFileChange} />
                  </label>
                </div>

                {error && <p className='text-red-500'>{error}</p>}

                {/* Checkboxes */}
                <div className='space-y-2 pt-2 text-xs text-(--text-grey)'>
                  <label className='flex cursor-pointer items-start gap-2'>
                    <input
                      type='checkbox'
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                      }}
                      className='mt-0.5 h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-(--primary)'
                    />
                    <span>
                      I agree to the{" "}
                      <button type='button' className='text-(--primary) underline-offset-2 hover:underline'>
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button type='button' className='text-(--primary) underline-offset-2 hover:underline'>
                        Privacy Policy
                      </button>
                      .
                    </span>
                  </label>

                  <label className='flex cursor-pointer items-start gap-2'>
                    <input
                      type='checkbox'
                      checked={subscribeUpdates}
                      onChange={(e) => {
                        setSubscribeUpdates(e.target.checked);
                      }}
                      className='mt-0.5 h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-(--primary)'
                    />
                    <span>Send me updates about new features and mentorship opportunities.</span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type='submit'
                  disabled={!agreeTerms}
                  className={
                    "mt-4 w-full transform rounded-lg bg-(--primary) py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 " +
                    (!agreeTerms ? "cursor-not-allowed opacity-70" : "")
                  }
                >
                  Create Mentor Account
                </button>
              </form>

              <p className='mt-5 text-center text-xs text-(--text-grey)'>
                Already have an account?{" "}
                <Link to={path.LOGIN} className='text-(--primary) hover:underline'>
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className='h-10' />
    </div>
  );
}

export default RegisterMentor;
