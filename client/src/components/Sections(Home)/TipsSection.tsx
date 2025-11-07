export default function TipsSection() {
  const tips = [
    { title: "Be Clear About Goals", desc: "Prepare topics and goals before sessions." },
    { title: "Be Punctual", desc: "Respect your mentor's time and be on time." },
    { title: "Ask Questions", desc: "Ask actionable questions to get practical advice." },
    { title: "Take Action", desc: "Apply feedback and follow up with progress." },
  ];

  return (
    <section className='mt-10'>
      <h4 className='mb-6 text-xl font-bold text-slate-100'>Tips for Success</h4>

      <div className='flex gap-4'>
        {tips.map((t, i) => (
          <div key={i} className='flex-1 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-500 p-5 shadow'>
            <div className='mb-2 text-sm font-semibold text-slate-100'>Tip {i + 1}</div>
            <div className='mb-1 font-semibold text-white'>{t.title}</div>
            <div className='text-sm text-slate-200'>{t.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
