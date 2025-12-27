import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

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
    const { status } = body

    const { data: skillRequest, error: fetchError } = await supabase
      .from("skill_requests")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError || skillRequest.provider_id !== user.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error: updateError } = await supabase.from("skill_requests").update({ status }).eq("id", params.id)

    if (updateError) throw updateError

    if (status === "accepted") {
      // Create transaction record
      const { error: transactionError } = await supabase.from("transactions").insert({
        request_id: params.id,
        from_user_id: skillRequest.requester_id,
        to_user_id: skillRequest.provider_id,
        hours_exchanged: skillRequest.hours_requested,
        transaction_type: "skill_exchange",
        status: "completed",
      })

      if (transactionError) {
        console.error("[v0] Error creating transaction:", transactionError)
        throw transactionError
      }

      const { error: providerBalanceError } = await supabase.rpc("update_time_balance", {
        user_id: skillRequest.provider_id,
        hours_change: skillRequest.hours_requested,
      })

      if (providerBalanceError) {
        console.error("[v0] Error updating provider balance:", providerBalanceError)
        throw providerBalanceError
      }

      const { error: requesterBalanceError } = await supabase.rpc("update_time_balance", {
        user_id: skillRequest.requester_id,
        hours_change: -skillRequest.hours_requested,
      })

      if (requesterBalanceError) {
        console.error("[v0] Error updating requester balance:", requesterBalanceError)
        throw requesterBalanceError
      }
    }

    const { data: updatedRequest } = await supabase.from("skill_requests").select("*").eq("id", params.id).single()

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error("[v0] Error updating request:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
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

    const { data: skillRequest, error: fetchError } = await supabase
      .from("skill_requests")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError || (skillRequest.requester_id !== user.user.id && skillRequest.provider_id !== user.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase.from("skill_requests").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting request:", error)
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 })
  }
}
