'use client';

import { useRouter } from 'next/navigation';

export default function DateSelector() {
  const router = useRouter();
  
  // Specific settings for March 2026 per reference
  const year = 2026;
  const month = 2; // March (0-indexed)
  const daysInMonth = 31;
  // March 1, 2026 is a Sunday. Standard European grid starts on Monday.
  // Starting empty cells (Mon-Sat): 6
  const startingEmptyCells = 6; 
  
  // Given context date is March 7, 2026. Dates < 7 are disabled.
  const currentDate = 7; 
  
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const handleDateClick = (day: number) => {
    // Format date as YYYY-MM-DD
    const formattedDate = `${year}-03-${day.toString().padStart(2, '0')}`;
    router.push(`/time-slots?date=${formattedDate}`);
  };

  const isWeekend = (day: number) => {
    // Mar 1 is Sunday (index 0). Map days to 0-6 (Sun-Sat)
    // Formula: (starting_day_index + day - 1) % 7
    // For Mar 2026: (0 + day - 1) % 7. Sun=0, Sat=6.
    const dayOfWeek = (day - 1) % 7; 
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  };

  const isAvailable = (day: number) => {
    // Disable past dates (assuming today is Mar 7) and weekends
    return day >= currentDate && !isWeekend(day);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Month Selector Header */}
      <div className="flex items-center gap-6 mb-8 text-sm text-slate-500 font-medium">
        <button className="hover:text-slate-800 transition-colors p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <span className="font-semibold text-slate-800 text-base min-w-[110px] text-center">
          March 2026
        </span>
        <button className="hover:text-slate-800 transition-colors p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      {/* Calendar Grid Container */}
      <div className="w-full max-w-sm mx-auto">
        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-5 tracking-wider">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 text-center text-[15px]">
          {/* Empty cells before the 1st */}
          {Array.from({ length: startingEmptyCells }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {/* Active Month Days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const available = isAvailable(day);

            return (
              <button
                key={day}
                onClick={() => available && handleDateClick(day)}
                disabled={!available}
                className={`
                  flex items-center justify-center w-9 h-9 mx-auto rounded-full font-semibold transition-colors
                  ${available 
                    ? 'text-slate-800 hover:bg-[#4A6478] hover:text-white cursor-pointer' 
                    : 'text-slate-300 cursor-not-allowed'}
                `}
                aria-label={`March ${day}, 2026`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}