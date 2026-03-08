'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface TimeSlotGridProps {
  selectedDate: string;
}

const TIMEZONES = [
  { value: 'IST', label: 'UTC +05:30 New Delhi, Mumbai, Calcutta', offset: 5.5 },
  { value: 'BST', label: 'UTC +06:00 Bishkek, Dacca, Almaty', offset: 6.0 },
  { value: 'ICT', label: 'UTC +07:00 Indochina Time, Bangkok', offset: 7.0 },
];

export default function TimeSlotGrid({ selectedDate }: TimeSlotGridProps) {
  const router = useRouter();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [activeTimezone, setActiveTimezone] = useState(TIMEZONES[0]);

  // Dynamically generate slots based on the timezone offset
  const timeSlots = useMemo(() => {
    const slots = [];
    const offsetDiff = activeTimezone.offset - 5.5; 
    let currentHour = 16 + Math.floor(offsetDiff);
    let currentMinute = (offsetDiff % 1) * 60; 

    for (let i = 0; i < 8; i++) {
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
      
      const formattedHour = currentHour.toString().padStart(2, '0');
      const formattedMinute = currentMinute.toString().padStart(2, '0');
      slots.push(`${formattedHour}:${formattedMinute}`);
      
      currentMinute += 15;
    }
    return slots;
  }, [activeTimezone]);

  const handleNext = () => {
    if (selectedTime) {
      router.push(`/booking?date=${selectedDate}&time=${selectedTime}`);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Timezone Selector */}
      <div className="mb-4 relative shrink-0">
        <select
          value={activeTimezone.value}
          onChange={(e) => {
            const tz = TIMEZONES.find(t => t.value === e.target.value);
            if (tz) setActiveTimezone(tz);
            setSelectedTime(null); // Reset selection on timezone change
          }}
          className="w-full appearance-none bg-white border border-gray-200 text-[#4A6478] text-[13px] rounded-md py-2.5 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-[#4A6478] cursor-pointer font-medium shadow-sm"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        {/* Custom Dropdown Arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#4A6478]">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>

      {/* Time Slot List (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col gap-2.5 pb-2">
          {timeSlots.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`
                w-full py-3 rounded-md border text-center transition-all duration-200 font-medium text-[15px]
                ${selectedTime === time
                    ? 'border-[#4A6478] bg-[#4A6478] text-white shadow-md'
                    : 'border-gray-200 text-[#4A6478] bg-white hover:border-[#4A6478]'
                }
              `}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Action Area: Next Button (Fixed at Bottom) */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end shrink-0">
        <button
          onClick={handleNext}
          disabled={!selectedTime}
          className={`
            px-8 py-2.5 rounded-md font-medium transition-colors shadow-sm w-full md:w-auto
            ${selectedTime 
              ? 'bg-[#4A6478] text-white hover:bg-[#3a5061] cursor-pointer' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          Next
        </button>
      </div>
      
    </div>
  );
}