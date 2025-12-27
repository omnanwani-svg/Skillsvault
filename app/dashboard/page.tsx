import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { SkillCard } from "@/components/skill-card"
import { getUserDashboardData } from "@/lib/supabase/server-queries"
import { DashboardClient } from "@/components/dashboard-client"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { Suspense } from "react"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="py-20 text-center">Loading dashboard…</div>}>
          <DashboardContent />
        </Suspense>
      </div>

      {/* OfferSkillModal and VideoPreviewModal components are not needed in server-side rendering */}
    </div>
  )
}

export async function DashboardContent() {
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
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { profile, skills } = await getUserDashboardData(user.id)

  return (
    <>
      <div className="animate-fade-in-up mb-10 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 shadow-xl shadow-primary/5 ring-1 ring-primary/10 backdrop-blur-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="animate-slide-in-left">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">Welcome back, {profile?.full_name}!</h1>
            <p className="text-lg text-muted-foreground">Discover skills to learn or share your expertise with the community</p>
          </div>

          <div className="animate-scale-in animate-delay-200 flex items-center gap-4 rounded-2xl bg-card p-6 shadow-2xl shadow-accent/10 ring-1 ring-border/50 transition-all duration-300 hover:scale-105 hover:shadow-accent/20 hover:ring-accent/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/70 shadow-lg shadow-accent/30 ring-2 ring-accent/20 transition-transform duration-300 hover:rotate-12">
              <svg className="h-8 w-8 text-accent-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Your Balance</p>
              <p className="text-3xl font-bold text-foreground">{profile?.time_balance || 0} hrs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="animate-fade-in-up animate-delay-100 rounded-2xl border-border/50 bg-card shadow-lg ring-1 ring-border/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
          <CardHeader className="pb-4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/30">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <CardDescription className="text-sm text-muted-foreground">Available Skills</CardDescription>
            <CardTitle className="text-4xl font-bold tracking-tight text-card-foreground">{skills.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">In marketplace</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up animate-delay-200 rounded-2xl border-border/50 bg-card shadow-lg ring-1 ring-border/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-accent/10 hover:-translate-y-1">
          <CardHeader className="pb-4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 ring-1 ring-accent/30">
              <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <CardDescription className="text-sm text-muted-foreground">Quick Actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DashboardClient />
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up animate-delay-300 rounded-2xl border-border/50 bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-lg ring-1 ring-border/20 transition-all duration-300 hover:scale-105 hover:shadow-xl sm:col-span-2 lg:col-span-1 hover:-translate-y-1">
          <CardHeader className="pb-4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <CardDescription className="text-sm text-secondary-foreground/70">Community Impact</CardDescription>
            <CardTitle className="text-4xl font-bold tracking-tight text-secondary-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary-foreground/70">Building connections</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="animate-slide-in-left mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Skills Marketplace</h2>
            <p className="mt-1 text-base text-muted-foreground">Browse available skills from community members</p>
          </div>
        </div>

        {skills.length === 0 ? (
          <Card className="animate-scale-in rounded-2xl border-border/50 bg-card shadow-lg ring-1 ring-border/20">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-border/30">
                <svg className="h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 00-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">No skills available yet</h3>
              <p className="mb-6 text-center text-muted-foreground">Be the first to offer a skill to the community!</p>
              <Button className="rounded-xl shadow-lg shadow-primary/30 transition-all hover:shadow-primary/40 active:scale-95">Offer Your First Skill</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill, index) => (
              <div key={skill.id} style={{ animationDelay: `${index * 100}ms` }}>
                <SkillCard skill={skill} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
