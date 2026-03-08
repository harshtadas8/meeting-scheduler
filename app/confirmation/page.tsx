type Props = {
  searchParams: Promise<{ date?: string; time?: string }>;
};

export default async function ConfirmationPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  
  // Default fallbacks in case params are missing
  const selectedDate = resolvedParams.date || '2026-03-09';
  const time = resolvedParams.time || '16:30';

  // Format date to match "9 March 2026"
  const displayDate = new Date(selectedDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex flex-col items-center pt-12 p-4 font-sans">
      
      {/* Completed Step Indicator Header */}
      <div className="flex items-center justify-center mb-10 w-full max-w-md relative">
        {/* Solid orange line connecting the steps */}
        <div className="absolute top-[10px] left-[50%] -translate-x-1/2 w-32 h-[2px] bg-[#FF7E67] z-0"></div>

        <div className="flex justify-between w-48 relative z-10">
          {/* Step 1: Completed */}
          <div className="flex flex-col items-center gap-2 bg-[#F9FAFB] px-2">
            <div className="w-5 h-5 rounded-full bg-[#FF7E67] text-white flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase">CHOOSE TIME</span>
          </div>

          {/* Step 2: Completed */}
          <div className="flex flex-col items-center gap-2 bg-[#F9FAFB] px-2">
            <div className="w-5 h-5 rounded-full bg-[#FF7E67] text-white flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase">YOUR INFO</span>
          </div>
        </div>
      </div>

      {/* Main Confirmation Card */}
      <div className="max-w-[420px] w-full bg-white rounded-lg shadow-sm border border-gray-100 p-10 flex flex-col items-center text-center">
        
        {/* Accurate Celebration Illustration Mimic */}
        <div className="mb-6 w-32 h-32 flex items-center justify-center">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Base */}
            <path d="M50 100 L 70 110 L 90 100 L 70 90 Z" fill="#CCFBF1" />
            
            {/* Action Lines */}
            <path d="M40 70 L 30 65" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"/>
            <path d="M35 50 L 25 45" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"/>
            <path d="M100 70 L 110 65" stroke="#4B5563" strokeWidth="2" strokeLinecap="round"/>

            {/* Sparkles */}
            <path d="M105 40 L 107 45 L 112 47 L 107 49 L 105 54 L 103 49 L 98 47 L 103 45 Z" fill="#4B5563" />
            <path d="M35 30 L 36 33 L 39 34 L 36 35 L 35 38 L 34 35 L 31 34 L 34 33 Z" fill="#4B5563" />
            <circle cx="25" cy="80" r="2" fill="#4B5563"/>
            <circle cx="115" cy="85" r="1.5" fill="#4B5563"/>

            {/* Balloon Strings */}
            <path d="M70 85 Q 60 60 50 45" stroke="#4B5563" strokeWidth="1.5" fill="none" />
            <path d="M70 85 Q 70 55 65 35" stroke="#4B5563" strokeWidth="1.5" fill="none" />
            <path d="M70 85 Q 85 65 95 50" stroke="#4B5563" strokeWidth="1.5" fill="none" />

            {/* Purple Balloon (Left) */}
            <path d="M50 45 C 35 45 35 25 50 25 C 65 25 65 45 50 45 Z" fill="#A78BFA" stroke="#4B5563" strokeWidth="2"/>
            <path d="M47 45 L 53 45 L 50 50 Z" fill="#A78BFA" stroke="#4B5563" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M42 32 C 43 29 46 27 50 27" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>

            {/* Yellow Balloon (Right) */}
            <path d="M95 50 C 80 50 80 30 95 30 C 110 30 110 50 95 50 Z" fill="#FDE047" stroke="#4B5563" strokeWidth="2"/>
            <path d="M92 50 L 98 50 L 95 55 Z" fill="#FDE047" stroke="#4B5563" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M87 37 C 88 34 91 32 95 32" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>

            {/* Red Balloon (Top Middle) */}
            <path d="M65 35 C 50 35 50 10 65 10 C 80 10 80 35 65 35 Z" fill="#F87171" stroke="#4B5563" strokeWidth="2"/>
            <path d="M62 35 L 68 35 L 65 40 Z" fill="#F87171" stroke="#4B5563" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M57 22 C 58 19 61 17 65 17" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>

            {/* Teal Checkmark */}
            <path d="M47 72 L 62 87 L 92 52 L 82 42 L 62 67 L 55 60 Z" fill="#2DD4BF" stroke="#4B5563" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M50 72 L 62 83 L 88 52" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-slate-800 mb-2">
          Booking confirmed
        </h1>
        
        <p className="text-[15px] text-slate-600 mb-1">
          You're booked with Victoire Serruys.
        </p>
        <p className="text-[15px] text-slate-600 mb-8">
          An invitation has been emailed to you.
        </p>

        <div className="flex flex-col text-base font-bold text-slate-800 space-y-0.5">
          <span>{displayDate}</span>
          <span>{time}</span>
        </div>

      </div>
    </main>
  );
}