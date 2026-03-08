import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';
import { calendar } from '../../../../lib/googleCalendar';

// --- DELETE METHOD (Cancellation) ---
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;

    // VERCEL FIX: Use /tmp in production
    const isProd = process.env.NODE_ENV === 'production';
    const dataDir = isProd ? '/tmp' : path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'bookings.json');

    const fileData = await fs.readFile(filePath, 'utf8');
    let bookings = JSON.parse(fileData);

    const bookingIndex = bookings.findIndex((b: any) => b.id === bookingId);
    
    if (bookingIndex === -1) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookings[bookingIndex];

    if (booking.eventId) {
      try {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: booking.eventId,
          sendUpdates: 'none', 
        });
      } catch (calError: any) {
        console.error('⚠️ Failed to delete Google Calendar event:', calError?.message || calError);
      }
    }

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });

      const dateObj = new Date(booking.date);
      const formattedDate = dateObj.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      // VERCEL FIX: Dynamic Base URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      await transporter.sendMail({
        from: `"Tese Meeting Scheduler" <${process.env.EMAIL_USER}>`,
        to: booking.email, 
        subject: "Meeting Canceled: Victoire Serruys",
        text: `Your meeting on ${formattedDate} at ${booking.time} has been canceled.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
            <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; border-top: 4px solid #ef4444;">
              <h2 style="color: #2b3e50; text-align: center;">Meeting Canceled</h2>
              <p style="text-align: center; color: #475569;">Hi ${booking.firstName}, your meeting with Victoire Serruys has been successfully canceled.</p>
              
              <div style="text-align: center; margin-top: 20px;">
                <a href="${baseUrl}" style="background-color: #4A6478; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 13px; display: inline-block;">Schedule a New Meeting</a>
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("❌ Failed to send cancellation email:", emailError);
    }

    bookings.splice(bookingIndex, 1);
    await fs.writeFile(filePath, JSON.stringify(bookings, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: 'Booking cancelled successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}


// --- PATCH METHOD (Rescheduling) ---
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;
    const body = await request.json();
    const { date: newDate, time: newTime } = body;

    if (!newDate || !newTime) {
      return NextResponse.json({ success: false, error: 'New date and time are required.' }, { status: 400 });
    }

    // VERCEL FIX: Use /tmp in production
    const isProd = process.env.NODE_ENV === 'production';
    const dataDir = isProd ? '/tmp' : path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'bookings.json');

    const fileData = await fs.readFile(filePath, 'utf8');
    let bookings = JSON.parse(fileData);

    const bookingIndex = bookings.findIndex((b: any) => b.id === bookingId);
    
    if (bookingIndex === -1) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookings[bookingIndex];
    const timezone = booking.timezone || 'UTC';

    // 1. Update Google Calendar
    if (booking.eventId) {
      try {
        console.log(`🔄 Attempting to update Google Calendar event: ${booking.eventId}`);
        
        const startDateTime = new Date(`${newDate}T${newTime}:00`);
        const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

        await calendar.events.patch({
          calendarId: 'primary',
          eventId: booking.eventId,
          sendUpdates: 'none',
          requestBody: {
            start: { dateTime: startDateTime.toISOString(), timeZone: timezone },
            end: { dateTime: endDateTime.toISOString(), timeZone: timezone },
          }
        });
        console.log('✅ Google Calendar event updated successfully.');
      } catch (calError: any) {
        console.error('⚠️ Failed to update Google Calendar event:', calError?.message || calError);
      }
    }

    // 2. Update local JSON file
    bookings[bookingIndex] = {
      ...booking,
      date: newDate,
      time: newTime,
    };
    await fs.writeFile(filePath, JSON.stringify(bookings, null, 2), 'utf8');

    // 3. Send Reschedule Email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });

      const dateObj = new Date(newDate);
      const formattedDate = dateObj.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      const displayLink = booking.meetLink || 'Google Meet (Link pending)';

      // VERCEL FIX: Dynamic Base URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

      await transporter.sendMail({
        from: `"Tese Meeting Scheduler" <${process.env.EMAIL_USER}>`,
        to: booking.email, 
        subject: `Meeting Rescheduled: Victoire Serruys [ID: ${booking.id.substring(0, 4)}]`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
            <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; border-top: 4px solid #f59e0b; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h2 style="color: #2b3e50; text-align: center;">Meeting Rescheduled</h2>
              <p style="text-align: center; color: #475569;">Hi ${booking.firstName}, your meeting has been successfully updated.</p>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 4px 0;"><strong>New Date:</strong> ${formattedDate}</p>
                <p style="margin: 0 0 4px 0;"><strong>New Time:</strong> ${newTime} (${timezone})</p>
                <p style="margin: 0;"><strong>Location:</strong> <a href="${booking.meetLink || '#'}" style="color: #0284c7;">${displayLink}</a></p>
              </div>

              <div style="text-align: center; margin-top: 20px;">
                <a href="${baseUrl}/reschedule?bookingId=${booking.id}" style="background-color: #ff7f50; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 13px; display: inline-block; margin-right: 12px;">Reschedule Again</a>
                <a href="${baseUrl}/cancel?bookingId=${booking.id}" style="border: 1px solid #ff7f50; color: #ff7f50; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 13px; display: inline-block;">Cancel</a>
              </div>
            </div>
          </div>
        `,
      });
      console.log("✅ Custom reschedule email sent to:", booking.email);
    } catch (emailError) {
      console.error("❌ Failed to send reschedule email:", emailError);
    }

    return NextResponse.json({ success: true, message: 'Booking rescheduled successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error rescheduling booking:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}