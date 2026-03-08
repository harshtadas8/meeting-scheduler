import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';
import { calendar, oauth2Client } from '../../../lib/googleCalendar';

interface Booking {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  date: string;
  time: string;
  timezone?: string;
  meetLink?: string;
  eventId?: string;
  createdAt: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, surname, email, date, time, timezone = 'UTC' } = body;

    if (!firstName || !surname || !email || !date || !time) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    // 1. Google Calendar API Integration
    let meetLink = '';
    let eventId = ''; 
    
    try {
      console.log('🔄 Attempting to generate Google access token...');
      try {
        const tokenResponse = await oauth2Client.getAccessToken();
        console.log('✅ Access token successfully generated:', !!tokenResponse.token);
      } catch (authError: any) {
        console.error('❌ Google Auth Error: Your refresh token is likely invalid.', authError?.message || authError);
        throw new Error('OAuth Token Refresh Failed'); 
      }

      const startDateTime = new Date(`${date}T${time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 30 * 60000);

      const event = {
        summary: `Meeting with ${firstName} ${surname}`,
        description: `Automated booking via Tese.io Meeting Scheduler.`,
        start: { dateTime: startDateTime.toISOString(), timeZone: timezone },
        end: { dateTime: endDateTime.toISOString(), timeZone: timezone },
        attendees: [{ email }],
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      };

      console.log('📅 Attempting to insert calendar event...');
      const calendarResponse = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1, 
        requestBody: event,
        sendUpdates: 'none', 
      });

      console.log('✅ Calendar event created successfully!');
      meetLink = calendarResponse.data.hangoutLink || '';
      eventId = calendarResponse.data.id || '';
    } catch (calError: any) {
      console.error('⚠️ Failed to create Google Calendar event. Details:', calError?.message || calError);
    }

    // 2. Create and Save the Booking
    const newBooking: Booking = {
      id: crypto.randomUUID(),
      firstName,
      surname,
      email,
      date,
      time,
      timezone,
      meetLink, 
      eventId, 
      createdAt: new Date().toISOString(),
    };

    // VERCEL FIX: Use /tmp in production
    const isProd = process.env.NODE_ENV === 'production';
    const dataDir = isProd ? '/tmp' : path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'bookings.json');

    let bookings: Booking[] = [];
    try {
      const fileData = await fs.readFile(filePath, 'utf8');
      if (fileData) bookings = JSON.parse(fileData);
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error;
      if (!isProd) {
        await fs.mkdir(dataDir, { recursive: true });
      }
    }

    bookings.push(newBooking);
    await fs.writeFile(filePath, JSON.stringify(bookings, null, 2), 'utf8');

    // 3. Send REAL Confirmation Email via Gmail
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      });

      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      const displayLink = meetLink || 'Google Meet (Link pending)';

      // VERCEL FIX: Dynamic Base URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      await transporter.sendMail({
        from: `"Tese Meeting Scheduler" <${process.env.EMAIL_USER}>`,
        to: email, 
        subject: `Meeting Confirmation: Victoire Serruys [ID: ${newBooking.id.substring(0, 4)}]`,
        text: `Your meeting has been scheduled.\n\nDate: ${formattedDate}\nTime: ${time} ${timezone}\nLocation: ${displayLink}\n\nReschedule: ${baseUrl}/reschedule?bookingId=${newBooking.id}\nCancel: ${baseUrl}/cancel?bookingId=${newBooking.id}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
            <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <h2 style="color: #2b3e50; text-align: center; font-size: 22px; margin-top: 0; margin-bottom: 24px;">
                New meeting booked with<br />Victoire Serruys
              </h2>

              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 64px; height: 64px; background-color: #e2e8f0; border-radius: 50%; line-height: 64px; color: #94a3b8; font-size: 32px;">
                  👤
                </div>
              </div>

              <hr style="border: none; border-top: 1px solid #f1f5f9; margin-bottom: 24px;" />

              <div style="margin-bottom: 16px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8;">Email address</p>
                <p style="margin: 0; font-size: 14px; color: #0284c7;"><a href="mailto:${email}" style="color: #0284c7; text-decoration: none;">${email}</a></p>
              </div>

              <div style="margin-bottom: 16px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8;">Date / time</p>
                <p style="margin: 0; font-size: 14px; color: #334155;">${formattedDate} ${time} (${timezone})</p>
              </div>

              <div style="margin-bottom: 32px;">
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #94a3b8;">Location</p>
                <p style="margin: 0; font-size: 14px;"><a href="${meetLink || '#'}" style="color: #0284c7; text-decoration: none;">${displayLink}</a></p>
              </div>

              <hr style="border: none; border-top: 1px solid #f1f5f9; margin-bottom: 24px;" />

              <p style="font-size: 13px; color: #475569; text-align: center; margin-bottom: 16px;">
                Note: if you need to make changes to your meeting, you can here:
              </p>
              
              <div style="text-align: center;">
                <a href="${baseUrl}/reschedule?bookingId=${newBooking.id}" style="background-color: #ff7f50; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 13px; display: inline-block; margin-right: 12px;">Reschedule</a>
                <a href="${baseUrl}/cancel?bookingId=${newBooking.id}" style="background-color: #ffffff; color: #ff7f50; border: 1px solid #ff7f50; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 13px; display: inline-block;">Cancel</a>
              </div>
            </div>
          </div>
        `,
      });

      console.log("✅ Real email successfully sent to:", email);
      
    } catch (emailError) {
      console.error("❌ Failed to send real email:", emailError);
    }

    return NextResponse.json({ 
      success: true, 
      bookingId: newBooking.id,
      meetLink: newBooking.meetLink
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}