import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all messages for this user
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.user.id},recipient_id.eq.${user.user.id}`)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Group by conversation
    const conversationMap = new Map()

    for (const msg of messages) {
      const otherUserId = msg.sender_id === user.user.id ? msg.recipient_id : msg.sender_id

      if (!conversationMap.has(otherUserId)) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", otherUserId).maybeSingle()

        conversationMap.set(otherUserId, {
          userId: otherUserId,
          userName: profile?.full_name || "Unknown",
          avatar: profile?.avatar_url,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unreadCount: msg.read === false && msg.recipient_id === user.user.id ? 1 : 0,
        })
      } else {
        const conv = conversationMap.get(otherUserId)
        if (msg.read === false && msg.recipient_id === user.user.id) {
          conv.unreadCount += 1
        }
      }
    }

    const conversations = Array.from(conversationMap.values())
    return NextResponse.json(conversations)
  } catch (error) {
    console.error("[v0] Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}
