"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/client"

interface AdminStats {
  totalUsers: number
  totalSkills: number
  totalTransactions: number
  totalHoursExchanged: number
  averageRating: number
}

interface User {
  id: string
  full_name: string
  email: string
  time_balance: number
  created_at: string
}

interface FlaggedContent {
  id: string
  content_type: string
  content_id: string
  reason: string
  status: string
  created_at: string
}

interface Skill {
  id: string
  title: string
  category: string
  description: string
  hours_offered: number
  is_verified: boolean
  verification_status: string
  certification_level: string | null
  certificate_url: string | null
  certificate_issuer: string | null
  certificate_id: string | null
  demo_video_url: string | null
  created_at: string
  provider_id: string
  profiles: {
    full_name: string
    email: string
    avatar_url: string | null
  }
}

interface Video {
  id: string
  title: string
  description: string
  category: string
  created_at: string
  is_verified: boolean
  user_id: string
  profiles: {
    full_name: string
    email: string
  }
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isAdmin, setIsAdmin] = useState(false)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([])
  const [pendingSkills, setPendingSkills] = useState<Skill[]>([])
  const [pendingVideos, setPendingVideos] = useState<Video[]>([])
  const [loadingSkills, setLoadingSkills] = useState(false)
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

        if (!profile?.is_admin) {
          router.push("/")
          return
        }

        setIsAdmin(true)

        const statsRes = await fetch("/api/admin/stats")
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        const usersRes = await fetch("/api/admin/users")
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData)
        }

        const flaggedRes = await fetch("/api/admin/flagged-content")
        if (flaggedRes.ok) {
          const flaggedData = await flaggedRes.json()
          setFlaggedContent(flaggedData)
        }

        const skillsRes = await fetch("/api/admin/skills")
        if (skillsRes.ok) {
          const skillsData = await skillsRes.json()
          setPendingSkills(skillsData)
        }

        const videosRes = await fetch("/api/admin/videos")
        if (videosRes.ok) {
          const videosData = await videosRes.json()
          setPendingVideos(videosData.videos || [])
        }
      } catch (err) {
        console.error("[v0] Error:", err)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [router, supabase])

  const handleApproveSkill = async (skillId: string) => {
    try {
      setLoadingSkills(true)
      const res = await fetch("/api/admin/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId, isVerified: true }),
      })

      if (res.ok) {
        setPendingSkills(pendingSkills.filter((s) => s.id !== skillId))
      }
    } catch (err) {
      console.error("[v0] Error approving skill:", err)
    } finally {
      setLoadingSkills(false)
    }
  }

  const handleRejectSkill = async (skillId: string) => {
    try {
      setLoadingSkills(true)
      const res = await fetch("/api/admin/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillId, isVerified: false }),
      })

      if (res.ok) {
        setPendingSkills(pendingSkills.filter((s) => s.id !== skillId))
      }
    } catch (err) {
      console.error("[v0] Error rejecting skill:", err)
    } finally {
      setLoadingSkills(false)
    }
  }

  const handleApproveVideo = async (videoId: string) => {
    try {
      setLoadingVideos(true)
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, action: "approve" }),
      })

      if (res.ok) {
        setPendingVideos(pendingVideos.filter((v) => v.id !== videoId))
      }
    } catch (err) {
      console.error("[v0] Error approving video:", err)
    } finally {
      setLoadingVideos(false)
    }
  }

  const handleRejectVideo = async (videoId: string) => {
    try {
      setLoadingVideos(true)
      const res = await fetch("/api/admin/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, action: "reject" }),
      })

      if (res.ok) {
        setPendingVideos(pendingVideos.filter((v) => v.id !== videoId))
      }
    } catch (err) {
      console.error("[v0] Error rejecting video:", err)
    } finally {
      setLoadingVideos(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading admin panel...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">Access denied. Admin only.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage the platform and monitor activity</p>
        </div>

        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-muted-foreground">Total Users</CardDescription>
                <CardTitle className="text-3xl font-bold text-card-foreground">{stats.totalUsers}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-muted-foreground">Total Skills</CardDescription>
                <CardTitle className="text-3xl font-bold text-card-foreground">{stats.totalSkills}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-muted-foreground">Transactions</CardDescription>
                <CardTitle className="text-3xl font-bold text-card-foreground">{stats.totalTransactions}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-muted-foreground">Hours Exchanged</CardDescription>
                <CardTitle className="text-3xl font-bold text-card-foreground">{stats.totalHoursExchanged}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-muted-foreground">Avg Rating</CardDescription>
                <CardTitle className="text-3xl font-bold text-card-foreground">
                  {stats.averageRating.toFixed(1)}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 rounded-xl p-1 shadow-lg">
            <TabsTrigger value="skills" className="rounded-lg">
              Skills
            </TabsTrigger>
            <TabsTrigger value="videos" className="rounded-lg">
              Videos
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg">
              Users
            </TabsTrigger>
            <TabsTrigger value="flagged" className="rounded-lg">
              Flagged
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="mt-8">
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Skills Verification</CardTitle>
                <CardDescription>Review and approve pending skills with certificate verification</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingSkills.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg
                      className="mb-4 h-12 w-12 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-muted-foreground">No pending skills to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSkills.map((skill) => (
                      <div key={skill.id} className="rounded-lg border border-border/50 p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{skill.title}</p>
                            <p className="text-sm text-muted-foreground">{skill.description}</p>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Category: {skill.category}</span>
                              <span className="text-muted-foreground">Hours: {skill.hours_offered}</span>
                              {skill.certification_level && (
                                <span className="text-muted-foreground">Cert: {skill.certification_level}</span>
                              )}
                            </div>

                            {(skill.certificate_url || skill.certificate_issuer || skill.certificate_id) && (
                              <div className="mt-3 rounded-md bg-muted/50 p-3">
                                <p className="mb-2 text-sm font-semibold text-foreground">Certificate Details:</p>
                                {skill.certificate_url && (
                                  <div className="mb-1 flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">URL:</span>
                                    <a
                                      href={skill.certificate_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline"
                                    >
                                      {skill.certificate_url}
                                    </a>
                                  </div>
                                )}
                                {skill.certificate_issuer && (
                                  <div className="mb-1 flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Issuer:</span>
                                    <span className="text-xs text-foreground">{skill.certificate_issuer}</span>
                                  </div>
                                )}
                                {skill.certificate_id && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">ID:</span>
                                    <span className="text-xs text-foreground">{skill.certificate_id}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {skill.demo_video_url && (
                              <div className="mt-2">
                                <a
                                  href={skill.demo_video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  View Demo Video
                                </a>
                              </div>
                            )}

                            <div className="mt-3 border-t border-border/50 pt-3">
                              <p className="text-sm font-medium text-foreground">
                                Provider: {skill.profiles.full_name}
                              </p>
                              <p className="text-xs text-muted-foreground">{skill.profiles.email}</p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              skill.verification_status === "verified"
                                ? "secondary"
                                : skill.verification_status === "auto_verified"
                                  ? "default"
                                  : "destructive"
                            }
                            className="rounded-lg"
                          >
                            {skill.verification_status || "pending"}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveSkill(skill.id)}
                            disabled={loadingSkills}
                            size="sm"
                            className="rounded-lg bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectSkill(skill.id)}
                            disabled={loadingSkills}
                            variant="destructive"
                            size="sm"
                            className="rounded-lg"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="mt-8">
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Video Verification</CardTitle>
                <CardDescription>Review and approve pending tutorial videos</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingVideos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg
                      className="mb-4 h-12 w-12 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-muted-foreground">No pending videos to review</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingVideos.map((video) => (
                      <div key={video.id} className="rounded-lg border border-border/50 p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{video.title}</p>
                            {video.description && <p className="text-sm text-muted-foreground">{video.description}</p>}
                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">Category: {video.category}</span>
                              <span className="text-muted-foreground">
                                Uploaded: {new Date(video.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-3 border-t border-border/50 pt-3">
                              <p className="text-sm font-medium text-foreground">
                                Uploader: {video.profiles.full_name}
                              </p>
                              <p className="text-xs text-muted-foreground">{video.profiles.email}</p>
                            </div>
                          </div>
                          <Badge variant="destructive" className="rounded-lg">
                            Pending
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApproveVideo(video.id)}
                            disabled={loadingVideos}
                            size="sm"
                            className="rounded-lg bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleRejectVideo(video.id)}
                            disabled={loadingVideos}
                            variant="destructive"
                            size="sm"
                            className="rounded-lg"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-8">
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage platform users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Email</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Balance</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Joined</th>
                        <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="px-4 py-3 text-foreground">{user.full_name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                          <td className="px-4 py-3">
                            <Badge variant="secondary" className="rounded-lg">
                              {user.time_balance} hrs
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flagged" className="mt-8">
            <Card className="border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Flagged Content</CardTitle>
                <CardDescription>Review and moderate flagged content</CardDescription>
              </CardHeader>
              <CardContent>
                {flaggedContent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg
                      className="mb-4 h-12 w-12 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-muted-foreground">No flagged content</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {flaggedContent.map((item) => (
                      <div key={item.id} className="rounded-lg border border-border/50 p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{item.content_type}</p>
                            <p className="text-sm text-muted-foreground">{item.reason}</p>
                          </div>
                          <Badge
                            variant={item.status === "pending" ? "destructive" : "secondary"}
                            className="rounded-lg"
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                            Approve
                          </Button>
                          <Button variant="destructive" size="sm" className="rounded-lg">
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
