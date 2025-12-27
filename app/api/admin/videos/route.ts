import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
    },
  })

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Get all pending videos
  const { data: videos, error } = await supabase
    .from("videos")
    .select(
      `
      id,
      title,
      description,
      category,
      duration,
      video_url,
      created_at,
      is_verified,
      user_id,
      profiles:user_id (full_name, email)
    `,
    )
    .eq("is_verified", false)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ videos })
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
    },
  })

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { videoId, action, notes } = await request.json()

  if (action === "approve") {
    const { error } = await supabase
      .from("videos")
      .update({
        is_verified: true,
        is_verified_by: user.id,
        verified_at: new Date().toISOString(),
        verification_notes: notes || "",
      })
      .eq("id", videoId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: "Video approved" })
  }

  if (action === "reject") {
    const { error } = await supabase.from("videos").delete().eq("id", videoId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, message: "Video rejected and removed" })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
