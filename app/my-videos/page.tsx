"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/client"

interface Skill {
  id: string
  title: string
  description: string
  category: string
  hours_offered: number
  demo_video_file: string | null
  demo_video_url: string | null
  verification_status: string
  user_id: string
}

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  category: string
  created_at: string
  user_id: string
  is_verified: boolean // Added for verification status
}

interface User {
  id: string
  name: string
}

export default function MyVideosPage() {
  const router = useRouter()
  const supabase = createClient()

  const [skills, setSkills] = useState<Skill[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [newVideoTitle, setNewVideoTitle] = useState("")
  const [newVideoDescription, setNewVideoDescription] = useState("")
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>("")

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push("/login")
          return
        }

        // Fetch profile
        const profileRes = await fetch("/api/profile")
        if (!profileRes.ok) throw new Error("Failed to fetch profile")
        const profileData = await profileRes.json()
        setUser(profileData)

        // Fetch skills (demo videos)
        const skillsRes = await fetch("/api/skills")
        if (!skillsRes.ok) throw new Error("Failed to fetch skills")
        const skillsData = await skillsRes.json()
        const userSkills = skillsData.filter((s: Skill) => s.user_id === profileData.id && s.demo_video_file)
        setSkills(userSkills)

        // Fetch standalone videos
        const videosRes = await fetch("/api/videos")
        if (!videosRes.ok) throw new Error("Failed to fetch videos")
        const videosData = await videosRes.json()
        setVideos(videosData)
      } catch (err) {
        console.error("[v0] Error:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith("video/")) {
        setNewVideoFile(file)
        const preview = URL.createObjectURL(file)
        setVideoPreview(preview)
        setError("")
      } else {
        setError("Please select a valid video file")
      }
    }
  }

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newVideoTitle.trim()) {
      setError("Please enter a video title")
      return
    }

    if (!newVideoFile) {
      setError("Please select a video file")
      return
    }

    setUploadingVideo(true)

    try {
      const formData = new FormData()
      formData.append("file", newVideoFile)
      formData.append("title", newVideoTitle)
      formData.append("description", newVideoDescription)

      const uploadRes = await fetch("/api/upload/standalone-video", {
        method: "POST",
        body: formData,
      })

      const contentType = uploadRes.headers.get("content-type")

      if (!uploadRes.ok) {
        let errorMessage = "Failed to upload video"

        if (contentType?.includes("application/json")) {
          try {
            const errorData = await uploadRes.json()
            errorMessage = errorData.error || errorMessage
            if (errorData.details) {
              errorMessage += `: ${errorData.details}`
            }
          } catch (jsonError) {
            console.error("[v0] Error parsing error response:", jsonError)
            errorMessage = `Upload failed with status ${uploadRes.status}`
          }
        } else {
          const errorText = await uploadRes.text()
          errorMessage = `Upload failed: ${errorText.substring(0, 100)}`
        }

        throw new Error(errorMessage)
      }

      let uploadedVideo
      if (contentType?.includes("application/json")) {
        try {
          uploadedVideo = await uploadRes.json()
        } catch (jsonError) {
          console.error("[v0] Error parsing success response:", jsonError)
          throw new Error("Video uploaded but failed to parse response")
        }
      } else {
        throw new Error("Invalid response format from server")
      }

      setVideos([uploadedVideo, ...videos])

      setNewVideoTitle("")
      setNewVideoDescription("")
      setNewVideoFile(null)
      setVideoPreview("")
      setShowUploadForm(false)

      setTimeout(() => setError(""), 3000)
    } catch (err) {
      console.error("[v0] Error uploading video:", err)
      setError(err instanceof Error ? err.message : "Failed to upload video")
    } finally {
      setUploadingVideo(false)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const deleteRes = await fetch(`/api/videos/${videoId}`, {
        method: "DELETE",
      })

      if (!deleteRes.ok) throw new Error("Failed to delete video")

      setVideos(videos.filter((v) => v.id !== videoId))
    } catch (err) {
      console.error("[v0] Error:", err)
      setError("Failed to delete video")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-8">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading your videos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !showUploadForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navbar />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-8">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const totalVideos = skills.filter((s) => s.demo_video_file || s.demo_video_url).length + videos.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
      <Navbar />
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">My Videos</h1>
            <p className="mt-2 text-lg text-muted-foreground">Manage your tutorial videos and skill demos</p>
          </div>
          <Button onClick={() => setShowUploadForm(!showUploadForm)} className="rounded-xl shadow-lg shadow-primary/30">
            {showUploadForm ? "Cancel" : "Upload Video"}
          </Button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in-up">
            <CardHeader>
              <CardTitle>Upload New Video</CardTitle>
              <CardDescription>Add a tutorial or educational video</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUploadVideo} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Video Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Web Development Basics"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    disabled={uploadingVideo}
                    className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (optional)</label>
                  <textarea
                    placeholder="Describe your video..."
                    value={newVideoDescription}
                    onChange={(e) => setNewVideoDescription(e.target.value)}
                    disabled={uploadingVideo}
                    rows={3}
                    className="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Video File</label>
                  <div className="rounded-lg border-2 border-dashed border-border/50 p-6 text-center transition-all hover:border-primary/50 hover:bg-primary/5">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      disabled={uploadingVideo}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <svg
                        className="mx-auto h-12 w-12 text-muted-foreground transition-colors hover:text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="mt-2 text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">MP4, WebM, or OGG (Max 100MB)</p>
                    </label>
                  </div>
                </div>

                {videoPreview && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Preview:</p>
                    <video src={videoPreview} controls className="w-full rounded-lg border border-border/50 bg-black" />
                  </div>
                )}

                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive ring-1 ring-destructive/20">
                    {error}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowUploadForm(false)
                      setNewVideoFile(null)
                      setVideoPreview("")
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploadingVideo}
                    className="flex-1 rounded-lg shadow-lg shadow-primary/30"
                  >
                    {uploadingVideo ? "Uploading..." : "Upload Video"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {totalVideos === 0 ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No videos yet</h3>
              <p className="mt-2 text-muted-foreground">
                Upload your first tutorial video or offer a skill with a demo
              </p>
              <Button onClick={() => setShowUploadForm(true)} className="mt-4 rounded-xl">
                Upload Your First Video
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Standalone Uploaded Videos */}
            {videos.length > 0 && (
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">Tutorial Videos</h2>
                <div className="grid gap-4">
                  {videos.map((video, index) => (
                    <Card
                      key={video.id}
                      className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 lg:flex-row">
                          <div className="flex-1">
                            <div className="mb-3 flex items-start justify-between">
                              <div>
                                <CardTitle className="text-xl">{video.title}</CardTitle>
                                {video.category && (
                                  <Badge variant="secondary" className="mt-2">
                                    {video.category}
                                  </Badge>
                                )}
                              </div>
                              <Badge
                                className={`rounded-lg px-3 py-1 text-xs font-medium ${
                                  video.is_verified
                                    ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                                }`}
                              >
                                {video.is_verified ? "✓ Verified" : "⏳ Pending Review"}
                              </Badge>
                            </div>
                            {video.description && <p className="text-muted-foreground">{video.description}</p>}
                            <p className="mt-3 text-xs text-muted-foreground">
                              {new Date(video.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteVideo(video.id)}
                            className="rounded-lg"
                          >
                            Delete
                          </Button>
                        </div>
                        <video
                          src={video.video_url}
                          controls
                          className="mt-4 w-full rounded-lg border border-border/50 bg-black"
                          style={{ maxHeight: "300px" }}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Demo Videos from Skills */}
            {skills.filter((s) => s.demo_video_file || s.demo_video_url).length > 0 && (
              <div>
                <h2 className="mb-4 text-2xl font-bold text-foreground">Skill Demo Videos</h2>
                <div className="grid gap-4">
                  {skills.map(
                    (skill, index) =>
                      (skill.demo_video_file || skill.demo_video_url) && (
                        <Card
                          key={skill.id}
                          className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 animate-fade-in-up"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-xl">{skill.title}</CardTitle>
                                <CardDescription className="mt-1">{skill.category}</CardDescription>
                              </div>
                              <Badge
                                className={`rounded-lg px-3 py-1 text-xs font-medium ${
                                  skill.verification_status === "verified"
                                    ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                                    : skill.verification_status === "pending"
                                      ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                                      : "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
                                }`}
                              >
                                {skill.verification_status === "verified"
                                  ? "✓ Verified"
                                  : skill.verification_status === "pending"
                                    ? "⏳ Pending"
                                    : "✗ Rejected"}
                              </Badge>
                            </div>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            <p className="text-muted-foreground">{skill.description}</p>
                            <video
                              src={skill.demo_video_file ?? skill.demo_video_url ?? undefined}
                              controls
                              className="w-full rounded-lg border border-border/50 bg-black"
                              style={{ maxHeight: "300px" }}
                            />
                          </CardContent>
                        </Card>
                      ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
