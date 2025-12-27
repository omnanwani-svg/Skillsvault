// Real API layer using Supabase
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export const api = {
  // Auth - handled by Supabase auth directly
  logout: async () => {
    await supabase.auth.signOut()
  },

  // Skills
  getSkills: async () => {
    const { data, error } = await supabase
      .from("skills")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("is_verified", true)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  getMySkills: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  addSkill: async (skill: {
    title: string
    description: string
    category: string
    demo_video_url?: string
    certification_file_url?: string
    certification_level?: string
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("skills")
      .insert({
        user_id: user.id,
        ...skill,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  updateSkill: async (skillId: string, updates: any) => {
    const { data, error } = await supabase.from("skills").update(updates).eq("id", skillId).select().single()

    if (error) throw error
    return data
  },

  // Skill Requests
  getRequests: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("skill_requests")
      .select(
        `
        *,
        skill:skill_id(title, category),
        requester:requester_id(full_name, avatar_url),
        provider:provider_id(full_name, avatar_url)
      `,
      )
      .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  createRequest: async (skillId: string, providerId: string, hoursRequested: number, notes?: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("skill_requests")
      .insert({
        skill_id: skillId,
        requester_id: user.id,
        provider_id: providerId,
        hours_requested: hoursRequested,
        notes,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  acceptRequest: async (requestId: string) => {
    const { data, error } = await supabase
      .from("skill_requests")
      .update({ status: "accepted" })
      .eq("id", requestId)
      .select()
      .single()

    if (error) throw error

    // Create transaction
    if (data) {
      await supabase
        .from("transactions")
        .insert({
          request_id: requestId,
          from_user_id: data.requester_id,
          to_user_id: data.provider_id,
          hours_exchanged: data.hours_requested,
          transaction_type: "exchange",
        })
        .select()
        .single()

      // Update time balances
      await supabase.rpc("update_time_balance", {
        user_id: data.provider_id,
        hours_change: data.hours_requested,
      })

      await supabase.rpc("update_time_balance", {
        user_id: data.requester_id,
        hours_change: -data.hours_requested,
      })
    }

    return data
  },

  rejectRequest: async (requestId: string) => {
    const { data, error } = await supabase
      .from("skill_requests")
      .update({ status: "rejected" })
      .eq("id", requestId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Transactions
  getTransactions: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
        *,
        from_user:from_user_id(full_name, avatar_url),
        to_user:to_user_id(full_name, avatar_url)
      `,
      )
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  // Profile
  getProfile: async (userId?: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const targetId = userId || user.id

    const { data, error } = await supabase.from("profiles").select("*").eq("id", targetId).single()

    if (error) throw error
    return data
  },

  updateProfile: async (updates: any) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.id).select().single()

    if (error) throw error
    return data
  },

  // Ratings
  getRatings: async (userId: string) => {
    const { data, error } = await supabase
      .from("ratings")
      .select("*")
      .eq("rated_user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  },

  createRating: async (transactionId: string, ratedUserId: string, rating: number, review?: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("ratings")
      .insert({
        transaction_id: transactionId,
        rater_id: user.id,
        rated_user_id: ratedUserId,
        rating,
        review,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Messages
  getMessages: async (otherUserId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`,
      )
      .order("created_at", { ascending: true })

    if (error) throw error
    return data || []
  },

  sendMessage: async (recipientId: string, content: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },
}
