// Cache tag constants for revalidation
export const CACHE_TAGS = {
  SKILLS: "skills",
  MARKETPLACE: "marketplace",
  DASHBOARD: "dashboard",
  PROFILE: (userId: string) => `profile-${userId}`,
  PROFILE_SKILLS: (userId: string) => `profile-skills-${userId}`,
  PROFILE_RATINGS: (userId: string) => `profile-ratings-${userId}`,
} as const
