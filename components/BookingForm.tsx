'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  date: string;
  time: string;
}

export default function BookingForm({ date, time }: BookingFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.surname.trim() || !formData.email.trim()) {
      setError('All fields are required.');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, date, time })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      router.push(`/confirmation?bookingId=${data.bookingId}&date=${date}&time=${time}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Meeting Summary Section */}
      <div className="flex flex-col gap-2 text-[15px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1F2937]">{formattedDate} {time}</span>
          <button 
            onClick={() => router.back()}
            className="font-medium text-[#0284C7] hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          Google Meet
        </div>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-1 flex flex-col gap-1.5">
            <label htmlFor="firstName" className="text-sm font-bold text-[#1F2937]">First name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-white text-gray-900 border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-[#4A6478] focus:border-[#4A6478] w-full"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label htmlFor="surname" className="text-sm font-bold text-[#1F2937]">Surname *</label>
            <input
              type="text"
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-white text-gray-900 border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-[#4A6478] focus:border-[#4A6478] w-full"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-bold text-[#1F2937]">Your email address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className="bg-white text-gray-900 border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-[#4A6478] focus:border-[#4A6478] w-full"
          />
        </div>

        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

        <div className="flex justify-between items-center mt-2">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isLoading}
            className="px-5 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            &lt; Back
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`
              px-6 py-2 rounded-md font-medium text-white transition-colors text-sm
              ${isLoading ? 'bg-[#4A6478]/70 cursor-not-allowed' : 'bg-[#4A6478] hover:bg-[#3a5061]'}
            `}
          >
            {isLoading ? 'Confirming...' : 'Confirm'}
          </button>
        </div>
      </form>
    </div>
  );
}