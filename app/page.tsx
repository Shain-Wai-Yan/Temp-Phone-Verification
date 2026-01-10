"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Copy, Check, RefreshCw, Smartphone } from "lucide-react"
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cleanMessageText = (text: string): string => {
    return text
      .replace(/\*\*/g, "") // Remove markdown bold
      .replace(/<#>/g, "") // Remove <#> tags
      .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace HTML entities
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim()
  }

  const fetchMessages = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      const res = await fetch("/api/messages")
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch messages")
      }

      setMessages(data.messages || [])
    } catch (err) {
      console.error("Failed to fetch messages:", err)
      setError(err instanceof Error ? err.message : "Failed to load messages")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Fetch Twilio number from config
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setTwilioNumber(data.phoneNumber))
      .catch((err) => {
        console.error("Failed to load config:", err)
        setError("Failed to load configuration")
      })

    // Poll for new messages every 5 seconds
    const interval = setInterval(() => {
      fetchMessages()
    }, 5000)

    // Initial fetch
    fetchMessages()

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

  const formatPhoneNumber = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const getMessageSource = (text: string): string => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes("discord")) return "Discord"
    if (lowerText.includes("telegram")) return "Telegram"
    if (lowerText.includes("whatsapp")) return "WhatsApp"
    if (lowerText.includes("twitter") || lowerText.includes("x.com")) return "Twitter"
    if (lowerText.includes("instagram")) return "Instagram"
    if (lowerText.includes("facebook")) return "Facebook"
    if (lowerText.includes("verification") || lowerText.includes("code")) return "Verification"
    return "SMS"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 sm:h-12 sm:w-12">
                <Smartphone className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                  SMS Receiver
                </h1>
                <p className="hidden text-xs text-muted-foreground sm:block sm:text-sm">Real-time verification codes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchMessages}
                disabled={isRefreshing}
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="sr-only">Refresh messages</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:py-12">
        {/* Phone Number Display */}
        <div className="mb-8 sm:mb-12">
          <Card className="overflow-hidden border-border/40 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm shadow-lg">
            <div className="p-6 text-center sm:p-8 lg:p-10">
              <div className="mb-4 flex justify-center">
                <div className="rounded-2xl bg-primary/10 p-4 ring-4 ring-primary/5">
                  <MessageSquare className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
                </div>
              </div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">
                Your Number
              </p>
              <h2 className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {twilioNumber ? formatPhoneNumber(twilioNumber) : "Loading..."}
              </h2>
              <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
                Send SMS to this number to receive verification codes
              </p>
            </div>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-destructive/40 bg-destructive/5">
            <div className="p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </Card>
        )}

        {/* Messages Section */}
        <div>
          <div className="mb-4 flex items-center justify-between sm:mb-6">
            <h3 className="text-lg font-semibold text-foreground sm:text-xl">Recent Messages</h3>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {messages.length}
            </span>
          </div>

          {messages.length === 0 ? (
            <Card className="border-border/40 bg-card/30 backdrop-blur-sm">
              <div className="p-8 text-center sm:p-12 lg:p-16">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-muted/50 p-6">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/50 sm:h-10 sm:w-10" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground sm:text-base">No messages received yet.</p>
                <p className="mt-2 text-xs text-muted-foreground/60 sm:text-sm">
                  Send an SMS to your number to get started.
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message) => {
                const code = extractCode(message.body)
                const cleanText = cleanMessageText(message.body)
                const source = getMessageSource(cleanText)

                return (
                  <Card
                    key={message.id}
                    className="group overflow-hidden border-border/40 bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-sm shadow-sm transition-all hover:border-border/60 hover:shadow-md"
                  >
                    <div className="p-4 sm:p-6">
                      {/* Header with source badge */}
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                              {source}
                            </span>
                            <span className="text-xs text-muted-foreground/60">•</span>
                            <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                              {formatPhoneNumber(message.from)}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        {/* Code display */}
                        {code && (
                          <div className="flex items-center gap-2">
                            <div className="rounded-xl bg-primary/15 px-4 py-2.5 ring-2 ring-primary/10 sm:px-5 sm:py-3">
                              <p className="font-mono text-xl font-bold text-primary sm:text-2xl lg:text-3xl">{code}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => copyToClipboard(code, message.id + "-code")}
                              className="h-9 w-9 shrink-0 sm:h-10 sm:w-10"
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

                      {/* Message body */}
                      <div className="group relative">
                        <div className="rounded-xl bg-muted/50 p-4 transition-colors group-hover:bg-muted/60">
                          <p className="text-pretty text-sm leading-relaxed text-foreground sm:text-base">
                            {cleanText}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(cleanText, message.id + "-text")}
                          className="absolute right-2 top-2 h-7 gap-1.5 px-2 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          {copiedId === message.id + "-text" ? (
                            <>
                              <Check className="h-3 w-3" />
                              <span className="text-xs">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="text-xs">Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-muted-foreground/60">
            Powered by Twilio • Messages refresh automatically every 5 seconds
          </p>
        </footer>
      </main>
    </div>
  )
}
