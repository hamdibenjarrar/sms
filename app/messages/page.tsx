"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ArrowLeft, Download } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Message {
  id: number
  phone: string
  body: string
  direction: "inbound" | "outbound"
  status: "queued" | "sent" | "delivered" | "failed"
  error?: string
  created_at: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/messages", {
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
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredMessages = statusFilter === "all" ? messages : messages.filter((m) => m.status === statusFilter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-blue-500/10 text-blue-400"
      case "delivered":
        return "bg-green-500/10 text-green-400"
      case "failed":
        return "bg-destructive/10 text-destructive"
      case "queued":
        return "bg-yellow-500/10 text-yellow-400"
      default:
        return "bg-muted text-muted-foreground"
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Message Logs
            </CardTitle>
            <CardDescription>Track all SMS messages sent and their delivery status</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Table */}
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading messages...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No messages found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone</TableHead>
                      <TableHead className="max-w-xs">Message</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-mono text-sm">{message.phone}</TableCell>
                        <TableCell className="max-w-xs truncate text-sm">{message.body}</TableCell>
                        <TableCell>
                          <span className="text-xs">
                            {message.direction === "outbound" ? "📤 Outbound" : "📥 Inbound"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(message.status)}`}
                          >
                            {message.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {message.error && (
                            <span className="text-xs text-destructive cursor-help" title={message.error}>
                              Error
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Summary Stats */}
            {!isLoading && filteredMessages.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{filteredMessages.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold text-green-400">
                    {filteredMessages.filter((m) => m.status === "delivered").length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Failed</p>
                  <p className="text-2xl font-bold text-destructive">
                    {filteredMessages.filter((m) => m.status === "failed").length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {filteredMessages.filter((m) => m.status === "queued" || m.status === "sent").length}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
