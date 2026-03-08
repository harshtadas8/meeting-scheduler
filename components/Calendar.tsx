'use client';

import { useRouter } from 'next/navigation';

interface CalendarProps {
  selectedDate?: string;
}

export default function Calendar({ selectedDate }: CalendarProps) {
  const router = useRouter();
  
  const year = 2026;
  const month = 2; // March
  const daysInMonth = 31;
  const startingEmptyCells = 6; 
  const currentDate = 7; 
  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Parse selected day from YYYY-MM-DD
  const selectedDay = selectedDate ? parseInt(selectedDate.split('-')[2], 10) : null;

  const handleDateClick = (day: number) => {
    const formattedDate = `${year}-03-${day.toString().padStart(2, '0')}`;
    router.push(`/time-slots?date=${formattedDate}`);
  };

  const isWeekend = (day: number) => {
    const dayOfWeek = (day - 1) % 7; 
    return dayOfWeek === 0 || dayOfWeek === 6; 
  };

  const isAvailable = (day: number) => day >= currentDate && !isWeekend(day);

  return (
    <div className="bg-[#4A6478] text-white p-8 md:p-10 w-full h-full flex flex-col items-center min-h-[550px]">
      
      {/* Avatar and Meeting Title */}
      <div className="flex flex-col items-center w-full">
        <div className="w-16 h-16 bg-white text-[#4A6478] rounded-full flex items-center justify-center text-2xl font-semibold mb-4 shadow-sm">
          V
        </div>
        <h2 className="text-xl font-medium text-center mb-1">Meet with Victoire Serruys</h2>
        <div className="flex items-center gap-3 mt-2 mb-8 text-sm text-gray-300">
          <button className="hover:text-white transition-colors">&lt;</button>
          <span className="font-semibold text-white text-base">March 2026</span>
          <button className="hover:text-white transition-colors">&gt;</button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full max-w-[280px]">
        <div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center text-xs font-semibold mb-4 text-gray-200 tracking-wider">
          {daysOfWeek.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-sm">
          {Array.from({ length: startingEmptyCells }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const available = isAvailable(day);
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => available && handleDateClick(day)}
                disabled={!available}
                className={`
                  flex items-center justify-center w-9 h-9 mx-auto rounded-full transition-colors text-[15px]
                  ${isSelected ? 'bg-white text-[#4A6478] font-bold' : ''}
                  ${!isSelected && available ? 'hover:bg-white/20 cursor-pointer text-white' : ''}
                  ${!available ? 'opacity-40 cursor-not-allowed text-gray-300' : ''}
                `}
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