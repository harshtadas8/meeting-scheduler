"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function CancelBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');

  const [isCanceling, setIsCanceling] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

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

  const handleCancel = async () => {
    setIsCanceling(true);
    setError('');

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        setError(data.error || 'Failed to cancel booking.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsCanceling(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="text-5xl mb-4">🗑️</div>
          <h1 className="text-2xl font-bold text-[#2b3e50] mb-4">Booking Canceled</h1>
          <p className="text-gray-600 mb-8">
            Your meeting has been successfully canceled. The Google Calendar event has been removed.
          </p>
          <Link href="/" className="bg-[#4A6478] text-white px-6 py-3 rounded font-bold hover:bg-[#3b5060] transition-colors inline-block w-full">
            Schedule a New Meeting
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md w-full border border-gray-100">
        <h1 className="text-2xl font-bold text-[#2b3e50] mb-4">Cancel Meeting?</h1>
        <p className="text-gray-600 mb-8">
          Are you sure you want to cancel this meeting? This action cannot be undone.
        </p>
        
        {error && (
          <div className="text-red-600 mb-6 bg-red-50 p-3 rounded text-sm border border-red-100">
            {error}
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleCancel}
            disabled={isCanceling}
            className="w-full bg-[#ff7f50] text-white px-6 py-3 rounded font-bold hover:bg-[#ff6b3d] transition-colors disabled:opacity-70"
          >
            {isCanceling ? 'Canceling...' : 'Yes, Cancel Meeting'}
          </button>
          <button
            onClick={() => router.push('/')}
            disabled={isCanceling}
            className="w-full bg-white text-[#4A6478] border border-[#4A6478] px-6 py-3 rounded font-bold hover:bg-gray-50 transition-colors disabled:opacity-70"
          >
            No, Keep Meeting
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#4A6478]">Loading...</div>}>
      <CancelBookingContent />
    </Suspense>
  );
}