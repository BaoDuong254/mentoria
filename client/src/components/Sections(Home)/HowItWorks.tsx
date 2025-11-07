import StepCreateAccount from "./Steps/StepCreateAccount.tsx";
import StepFindMentor from "./Steps/StepFindMentor.tsx";
import StepBookSession from "./Steps/StepBookSession.tsx";

export default function HowItWorks() {
  return (
    <section className='mt-6 bg-[var(--bg-light-grey)] p-4'>
      <h3 className='mt-6 mb-6 text-center text-2xl font-bold text-white'>How to Use Mentoria</h3>

      <div className='grid grid-cols-3 gap-6'>
        <div>
          <StepCreateAccount />
        </div>
        <div>
          <StepFindMentor />
        </div>
        <div>
          <StepBookSession />
        </div>
      </div>
    </section>
  );
}
