"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SendSMS() {
  const [campaignName, setCampaignName] = useState("")
  const [message, setMessage] = useState("")
  const [recipients, setRecipients] = useState("")
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth-token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  const charCount = message.length
  const segments = Math.ceil((message.length || 160) / 160)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Parse recipients - could be single number or CSV
      const recipientList = recipients
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((phone) => ({ phone }))

      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          campaignName,
          messageTemplate: message,
          recipients: recipientList,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Campaign sent:", data)
        // Reset form
        setCampaignName("")
        setMessage("")
        setRecipients("")
        alert(`Campaign sent successfully! ${data.messageCount} messages queued.`)
      } else {
        alert("Failed to send campaign")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error sending campaign")
    } finally {
      setIsLoading(false)
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
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Send SMS Campaign
            </CardTitle>
            <CardDescription>Create and send SMS messages to your recipients</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  placeholder="e.g., Q4 2024 Promotion"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your message here. Use {{variable}} for personalization."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Characters: {charCount}</span>
                  <span>Segments: {segments}</span>
                </div>
              </div>

              {/* Recipients */}
              <div className="space-y-2">
                <Label htmlFor="recipients">Recipients</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  One phone number per line (E.164 format: +1234567890)
                </p>
                <Textarea
                  id="recipients"
                  placeholder="+1234567890&#10;+1987654321"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {recipients.split("\n").filter((x) => x.trim()).length} recipients
                </p>
              </div>

              {/* CSV Upload */}
              <div className="space-y-2">
                <Label htmlFor="csv">Or Upload CSV (Name, Phone)</Label>
                <Input id="csv" type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files?.[0] || null)} />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading || !campaignName || !message || !recipients}>
                  {isLoading ? "Sending..." : "Send Campaign"}
                </Button>
                <Button type="button" variant="outline" disabled={isLoading}>
                  Send Test SMS
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Message Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-card border border-border rounded p-4 text-sm">
              {message || "Your message will appear here..."}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
