import Calendar from '@/components/Calendar';
import TimeSlotGrid from '@/components/TimeSlotGrid';

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function TimeSlotsPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const selectedDate = resolvedParams.date || '';

  const displayDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Select a date';

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex flex-col items-center pt-12 p-4 font-sans">
      
      {/* Step Indicator Header */}
      <div className="flex items-center justify-center mb-10 w-full max-w-md relative">
        <div className="absolute top-[10px] left-[50%] -translate-x-1/2 w-32 h-[2px] bg-gray-200 z-0"></div>
        <div className="flex justify-between w-48 relative z-10">
          <div className="flex flex-col items-center gap-2 bg-[#F9FAFB] px-2">
            <div className="w-5 h-5 rounded-full border-2 border-[#FF7E67] bg-[#F9FAFB] flex items-center justify-center"></div>
            <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase">CHOOSE TIME</span>
          </div>
          <div className="flex flex-col items-center gap-2 bg-[#F9FAFB] px-2">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-[#F9FAFB] flex items-center justify-center"></div>
            <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">YOUR INFO</span>
          </div>
        </div>
      </div>

      {/* Climatiq Logo & Title */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <div className="relative w-8 h-9">
          <div className="absolute top-0 left-0 w-full h-[60%] bg-[#7B8BFA] skew-y-[20deg] origin-bottom-left rounded-sm"></div>
          <div className="absolute top-[30%] left-0 w-[50%] h-[70%] bg-[#4F46E5] skew-y-[-20deg] origin-top-left rounded-sm z-10"></div>
          <div className="absolute top-[30%] right-0 w-[50%] h-[70%] bg-[#3730A3] skew-y-[20deg] origin-top-right rounded-sm"></div>
        </div>
        <span className="text-3xl font-bold text-[#111827] tracking-tight">climatiq</span>
      </div>

      {/* Main Card */}
      <div className="max-w-[850px] w-full bg-white rounded-md shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden min-h-[550px]">
        
        {/* Left Side */}
        <div className="w-full md:w-[45%]">
          <Calendar selectedDate={selectedDate} />
        </div>

        {/* Right Side */}
        <div className="w-full md:w-[55%] p-8 md:p-10 flex flex-col h-[550px]">
          <div className="mb-6 shrink-0">
            <h3 className="text-[15px] font-bold text-[#1F2937] mb-2">Meeting location</h3>
            <div className="flex items-center gap-2 text-[15px] text-gray-600">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>Google Meet</span>
            </div>
          </div>

          <div className="mb-8 shrink-0">
            <h3 className="text-[15px] font-bold text-[#1F2937] mb-2">Meeting duration</h3>
            <div className="bg-[#cbd5e1] text-[#475569] text-[13px] py-1.5 rounded-sm flex items-center justify-center w-full font-medium">
              30 mins
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-[15px] font-bold text-[#1F2937] mb-1">What time works best?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Showing times for <span className="font-bold text-[#1F2937]">{displayDate}</span>
            </p>
            
            {selectedDate ? (
              <TimeSlotGrid selectedDate={selectedDate} />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Please select a date from the calendar.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}