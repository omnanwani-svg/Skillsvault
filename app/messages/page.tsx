"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  read: boolean
  created_at: string
  sender: {
    full_name: string
    avatar_url: string | null
  }
  recipient: {
    full_name: string
    avatar_url: string | null
  }
}

interface Conversation {
  userId: string
  userName: string
  avatar: string | null
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

export default function MessagesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        setCurrentUser(user)

        // Fetch conversations
        const res = await fetch("/api/messages/conversations")
        if (res.ok) {
          const data = await res.json()
          setConversations(data)
        }
      } catch (err) {
        console.error("[v0] Error:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  const handleSelectConversation = async (userId: string) => {
    setSelectedConversation(userId)
    try {
      const res = await fetch(`/api/messages/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error("[v0] Error:", err)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_id: selectedConversation,
          content: newMessage,
        }),
      })

      if (res.ok) {
        const message = await res.json()
        setMessages([...messages, message])
        setNewMessage("")
      }
    } catch (err) {
      console.error("[v0] Error:", err)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Messages</h1>
          <p className="mt-2 text-muted-foreground">Connect with community members</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Conversations List */}
          <Card className="border-border/50 bg-card shadow-lg ring-1 ring-border/20 lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>{conversations.length} active</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => handleSelectConversation(conv.userId)}
                    className={`w-full rounded-lg p-3 text-left transition-all ${
                      selectedConversation === conv.userId
                        ? "bg-primary/10 ring-1 ring-primary/30"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{conv.userName}</p>
                        <p className="truncate text-sm text-muted-foreground">{conv.lastMessage}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge className="ml-2 bg-accent text-accent-foreground">{conv.unreadCount}</Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="border-border/50 bg-card shadow-lg ring-1 ring-border/20 lg:col-span-2">
            {selectedConversation ? (
              <>
                <CardHeader className="border-b border-border/50">
                  <CardTitle>{conversations.find((c) => c.userId === selectedConversation)?.userName}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 p-0">
                  <div className="flex-1 space-y-4 overflow-y-auto p-4" style={{ maxHeight: "400px" }}>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs rounded-lg p-3 ${
                            msg.sender_id === currentUser?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="mt-1 text-xs opacity-70">{new Date(msg.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} className="border-t border-border/50 p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        disabled={sending}
                        className="rounded-lg border-border/50 bg-background/50"
                      />
                      <Button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="rounded-lg shadow-lg shadow-primary/30"
                      >
                        Send
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-20">
                <svg
                  className="mb-4 h-12 w-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
