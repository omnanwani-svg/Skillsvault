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

    // Get stats
    const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    const { count: totalSkills } = await supabase.from("skills").select("*", { count: "exact", head: true })

    const { count: totalTransactions } = await supabase.from("transactions").select("*", { count: "exact", head: true })

    const { data: transactions } = await supabase.from("transactions").select("hours_exchanged")

    const totalHoursExchanged = transactions?.reduce((sum, t) => sum + (t.hours_exchanged || 0), 0) || 0

    const { data: ratings } = await supabase.from("ratings").select("rating")

    const averageRating =
      ratings && ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalSkills: totalSkills || 0,
      totalTransactions: totalTransactions || 0,
      totalHoursExchanged,
      averageRating: Math.round(averageRating * 10) / 10,
    })
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
