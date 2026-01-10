import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || "Not configured",
  })
}
