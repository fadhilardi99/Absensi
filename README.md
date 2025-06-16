# 📚 School Attendance System

Modern attendance management system with SMS notifications.

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: Firebase Firestore
- **SMS**: Twilio
- **Icons**: Lucide React

## ⚡ Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables** (`.env.local`)
   ```env
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Twilio
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=your_number
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

## 📱 Features

- ✅ Student management
- ✅ Real-time attendance tracking
- ✅ SMS notifications to parents
- ✅ Class-based filtering
- ✅ Attendance reports
- ✅ Responsive design

## 🚢 Deploy

Deploy to Vercel by connecting your GitHub repo and adding environment variables.

## 📄 License

MIT License
