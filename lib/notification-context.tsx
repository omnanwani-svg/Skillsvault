"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface NotificationContextType {
  unreadCount: number
  refreshNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshNotifications: () => {},
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const refreshNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setUnreadCount(0)
        return
      }

      // Count unread messages
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("read", false)

      setUnreadCount(count || 0)
    } catch (error) {
      console.error("[v0] Error fetching notifications:", error)
    }
  }

  useEffect(() => {
    const initializeNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setUserId(null)
        return
      }

      setUserId(user.id)
      refreshNotifications()

      // Subscribe to real-time updates
      const channel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `recipient_id=eq.${user.id}`,
          },
          () => {
            toast({
              title: "New Message",
              description: "You have received a new message",
            })
            refreshNotifications()
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "skill_requests",
            filter: `provider_id=eq.${user.id}`,
          },
          () => {
            toast({
              title: "New Request",
              description: "Someone has requested your skill",
            })
            refreshNotifications()
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "skill_requests",
            filter: `requester_id=eq.${user.id}`,
          },
          (payload: any) => {
            if (payload.new.status === "accepted") {
              toast({
                title: "Request Accepted",
                description: "Your skill request has been accepted!",
              })
            } else if (payload.new.status === "rejected") {
              toast({
                title: "Request Declined",
                description: "Your skill request was declined",
                variant: "destructive",
              })
            }
            refreshNotifications()
          },
        )
        .subscribe()

      return channel
    }

    const channelPromise = initializeNotifications()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      if (userId) {
        refreshNotifications()
      }
    }, 30000)

    return () => {
      clearInterval(interval)
      channelPromise.then((channel) => {
        if (channel) {
          supabase.removeChannel(channel)
        }
      })
    }
  }, [supabase, toast, userId])

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
