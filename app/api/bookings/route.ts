import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';

// Define the expected structure of a booking
interface Booking {
  id: string;
  firstName: string;
  surname: string;
  email: string;
  date: string;
  time: string;
  createdAt: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, surname, email, date, time } = body;

    // 1. Validate required fields
    if (!firstName || !surname || !email || !date || !time) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // 2. Create the new booking object
    const newBooking: Booking = {
      id: crypto.randomUUID(),
      firstName,
      surname,
      email,
      date,
      time,
      createdAt: new Date().toISOString(),
    };

    // Define the path to data/bookings.json
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'bookings.json');

    let bookings: Booking[] = [];

    // 3. Save booking to file
    try {
      const fileData = await fs.readFile(filePath, 'utf8');
      if (fileData) {
        bookings = JSON.parse(fileData);
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      await fs.mkdir(dataDir, { recursive: true });
    }

    bookings.push(newBooking);
    await fs.writeFile(filePath, JSON.stringify(bookings, null, 2), 'utf8');

    // 4. Simulate sending confirmation email via Ethereal
    let previewUrl = '';
    try {
      // Generate a test account on the fly
      const testAccount = await nodemailer.createTestAccount();

      // Create reusable transporter object using Ethereal SMTP
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      // Send the email
      const info = await transporter.sendMail({
        from: '"Tese Meeting Scheduler" <no-reply@tese.io>',
        to: email, 
        subject: "Meeting Confirmation: Victoire Serruys",
        text: `Your meeting has been scheduled.\n\nDate: ${date}\nTime: ${time}\nLocation: Google Meet\n\nReschedule: http://localhost:3000/reschedule?bookingId=${newBooking.id}\nCancel: http://localhost:3000/cancel?bookingId=${newBooking.id}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #4A6478; margin: 0;">Meeting Scheduled Successfully 🎉</h2>
            </div>
            
            <p style="font-size: 16px;">Hi ${firstName},</p>
            <p style="font-size: 16px;">Your meeting with Victoire Serruys has been scheduled.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${date}</p>
              <p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${time}</p>
              <p style="margin: 0;"><strong>Location:</strong> Google Meet</p>
            </div>

            <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
              Note: If you need to make changes to your meeting, you can here:
            </p>
            
            <div style="text-align: center; margin-top: 15px;">
              <a href="http://localhost:3000/reschedule?bookingId=${newBooking.id}" style="background-color: #FF7E67; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; margin-right: 10px; font-size: 14px;">Reschedule</a>
              <a href="http://localhost:3000/cancel?bookingId=${newBooking.id}" style="background-color: white; color: #FF7E67; border: 1px solid #FF7E67; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 14px;">Cancel</a>
            </div>
          </div>
        `,
      });

      // Log the preview URL
      previewUrl = nodemailer.getTestMessageUrl(info) as string;
      console.log("Email preview: %s", previewUrl);
      
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Note: We catch this error so the booking still succeeds even if the email service is down.
    }

    // 5. Return success response, now including the email preview URL
    return NextResponse.json({ 
      success: true, 
      bookingId: newBooking.id,
      previewUrl
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

