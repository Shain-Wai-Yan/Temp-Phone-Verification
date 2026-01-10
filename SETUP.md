# SMS Receiver Dashboard Setup Guide

## Vercel Deployment (Recommended)

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click "Deploy" button or run:
   ```bash
   vercel
   ```

2. Once deployed, go to your Vercel project dashboard

### 2. Add Environment Variables in Vercel

1. Go to: Project Settings → Environment Variables
2. Add these three variables:
   - `TWILIO_PHONE_NUMBER` = Your Twilio number (e.g., "+12345163866")
   - `TWILIO_ACCOUNT_SID` = From Twilio Console
   - `TWILIO_AUTH_TOKEN` = From Twilio Console

3. Click "Save" and redeploy if needed

### 3. Configure Twilio Webhook

1. Go to your Twilio Console
2. Navigate to: Phone Numbers → Manage → Active Numbers
3. Click on your phone number
4. Scroll to "Messaging Configuration"
5. Under "A MESSAGE COMES IN":
   - Select "Webhook"
   - Enter: `https://your-app.vercel.app/api/webhook`
   - Select "HTTP POST"
6. Click "Save"

## Local Development

### 1. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Twilio details in `.env.local`

### 2. Run Development Server

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### 3. Expose Local Server (for Testing)

Use ngrok to make your local server accessible to Twilio:

```bash
npx ngrok http 3000
```

Use the ngrok URL in Twilio webhook: `https://abc123.ngrok.io/api/webhook`

## How It Works

1. SMS arrives at your Twilio number
2. Twilio sends webhook POST to `/api/webhook`
3. App saves message to `data/messages.json` (or Vercel KV in production)
4. Frontend polls `/api/messages` every 3 seconds
5. Messages display with auto-extracted verification codes

## Changing Your Twilio Number

**On Vercel:**
- Go to Project Settings → Environment Variables
- Update `TWILIO_PHONE_NUMBER`
- Redeploy or wait for auto-deployment

**Locally:**
- Edit `.env.local`
- Restart the dev server

**Important:** Always update the webhook URL in Twilio Console when you change numbers!

## Features

- Light/Dark theme toggle
- Real-time message display
- Automatic verification code extraction (4-8 digits)
- One-click copy to clipboard
- Clean, luxurious minimal interface
- Stores last 50 messages
- No database required (uses file storage)
- Vercel Analytics included

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number | `+12345163866` |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | `ACxxxxxxxxxxxxx` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `your_auth_token` |

All environment variables work seamlessly on Vercel - just add them in the dashboard!
