import { put } from "@vercel/blob"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Avatar upload API called")

    // Get authenticated user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("[v0] No user authenticated")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User ID:", user.id)

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("[v0] No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.log("[v0] Invalid file type:", file.type)
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.log("[v0] File too large:", file.size)
      return NextResponse.json({ error: "File must be less than 5MB" }, { status: 400 })
    }

    console.log("[v0] Uploading file:", file.name, file.size)

    // Convert file to buffer
    const buffer = await file.arrayBuffer()

    // Upload to Vercel Blob
    const filename = `avatars/${user.id}/${Date.now()}-${file.name}`
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: file.type,
    })

    console.log("[v0] File uploaded successfully:", blob.url)

    return NextResponse.json({ url: blob.url }, { status: 200 })
  } catch (error) {
    console.error("[v0] Avatar upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload avatar" },
      { status: 500 },
    )
  }
}
