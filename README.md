# 📅 Tese Meeting Scheduler

A full-stack meeting scheduling web application built for the Tese.io Software Engineering Intern Assessment. This application replicates the core booking flow of platforms like Climatiq and Calendly, allowing users to select dates, handle timezone conversions dynamically, and book 15-minute meeting slots.

**🌐 Live Demo:** https://meeting-scheduler-orcin.vercel.app

---

## ✨ Features Implemented

### Core Requirements
- **Interactive Calendar:** Displays March 2026. Automatically disables past dates and weekends to prevent invalid bookings.
- **Dynamic Time Slots:** Generates accurate 15-minute interval time slots based on the selected date.
- **Timezone Support:** Users can select their timezone (e.g., IST, BST, ICT), and the available time slots automatically convert and update.
- **Booking Form & Validation:** Captures First Name, Surname, and Email with proper error handling and loading states.
- **High-Fidelity UI:** Styled using Tailwind CSS to closely match the provided Climatiq reference design (responsive, centered cards, precise branding).

### 🚀 Bonus Features (Completed)
- **Real Google Calendar Integration:** Connects to the Google Calendar API via OAuth 2.0 to instantly drop a 30-minute event onto the host's calendar upon booking.
- **Automatic Google Meet Links:** Utilizes the Google API `conferenceData` payload to automatically generate a unique Google Meet video link for every booking.
- **Real Email Notifications:** Upgraded from the Ethereal sandbox to a real Gmail SMTP transport using Nodemailer. Sends a highly-styled HTML confirmation email to the user.
- **Reschedule & Cancel Workflows:**  
  - The confirmation email contains functional **"Reschedule"** and **"Cancel"** buttons.  
  - Built full frontend pages and backend `PATCH` / `DELETE` API routes to handle modifying or deleting the `bookings.json` record and the associated Google Calendar event.  
  - Implemented logic to prevent "time-travel" (booking past hours) when rescheduling for the current day.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)  
- **Language:** TypeScript  
- **Styling:** Tailwind CSS  
- **Backend:** Next.js Serverless API Routes  
- **Database:** Local JSON File (`fs/promises`)  
- **Integrations:** Google APIs (`googleapis`), Nodemailer

---

## ⚙️ Local Setup Instructions

Follow these instructions to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/harshtadas8/meeting-scheduler.git
cd meeting-scheduler
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add the following keys.  
(Note: You will need your own Google Cloud OAuth credentials and a Gmail App Password to test the email/calendar features locally).

```
# Google Calendar API (OAuth 2.0)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_oauth_refresh_token
GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground

# Nodemailer (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_16_char_app_password

# Application URL (Used for Reschedule/Cancel email links)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser to view the application.

---

## 🏗️ Architecture & Production Notes

### AI Collaboration
The development of this application was heavily assisted by **ChatGPT 5.3** (for architectural planning and debugging) and **Gemini 3.1 Pro** (for UI component generation and task decomposition).  
A strict and complete log of this collaborative workflow can be found in the `PROMPT_LOG.md` file located in the root of this repository.

### Serverless Storage Limitations (Vercel)
As per the assignment constraints, a local JSON file (`bookings.json`) is used as a lightweight database. Because Vercel's serverless environment has a **read-only filesystem**, the backend API is dynamically routed to read/write to Vercel's `/tmp` directory when `NODE_ENV === 'production'`.

### Note to Reviewers
Because serverless instances are stateless and frequently sleep, the `/tmp` data will periodically reset on the live Vercel deployment. This is expected behavior for this specific storage architecture.