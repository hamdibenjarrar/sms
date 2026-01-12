"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, ArrowLeft, Send } from "lucide-react"
import Link from "next/link"

interface Conversation {
  phone: string
  lastMessageAt: string
}

interface Message {
  id: number
  phone: string
  body: string
  direction: "inbound" | "outbound"
  created_at: string
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [replyText, setReplyText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/conversations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setConversations(data.conversations || [])
          if (data.conversations?.length > 0) {
            setSelectedPhone(data.conversations[0].phone)
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
    // Poll for new conversations
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [])

  // Fetch messages for selected phone
  useEffect(() => {
    if (!selectedPhone) return

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/conversations?phone=${encodeURIComponent(selectedPhone)}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setMessages(data.messages || [])
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      }
    }

    fetchMessages()
    // Poll for new messages
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [selectedPhone])

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPhone || !replyText.trim()) return

    setIsSending(true)
    try {
      const response = await fetch("/api/reply/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          phone: selectedPhone,
          message: replyText,
        }),
      })

      if (response.ok) {
        setReplyText("")
        // Refresh messages
        const messagesResponse = await fetch(`/api/conversations?phone=${encodeURIComponent(selectedPhone)}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
          },
        })
        if (messagesResponse.ok) {
          const data = await messagesResponse.json()
          setMessages(data.messages || [])
        }
      }
    } catch (error) {
      console.error("Error sending reply:", error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading conversations...</p>
              ) : conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.phone}
                    onClick={() => setSelectedPhone(conv.phone)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedPhone === conv.phone
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <p className="font-mono text-sm">{conv.phone}</p>
                    <p className="text-xs text-muted-foreground">{new Date(conv.lastMessageAt).toLocaleTimeString()}</p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedPhone ? (
              <>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedPhone}</CardTitle>
                  <CardDescription>{messages.length} messages in conversation</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col h-[600px]">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3 pb-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No messages yet</p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded ${
                              msg.direction === "outbound"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <p className="text-sm">{msg.body}</p>
                            <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply Input */}
                  <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-border">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                    />
                    <Button type="submit" disabled={isSending || !replyText.trim()} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      {isSending ? "Sending..." : "Send Reply"}
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <p>Select a conversation to view messages</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
