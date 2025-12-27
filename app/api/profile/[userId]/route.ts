import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, context: any) {
  const paramsObj = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
  const params = paramsObj || {}
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("profiles").select("*").eq("id", params.userId).single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
