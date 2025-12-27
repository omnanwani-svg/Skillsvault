import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, context: any) {
  const paramsObj = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
  const params = paramsObj || {}
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        from_user:from_user_id(full_name, avatar_url),
        to_user:to_user_id(full_name, avatar_url)
      `,
      )
      .eq("id", params.id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching transaction:", error)
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 })
  }
}
