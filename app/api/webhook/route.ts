import { type NextRequest, NextResponse } from "next/server"
import { writeFile, readFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

// Store messages in a JSON file (you can replace this with a database later)
const MESSAGES_FILE = path.join(process.cwd(), "data", "messages.json")

interface Message {
  id: string
  from: string
  body: string
  timestamp: string
}

async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), "data")
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
}

async function getMessages(): Promise<Message[]> {
  try {
    if (!existsSync(MESSAGES_FILE)) {
      return []
    }
    const data = await readFile(MESSAGES_FILE, "utf-8")
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function saveMessages(messages: Message[]) {
  await ensureDataDirectory()
  await writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2))
}

export async function POST(request: NextRequest) {
  try {
    // Parse Twilio webhook data (form-encoded)
    const formData = await request.formData()

    const from = formData.get("From") as string
    const body = formData.get("Body") as string
    const messageSid = formData.get("MessageSid") as string

    console.log("[v0] Received SMS:", { from, body, messageSid })

    // Load existing messages
    const messages = await getMessages()

    // Add new message
    const newMessage: Message = {
      id: messageSid || `msg-${Date.now()}`,
      from,
      body,
      timestamp: new Date().toISOString(),
    }

    messages.unshift(newMessage) // Add to beginning

    // Keep only last 50 messages
    if (messages.length > 50) {
      messages.splice(50)
    }

    // Save messages
    await saveMessages(messages)

    console.log("[v0] Message saved successfully")

    // Respond to Twilio (empty TwiML response)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: {
        "Content-Type": "text/xml",
      },
    })
  } catch (error) {
    console.error("[v0] Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
