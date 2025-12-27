import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const skillId = searchParams.get("skillId")

    if (!skillId) {
      return NextResponse.json({ error: "Missing skillId parameter" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("skills")
      .select("id, title, certification_level, certification_file_url, is_verified")
      .eq("id", skillId)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching certification:", error)
    return NextResponse.json({ error: "Failed to fetch certification" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { skill_id, certification_level, certification_file_url } = body

    // Verify ownership
    const { data: skill, error: fetchError } = await supabase
      .from("skills")
      .select("user_id")
      .eq("id", skill_id)
      .single()

    if (fetchError || skill.user_id !== user.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("skills")
      .update({
        certification_level,
        certification_file_url,
      })
      .eq("id", skill_id)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating certification:", error)
    return NextResponse.json({ error: "Failed to update certification" }, { status: 500 })
  }
}
