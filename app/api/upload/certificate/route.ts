import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const skillId = formData.get("skillId") as string

    if (!file || !skillId) {
      return NextResponse.json({ error: "Missing file or skillId" }, { status: 400 })
    }

    // Verify skill ownership
    const { data: skill, error: fetchError } = await supabase
      .from("skills")
      .select("user_id")
      .eq("id", skillId)
      .single()

    if (fetchError || skill.user_id !== user.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Convert file to base64 for storage
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // Update skill with certificate URL
    const { data, error } = await supabase.from("skills").update({ certification_file_url: dataUrl }).eq("id", skillId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Certificate uploaded successfully",
      skillId,
    })
  } catch (error) {
    console.error("[v0] Error uploading certificate:", error)
    return NextResponse.json({ error: "Failed to upload certificate" }, { status: 500 })
  }
}
