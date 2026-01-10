"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"

interface Message {
  id: string
  from: string
  body: string
  timestamp: string
  code?: string
}

export default function SMSReceiver() {
  const [messages, setMessages] = useState<Message[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [twilioNumber, setTwilioNumber] = useState<string>("")

  useEffect(() => {
    // Fetch Twilio number from config
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setTwilioNumber(data.phoneNumber))
      .catch((err) => console.error("Failed to load config:", err))

    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      fetch("/api/messages")
        .then((res) => res.json())
        .then((data) => setMessages(data.messages))
        .catch((err) => console.error("Failed to fetch messages:", err))
    }, 3000)

    // Initial fetch
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data.messages))
      .catch((err) => console.error("Failed to fetch messages:", err))

    return () => clearInterval(interval)
  }, [])

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const extractCode = (text: string): string | null => {
    // Extract 4-8 digit codes from message
    const codeMatch = text.match(/\b\d{4,8}\b/)
    return codeMatch ? codeMatch[0] : null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-light tracking-tight text-foreground">SMS Receiver</h1>
              <p className="mt-2 text-sm text-muted-foreground">Verification codes from your Twilio number</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Phone Number Display */}
        <div className="mb-12">
          <Card className="border-border/40 bg-card/50 backdrop-blur">
            <div className="p-8 text-center">
              <div className="mb-3 flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </div>
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">Your Number</p>
              <h2 className="text-3xl font-light tracking-tight text-foreground">{twilioNumber || "Loading..."}</h2>
            </div>
          </Card>
        </div>

        {/* Messages Section */}
        <div>
          <h3 className="mb-6 text-xl font-light text-foreground">Recent Messages</h3>

          {messages.length === 0 ? (
            <Card className="border-border/40 bg-card/30">
              <div className="p-12 text-center">
                <p className="text-muted-foreground">
                  No messages received yet. Send an SMS to your number to get started.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const code = extractCode(message.body)
                return (
                  <Card
                    key={message.id}
                    className="border-border/40 bg-card/50 backdrop-blur transition-all hover:border-border/60"
                  >
                    <div className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">From: {message.from}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {code && (
                          <div className="flex items-center gap-2">
                            <div className="rounded-md bg-primary/10 px-4 py-2">
                              <p className="font-mono text-2xl font-semibold text-primary">{code}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(code, message.id + "-code")}
                              className="h-10 w-10"
                            >
                              {copiedId === message.id + "-code" ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm leading-relaxed text-foreground">{message.body}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
