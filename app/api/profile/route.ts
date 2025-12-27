import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Profile API GET called")
    const supabase = await createClient()

    const { data: userResponse } = await supabase.auth.getUser()
    console.log("[v0] User ID:", userResponse.user?.id)

    if (!userResponse.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("id", userResponse.user.id).single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      throw error
    }

    console.log("[v0] Profile fetched successfully for user:", userResponse.user.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("[v0] Profile API PUT called")

    let body
    try {
      body = await request.json()
      console.log("[v0] Update body:", body)
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: userResponse } = await supabase.auth.getUser()
    console.log("[v0] User ID for update:", userResponse.user?.id)

    if (!userResponse.user) {
      console.log("[v0] No user found for PUT request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allowedFields = ["full_name", "bio", "avatar_url"]
    const updateData: Record<string, any> = {}

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value
      }
    }

    console.log("[v0] Filtered update data:", updateData)

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userResponse.user.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase update error:", error)
      return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 })
    }

    console.log("[v0] Profile updated successfully:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
