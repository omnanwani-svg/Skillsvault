"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function requestSkill(skillId: string, providerId: string, hoursRequested: number) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { success: false, error: "Unauthorized" }
    }

    // Validate inputs
    if (!skillId) {
      return { success: false, error: "Skill ID is required" }
    }
    if (!providerId) {
      return { success: false, error: "Provider ID is required" }
    }

    const parsedHours = Number(hoursRequested)
    if (isNaN(parsedHours) || parsedHours <= 0 || parsedHours > 168) {
      return { success: false, error: "Hours must be between 1 and 168" }
    }

    if (providerId === user.user.id) {
      return { success: false, error: "Cannot request your own skill" }
    }

    // Insert request
    const { data: requestData, error: requestError } = await supabase
      .from("skill_requests")
      .insert([
        {
          skill_id: skillId,
          requester_id: user.user.id,
          provider_id: providerId,
          hours_requested: parsedHours,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (requestError) {
      console.error("[v0] Request creation error:", requestError)
      return { success: false, error: `Failed to create request: ${requestError.message}` }
    }

    // Create notification message (non-blocking)
    try {
      await supabase.from("messages").insert({
        sender_id: user.user.id,
        recipient_id: providerId,
        content: `New skill request for ${parsedHours} hours`,
        request_id: requestData.id,
      })
    } catch (messageErr) {
      console.error("[v0] Message creation failed (non-blocking):", messageErr)
    }

    // Revalidate the dashboard page to show updated data
    revalidatePath("/dashboard")

    return { success: true, data: requestData }
  } catch (error) {
    console.error("[v0] Server action error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
