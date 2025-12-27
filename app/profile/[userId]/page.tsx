import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { Suspense } from "react"
import { getUserProfile, getUserSkills, getUserRatings } from "@/lib/supabase/server-queries"
import { notFound, redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  bio: string | null
  time_balance: number
  total_earned: number
  total_spent: number
  created_at: string
}

interface Skill {
  id: string
  title: string
  description: string
  category: string
  is_verified: boolean
  created_at: string
}

interface Rating {
  id: string
  rating: number
  review: string | null
  created_at: string
  rater: {
    full_name: string
    avatar_url: string | null
  }
}

export default function ProfilePage({ params }: any) {
  // Render a non-blocking shell and resolve params + data inside an async child
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="py-20 text-center">Loading profile…</div>}>
          {/* ProfileContent will unwrap params and fetch data */}
          <ProfileContent params={params} />
        </Suspense>
      </div>
    </div>
  )
}

export async function ProfileContent({ params }: any) {
  // Unwrap params inside the async child (this is safe because it's inside <Suspense>)
  const resolvedParams = await params
  const userId = resolvedParams.userId as string

  if (userId === "edit") {
    redirect("/profile/edit")
  }

  try {
    const [profile, skills, ratings] = await Promise.all([
      getUserProfile(userId),
      getUserSkills(userId),
      getUserRatings(userId),
    ])

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
        },
      },
    )

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    const isOwnProfile = currentUser?.id === userId

    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0

    return (
      <>
        {/* Profile Header */}
        <Card className="mb-8 border-border/50 bg-gradient-to-br from-primary/10 to-accent/5 shadow-lg ring-1 ring-border/20">
          <CardContent className="pt-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt={profile.full_name}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <svg
                      className="h-12 w-12 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-foreground">{profile.full_name}</h1>
                  <p className="text-muted-foreground">
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </p>

                  {profile.bio && <p className="mt-3 text-foreground">{profile.bio}</p>}

                  <div className="mt-4 flex gap-2">
                    {averageRating > 0 && (
                      <Badge className="bg-accent/20 text-accent ring-1 ring-accent/30">
                        ⭐ {averageRating.toFixed(1)} ({ratings.length} reviews)
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <Link href="/profile/edit">
                  <Button className="rounded-xl shadow-lg shadow-primary/30">Edit Profile</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-border/50 bg-card shadow-lg ring-1 ring-border/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Time Balance</p>
                <p className="text-3xl font-bold text-primary">{profile.time_balance} hrs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card shadow-lg ring-1 ring-border/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-3xl font-bold text-accent">{profile.total_earned} hrs</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card shadow-lg ring-1 ring-border/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-3xl font-bold text-destructive">{profile.total_spent} hrs</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Skills Offered ({skills.length})</h2>
          {skills.length === 0 ? (
            <Card className="border-border/50 bg-card shadow-lg ring-1 ring-border/20">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No skills offered yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {skills.map((skill) => (
                <Card
                  key={skill.id}
                  className="border-border/50 bg-card shadow-lg ring-1 ring-border/20 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{skill.title}</CardTitle>
                        <Badge className="mt-2 bg-secondary/20 text-secondary-foreground ring-1 ring-secondary/30">
                          {skill.category}
                        </Badge>
                      </div>
                      {skill.is_verified && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{skill.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Ratings */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Reviews ({ratings.length})</h2>
          {ratings.length === 0 ? (
            <Card className="border-border/50 bg-card shadow-lg ring-1 ring-border/20">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No reviews yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <Card key={rating.id} className="border-border/50 bg-card shadow-lg ring-1 ring-border/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{rating.rater?.full_name}</p>
                        <div className="mt-1 flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`h-4 w-4 ${star <= rating.rating ? "fill-accent text-accent" : "fill-muted text-muted"}`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {rating.review && <p className="mt-3 text-muted-foreground">{rating.review}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </>
    )
  } catch (error) {
    console.error("Error loading profile:", error)
    notFound()
  }
}
