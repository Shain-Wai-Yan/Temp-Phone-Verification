import { NextResponse } from "next/server"

export async function GET() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !phoneNumber) {
      console.error("[v0] Missing Twilio credentials")
      return NextResponse.json({ messages: [] })
    }

    // Fetch messages from Twilio
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json?To=${encodeURIComponent(phoneNumber)}&PageSize=50`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        cache: "no-store",
      },
    )

    if (!response.ok) {
      console.error("[v0] Twilio API error:", response.status)
      return NextResponse.json({ messages: [] })
    }

    const data = await response.json()

    // Transform Twilio messages to our format
    const messages = data.messages.map((msg: any) => ({
      id: msg.sid,
      from: msg.from,
      body: msg.body,
      timestamp: msg.date_created,
    }))

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("[v0] Error fetching messages:", error)
    return NextResponse.json({ messages: [] })
  }
}
