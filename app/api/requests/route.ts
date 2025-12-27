import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "received" or "sent"

    let query = supabase.from("skill_requests").select("*")

    if (type === "received") {
      query = query.eq("provider_id", user.user.id)
    } else if (type === "sent") {
      query = query.eq("requester_id", user.user.id)
    } else {
      query = query.or(`provider_id.eq.${user.user.id},requester_id.eq.${user.user.id}`)
    }

    const { data: requests, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    if (!requests || requests.length === 0) {
      return NextResponse.json([])
    }

    // Get unique skill IDs and user IDs
    const skillIds = [...new Set(requests.map((r) => r.skill_id))]
    const userIds = [...new Set([...requests.map((r) => r.requester_id), ...requests.map((r) => r.provider_id)])]

    // Fetch skills
    const { data: skills } = await supabase.from("skills").select("id, title").in("id", skillIds)

    // Fetch profiles
    const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds)

    // Create lookup maps
    const skillMap = new Map(skills?.map((s) => [s.id, s.title]) || [])
    const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || [])

    // Transform data to match frontend expectations
    const transformedRequests = requests.map((request) => ({
      id: request.id,
      skill_id: request.skill_id,
      skill_title: skillMap.get(request.skill_id) || "Unknown Skill",
      from_user_id: request.requester_id,
      from_user_name: profileMap.get(request.requester_id) || "Unknown User",
      to_user_id: request.provider_id,
      to_user_name: profileMap.get(request.provider_id) || "Unknown User",
      hours: request.hours_requested,
      status: request.status,
      created_at: request.created_at,
    }))

    return NextResponse.json(transformedRequests)
  } catch (error) {
    console.error("[v0] Error fetching requests:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { skill_id, provider_id, user_id, requester, hours_requested, notes } = body

    // Support multiple field names for backward compatibility
    const providerId = provider_id || user_id
    const requesterId = requester || user.user.id

    console.log("[v0] Request payload received:", JSON.stringify(body))
    console.log("[v0] Parsed values - skill_id:", skill_id, "provider_id:", providerId, "hours:", hours_requested)

    if (!skill_id) {
      return NextResponse.json({ error: "skill_id is required" }, { status: 400 })
    }
    if (!providerId) {
      return NextResponse.json({ error: "provider_id or user_id is required" }, { status: 400 })
    }

    const parsedHours = hours_requested !== undefined && hours_requested !== null ? Number(hours_requested) : 1
    if (isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 168) {
      return NextResponse.json({ error: "Hours must be a number between 1 and 168" }, { status: 400 })
    }

    if (providerId === user.user.id) {
      return NextResponse.json({ error: "Cannot request your own skill" }, { status: 400 })
    }

    const insertPayload = {
      skill_id: String(skill_id),
      requester_id: requesterId, // Use requesterId which supports backward compatibility
      provider_id: String(providerId),
      hours_requested: parsedHours,
      notes: notes || null,
      status: "pending",
    }

    console.log("[v0] Attempting insert with payload:", JSON.stringify(insertPayload))

    const { data: requestData, error: requestError } = await supabase
      .from("skill_requests")
      .insert([insertPayload])
      .select()
      .single()

    if (requestError) {
      console.error("[v0] Supabase insert error:", {
        message: requestError.message,
        details: requestError.details,
        hint: requestError.hint,
        code: requestError.code,
      })
      return NextResponse.json({ error: `Request creation failed: ${requestError.message}` }, { status: 500 })
    }

    console.log("[v0] Request created successfully with ID:", requestData.id)

    try {
      const messageContent = notes || `New skill request for ${parsedHours} hours`
      const { error: messageError } = await supabase.from("messages").insert({
        sender_id: user.user.id,
        recipient_id: providerId,
        content: messageContent,
        request_id: requestData.id,
      })

      if (messageError) {
        console.error("[v0] Message creation failed (non-blocking):", messageError.message)
      } else {
        console.log("[v0] Message notification created successfully")
      }
    } catch (messageErr) {
      console.error("[v0] Message creation exception (non-blocking):", messageErr)
    }

    return NextResponse.json({ message: "Request created successfully", request: requestData }, { status: 201 })
  } catch (error) {
    console.error("[v0] POST /api/requests error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json({ error: `Failed to create request: ${errorMessage}` }, { status: 500 })
  }
}
