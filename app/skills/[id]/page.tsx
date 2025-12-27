"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/client"

interface SkillDetail {
  id: string
  title: string
  description: string
  category: string
  user_id: string
  hourly_rate: number
  is_verified: boolean
  certification_level: string | null
  certification_file_url: string | null
  demo_video_url: string | null
  created_at: string
  profiles: {
    full_name: string
    avatar_url: string | null
    time_balance: number
  }
  rating?: number
  rating_count?: number
}

export default function SkillDetailPage() {
  const params = useParams()
  const router = useRouter()
  const skillId = params.id as string
  const supabase = createClient()

  const [skill, setSkill] = useState<SkillDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestHours, setRequestHours] = useState(1)
  const [requestNotes, setRequestNotes] = useState("")

  useEffect(() => {
    const loadSkill = async () => {
      try {
        const res = await fetch(`/api/skills/${skillId}`)
        if (!res.ok) throw new Error("Skill not found")
        const data = await res.json()
        setSkill(data)
      } catch (err) {
        console.error("[v0] Error:", err)
        setError("Failed to load skill details")
      } finally {
        setLoading(false)
      }
    }

    loadSkill()
  }, [skillId])

  const handleRequestSkill = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    try {
      setIsRequesting(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
        return
      }

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill_id: skillId,
          provider_id: skill?.user_id,
          hours_requested: Number(requestHours),
          notes: requestNotes || undefined,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        console.error("[v0] API Error Response:", { status: res.status, error: errorData })
        throw new Error(errorData.error || `Failed to request skill (${res.status})`)
      }

      setShowRequestModal(false)
      setRequestHours(1)
      setRequestNotes("")
      router.push("/requests")
    } catch (err) {
      console.error("[v0] Error:", err)
      alert("Failed to request this skill: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setIsRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading skill details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !skill) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error || "Skill not found"}</p>
            <Link href="/marketplace">
              <Button className="mt-4">Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/marketplace">
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
            ← Back to Marketplace
          </Button>
        </Link>

        {/* Skill Header */}
        <Card className="mb-8 border-border/50 bg-gradient-to-br from-primary/10 to-accent/5 shadow-lg ring-1 ring-border/20">
          <CardContent className="pt-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-bold text-foreground">{skill.title}</h1>
                  {skill.is_verified && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">✓ Verified</Badge>
                  )}
                  <Badge variant="secondary" className="rounded-lg bg-primary/10 text-primary">
                    {skill.category}
                  </Badge>
                </div>

                <p className="text-lg text-muted-foreground">{skill.description}</p>

                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent">
                    {skill.profiles?.avatar_url ? (
                      <img
                        src={skill.profiles.avatar_url || "/placeholder.svg"}
                        alt={skill.profiles.full_name}
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <svg
                        className="h-8 w-8 text-primary-foreground"
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
                    <Link href={`/profile/${skill.user_id}`}>
                      <p className="font-semibold text-foreground hover:text-primary transition-colors">
                        {skill.profiles?.full_name}
                      </p>
                    </Link>
                    <p className="text-sm text-muted-foreground">Skill Provider</p>
                    <p className="text-sm text-muted-foreground">{skill.profiles?.time_balance} hours available</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-lg">
                <p className="text-sm text-muted-foreground">Hourly Rate</p>
                <p className="text-4xl font-bold text-primary">{skill.hourly_rate} hrs</p>
                {skill.rating && skill.rating > 0 && (
                  <div className="mt-3 flex items-center gap-2 pb-3 border-b border-border/30">
                    <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(skill.rating ?? 0) ? "fill-accent text-accent" : "fill-muted text-muted"
                          }`}
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">{skill.rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({skill.rating_count || 0} reviews)</span>
                  </div>
                )}
                <Button
                  onClick={() => setShowRequestModal(true)}
                  disabled={isRequesting}
                  className="mt-6 w-full rounded-lg shadow-md shadow-primary/20"
                >
                  {isRequesting ? "Requesting..." : "Request Help"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {skill.rating && skill.rating > 0 && (
          <Card className="mb-8 border-border/50 bg-card shadow-lg ring-1 ring-border/20">
            <CardHeader>
              <CardTitle className="text-xl">Community Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`h-6 w-6 ${
                        star <= Math.round(skill.rating ?? 0) ? "fill-accent text-accent" : "fill-muted text-muted"
                      }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{skill.rating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Based on {skill.rating_count || 0} reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certification Section */}
        {skill.certification_level && (
          <Card className="mb-8 border-border/50 bg-card shadow-lg ring-1 ring-border/20">
            <CardHeader>
              <CardTitle className="text-xl">Certification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-sm text-muted-foreground">Certification Level</p>
                <Badge className="bg-accent/20 text-accent ring-1 ring-accent/30">{skill.certification_level}</Badge>
              </div>
              {skill.certification_file_url && (
                <a href={skill.certification_file_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full rounded-lg bg-transparent">
                    View Certificate
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Demo Video Section */}
        {skill.demo_video_url && (
          <Card className="border-border/50 bg-card shadow-lg ring-1 ring-border/20">
            <CardHeader>
              <CardTitle className="text-xl">Demo Video</CardTitle>
            </CardHeader>
            <CardContent>
              <video
                src={skill.demo_video_url}
                controls
                className="w-full rounded-lg border border-border/50 shadow-lg"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md border-border/50 shadow-2xl">
            <CardHeader>
              <CardTitle>Request Help - {skill?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestSkill} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Hours Needed</label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={requestHours}
                    onChange={(e) => setRequestHours(Number(e.target.value))}
                    className="w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Each session costs {skill?.hourly_rate} time credits per hour
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message (Optional)</label>
                  <textarea
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="Tell them about your learning goals..."
                    className="w-full rounded-lg border border-border/50 bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowRequestModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isRequesting} className="flex-1 shadow-md shadow-primary/20">
                    {isRequesting ? "Sending..." : "Send Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
