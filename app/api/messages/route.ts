import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const MESSAGES_FILE = path.join(process.cwd(), "data", "messages.json")

export async function GET() {
  try {
    if (!existsSync(MESSAGES_FILE)) {
      return NextResponse.json({ messages: [] })
    }

    const data = await readFile(MESSAGES_FILE, "utf-8")
    const messages = JSON.parse(data)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("[v0] Error reading messages:", error)
    return NextResponse.json({ messages: [] })
  }
}
