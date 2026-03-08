"use client";

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function RescheduleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // New state variables to handle dynamic slots
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [todayStr, setTodayStr] = useState('');

  // Dynamically generate slots based on the selected date
  useEffect(() => {
    const now = new Date();
    // Adjust for local timezone to get accurate YYYY-MM-DD
    const localToday = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    setTodayStr(localToday);

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const slots = [];
    for (let h = 9; h <= 17; h++) {
      for (let m = 0; m < 60; m += 15) {
        // If the user picked today, filter out past times
        if (date === localToday) {
          if (h < currentHour || (h === currentHour && m <= currentMinute)) {
            continue; // Skip times that have already passed
          }
        }
        
        const hour = h.toString().padStart(2, '0');
        const min = m.toString().padStart(2, '0');
        slots.push(`${hour}:${min}`);
      }
    }
    
    setTimeSlots(slots);

    // Reset the time dropdown if their previously selected time is no longer available
    setTime((prevTime) => {
      if (prevTime && !slots.includes(prevTime)) {
        return '';
      }
      return prevTime;
    });
  }, [date]);

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-100">
          <h1 className="text-2xl font-bold text-[#2b3e50] mb-4">Invalid Link</h1>
          <p className="text-gray-600 mb-6">No booking ID was provided.</p>
          <Link href="/" className="bg-[#4A6478] text-white px-6 py-2 rounded font-medium hover:bg-[#3b5060] transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, time }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        setError(data.error || 'Failed to reschedule booking.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-[#2b3e50] mb-4">Meeting Rescheduled!</h1>
          <p className="text-gray-600 mb-8">
            Your meeting has been updated. A new confirmation email has been sent to you.
          </p>
          <Link href="/" className="bg-[#4A6478] text-white px-6 py-3 rounded font-bold hover:bg-[#3b5060] transition-colors inline-block w-full">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#2b3e50] mb-2">Reschedule Meeting</h1>
          <p className="text-gray-600">Select a new date and time for your meeting.</p>
        </div>
        
        {error && (
          <div className="text-red-600 mb-6 bg-red-50 p-3 rounded text-sm border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleReschedule} className="space-y-5">
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-[#4A6478] mb-1">
              New Date
            </label>
            <input
              type="date"
              id="date"
              required
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A6478] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-semibold text-[#4A6478] mb-1">
              New Time
            </label>
            <select
              id="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A6478] focus:border-transparent bg-white"
            >
              <option value="" disabled>Select a time</option>
              {timeSlots.length === 0 ? (
                <option value="" disabled>No more slots available today</option>
              ) : (
                timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="pt-4 flex flex-col space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || !date || !time}
              className="w-full bg-[#ff7f50] text-white px-6 py-3 rounded font-bold hover:bg-[#ff6b3d] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Confirm Reschedule'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="w-full bg-white text-[#4A6478] border border-[#4A6478] px-6 py-3 rounded font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReschedulePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#4A6478]">Loading...</div>}>
      <RescheduleContent />
    </Suspense>
  );
}