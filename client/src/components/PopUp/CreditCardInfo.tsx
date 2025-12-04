import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreditCardInfo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* DEMO BUTTON */}
      <button
        onClick={() => {
          setOpen(true);
        }}
        className='rounded-md bg-(--primary) px-4 py-2 text-white transition hover:brightness-110'
      >
        Open Payment Popup
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* BACKDROP */}
            <motion.div
              className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setOpen(false);
              }}
            />

            {/* MODAL */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className='fixed inset-0 z-50 flex items-center justify-center'
            >
              <div className='w-[340px] rounded-xl border border-slate-700 bg-(--bg-light-grey) p-6 text-white shadow-xl'>
                {/* Header */}
                <div className='mb-4 flex items-center gap-2'>
                  <button
                    onClick={() => {
                      setOpen(false);
                    }}
                    className='text-(--text-grey) hover:text-white'
                  >
                    ←
                  </button>
                  <h2 className='flex-1 text-center text-lg font-semibold'>Credit Card Details</h2>
                </div>

                {/* Payment logos */}
                <div className='mb-5 rounded-lg border border-slate-600 p-3'>
                  <p className='mb-2 text-xs text-(--text-grey)'>Payment Method</p>
                  <div className='flex gap-3'>
                    <img
                      src='https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Mastercard-logo.png/200px-Mastercard-logo.png'
                      className='h-5'
                    />
                    <img
                      src='https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png'
                      className='h-5'
                    />
                    <img
                      src='https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo_%282018%29.svg'
                      className='h-5'
                    />
                    <img
                      src='https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Discover_Card_logo.svg/200px-Discover_Card_logo.svg.png'
                      className='h-5'
                    />
                  </div>
                </div>

                {/* Form */}
                <div className='space-y-4'>
                  {/* Name */}
                  <div>
                    <label className='text-xs text-(--text-grey)'>Name on card</label>
                    <input
                      type='text'
                      placeholder='Meet Patel'
                      className='mt-1 w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm outline-none placeholder:text-(--text-dark-grey)'
                    />
                  </div>

                  {/* Number */}
                  <div>
                    <label className='text-xs text-(--text-grey)'>Card number</label>
                    <input
                      type='text'
                      placeholder='0000 0000 0000 0000'
                      className='mt-1 w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm outline-none placeholder:text-(--text-dark-grey)'
                    />
                  </div>

                  {/* Expiration */}
                  <div>
                    <label className='text-xs text-(--text-grey)'>Card expiration</label>
                    <div className='mt-1 flex gap-2'>
                      <select className='w-1/2 rounded-md border border-slate-700 bg-slate-900/60 px-2 py-2 text-sm outline-none'>
                        <option>Month</option>
                      </select>
                      <select className='w-1/2 rounded-md border border-slate-700 bg-slate-900/60 px-2 py-2 text-sm outline-none'>
                        <option>Year</option>
                      </select>
                    </div>
                  </div>

                  {/* Security Code */}
                  <div>
                    <label className='text-xs text-(--text-grey)'>Card Security Code</label>
                    <input
                      type='text'
                      placeholder='Code'
                      className='mt-1 w-full rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm outline-none placeholder:text-(--text-dark-grey)'
                    />
                  </div>
                </div>

                {/* Continue button */}
                <button className='mt-5 w-full rounded-md bg-white py-2.5 font-semibold text-black transition hover:brightness-95'>
                  Continue
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
