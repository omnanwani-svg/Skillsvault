// Server-side data fetching functions with caching
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

async function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
    },
  })
}

export async function getSkillsForMarketplace() {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from("skills")
    .select("*, profiles:user_id(full_name, avatar_url)")
    .eq("is_verified", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getUserDashboardData(userId: string) {
  const supabase = await createSupabaseClient()

  const [profileRes, skillsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("skills").select("*").eq("is_verified", true).order("created_at", { ascending: false }),
  ])

  if (profileRes.error) throw profileRes.error
  if (skillsRes.error) throw skillsRes.error

  return {
    profile: profileRes.data,
    skills: skillsRes.data || [],
  }
}

export async function getUserProfile(userId: string) {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) throw error
  return data
}

export async function getUserSkills(userId: string) {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function getUserRatings(userId: string) {
  const supabase = await createSupabaseClient()

  const { data, error } = await supabase
    .from("ratings")
    .select("*, rater:rater_id(full_name, avatar_url)")
    .eq("rated_user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}
