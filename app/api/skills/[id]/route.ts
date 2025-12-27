import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, context: any) {
  const paramsObj = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
  const params = paramsObj || {}
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("skills").select("*").eq("id", params.id).single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching skill:", error)
    return NextResponse.json({ error: "Skill not found" }, { status: 404 })
  }
}

export async function PUT(request: NextRequest, context: any) {
  const paramsObj = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
  const params = paramsObj || {}
  try {
    const supabase = await createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { data: skill, error: fetchError } = await supabase
      .from("skills")
      .select("user_id")
      .eq("id", params.id)
      .single()

    if (fetchError || skill.user_id !== user.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await supabase.from("skills").update(body).eq("id", params.id)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error updating skill:", error)
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: any) {
  const paramsObj = context?.params && typeof context.params.then === 'function' ? await context.params : context?.params
  const params = paramsObj || {}
  try {
    const supabase = await createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: skill, error: fetchError } = await supabase
      .from("skills")
      .select("user_id")
      .eq("id", params.id)
      .single()

    if (fetchError || skill.user_id !== user.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase.from("skills").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting skill:", error)
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 })
  }
}
