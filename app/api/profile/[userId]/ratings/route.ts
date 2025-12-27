import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, context: any) {
  const paramsObj = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
  const params = paramsObj || {}
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("ratings")
      .select(
        `
        *,
        rater:rater_id(full_name, avatar_url)
      `,
      )
      .eq("rated_user_id", params.userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 })
  }
}
