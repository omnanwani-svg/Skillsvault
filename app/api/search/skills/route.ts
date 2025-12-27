import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const category = searchParams.get("category")
    const minRating = searchParams.get("minRating")
    const verified = searchParams.get("verified")

    let dbQuery = supabase.from("skills").select("*, profiles:user_id(full_name, avatar_url)")

    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    if (category) {
      dbQuery = dbQuery.eq("category", category)
    }

    if (verified === "true") {
      dbQuery = dbQuery.eq("is_verified", true)
    }

    const { data, error } = await dbQuery.order("created_at", { ascending: false })

    if (error) throw error

    // Filter by rating if needed
    const results = data || []
    if (minRating) {
      const rating = Number.parseFloat(minRating)
      // This would require fetching ratings separately or storing average rating in skills table
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Error searching skills:", error)
    return NextResponse.json({ error: "Failed to search skills" }, { status: 500 })
  }
}
