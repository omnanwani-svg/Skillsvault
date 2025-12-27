import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("skills")
      .select(
        `
        id,
        title,
        category,
        description,
        hourly_rate,
        is_verified,
        verification_status,
        certification_level,
        certificate_url,
        certificate_issuer,
        certificate_id,
        demo_video_url,
        created_at,
        user_id,
        profiles!skills_user_id_fkey(full_name, email, avatar_url)
      `,
      )
      .in("verification_status", ["pending", "pending_review"])
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    const transformedData = data?.map((skill: any) => ({
      ...skill,
      hours_offered: skill.hourly_rate,
      provider_id: skill.user_id,
      profiles: skill.profiles,
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("[v0] Error fetching skills:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { skillId, isVerified } = await request.json()

    if (!skillId) {
      return NextResponse.json({ error: "Skill ID required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("skills")
      .update({
        is_verified: isVerified,
        verification_status: isVerified ? "verified" : "rejected",
      })
      .eq("id", skillId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating skill:", error)
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 })
  }
}
