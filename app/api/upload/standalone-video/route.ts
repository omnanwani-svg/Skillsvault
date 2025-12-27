import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    })

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let formData
    try {
      formData = await request.formData()
    } catch (err) {
      console.error("[v0] Error parsing form data:", err)
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    const file = formData.get("file") as File
    const title = formData.get("title") as string | null
    const description = formData.get("description") as string | null
    const category = formData.get("category") as string | null
    const isDemoVideo = formData.get("isDemoVideo") === "true"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!isDemoVideo && !title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size exceeds 100MB limit" }, { status: 400 })
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ error: "File must be a video" }, { status: 400 })
    }

    let blob
    try {
      console.log("[v0] Uploading video to blob storage...")
      blob = await put(`videos/${user.id}/${Date.now()}-${file.name}`, file, {
        access: "public",
      })
      console.log("[v0] Video uploaded to blob storage:", blob.url)
    } catch (err) {
      console.error("[v0] Error uploading to blob storage:", err)
      return NextResponse.json({ error: "Failed to upload video to storage" }, { status: 500 })
    }

    if (isDemoVideo) {
      console.log("[v0] Demo video uploaded successfully:", blob.url)
      return NextResponse.json({ url: blob.url }, { status: 200 })
    }

    // Create video record in database for standalone videos
    const { data: video, error } = await supabase
      .from("videos")
      .insert([
        {
          user_id: user.id,
          title,
          description,
          video_url: blob.url,
          category,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating video record:", error)
      return NextResponse.json({ error: "Failed to create video record in database" }, { status: 500 })
    }

    console.log("[v0] Standalone video created successfully:", video.id)
    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error("[v0] Error uploading video:", error)
    return NextResponse.json(
      {
        error: "Failed to upload video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
