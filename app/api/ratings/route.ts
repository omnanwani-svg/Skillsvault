import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("rated_user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Calculate average rating
    const averageRating = data.length > 0 ? data.reduce((sum, r) => sum + r.rating, 0) / data.length : 0

    return NextResponse.json({
      ratings: data,
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: data.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching ratings:", error)
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 })
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
    const { transaction_id, rated_user_id, rating, review } = body

    if (!transaction_id || !rated_user_id || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const { data, error } = await supabase.from("ratings").insert({
      transaction_id,
      rater_id: user.user.id,
      rated_user_id,
      rating,
      review,
    })

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating rating:", error)
    return NextResponse.json({ error: "Failed to create rating" }, { status: 500 })
  }
}
