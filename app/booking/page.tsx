import BookingForm from '@/components/BookingForm';

type Props = {
  searchParams: Promise<{ date?: string; time?: string }>;
};

export default async function BookingPage({ searchParams }: Props) {
  const resolvedParams = await searchParams;
  const date = resolvedParams.date || '';
  const time = resolvedParams.time || '';

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex flex-col items-center pt-12 p-4 font-sans">
      
      {/* Step Indicator Header */}
      <div className="flex items-center justify-center mb-10 w-full max-w-md relative">
        {/* Connecting Line */}
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

          {/* Step 2: Active */}
          <div className="flex flex-col items-center gap-2 bg-[#F9FAFB] px-2">
            <div className="w-5 h-5 rounded-full border-2 border-[#FF7E67] bg-white flex items-center justify-center">
            </div>
            <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase">YOUR INFO</span>
          </div>
        </div>
      </div>

      {/* Climatiq Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="relative w-8 h-9">
          <div className="absolute top-0 left-0 w-full h-[60%] bg-[#7B8BFA] skew-y-[20deg] origin-bottom-left rounded-sm"></div>
          <div className="absolute top-[30%] left-0 w-[50%] h-[70%] bg-[#4F46E5] skew-y-[-20deg] origin-top-left rounded-sm z-10"></div>
          <div className="absolute top-[30%] right-0 w-[50%] h-[70%] bg-[#3730A3] skew-y-[20deg] origin-top-right rounded-sm"></div>
        </div>
        <span className="text-3xl font-bold text-[#111827] tracking-tight">climatiq</span>
      </div>

      {/* Form Card */}
      <div className="max-w-[700px] w-full bg-white rounded-lg shadow-sm border border-gray-100 p-8 md:p-10">
        <h2 className="text-[22px] font-bold text-[#1F2937] mb-6">Your information</h2>
        
        {date && time ? (
          <BookingForm date={date} time={time} />
        ) : (
          <div className="text-red-500">Missing date or time parameters. Please go back and select a slot.</div>
        )}
      </div>
    </main>
  );
}