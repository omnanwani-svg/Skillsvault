"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useNotifications } from "@/hooks/use-notifications"

const CATEGORIES = ["Technology", "Design", "Education", "Home Services", "Health & Wellness", "Arts & Crafts", "Other"]
const CERTIFICATIONS = [
  "None",
  "Bachelor's Degree",
  "Master's Degree",
  "Professional Certificate",
  "Industry Certification",
  "Self-Taught",
]

const CERTIFICATE_ISSUERS = [
  "Coursera",
  "LinkedIn Learning",
  "Google",
  "Udemy",
  "edX",
  "Microsoft",
  "AWS",
  "IBM",
  "Meta",
  "Other",
]

export default function OfferSkillPage() {
  const router = useRouter()
  const { notifySuccess, notifyError } = useNotifications()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [hours, setHours] = useState("")
  const [category, setCategory] = useState("")
  const [certification, setCertification] = useState("None")
  const [certificateUrl, setCertificateUrl] = useState("")
  const [certificateIssuer, setCertificateIssuer] = useState("")
  const [certificateId, setCertificateId] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
      } else {
        setIsAuthenticated(true)
      }
    }
    checkAuth()
  }, [router, supabase])

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith("video/")) {
        setVideoFile(file)
        const preview = URL.createObjectURL(file)
        setVideoPreview(preview)
        setError("")
      } else {
        setError("Please select a valid video file")
      }
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (!title || !description || !hours || !category) {
        setError("Please fill in all fields")
        return
      }
      if (title.length < 3) {
        setError("Title must be at least 3 characters")
        return
      }
      if (description.length < 10) {
        setError("Description must be at least 10 characters")
        return
      }
      const hoursNum = Number.parseInt(hours)
      if (isNaN(hoursNum) || hoursNum < 1 || hoursNum > 20) {
        setError("Hours must be between 1 and 20")
        return
      }
      setError("")
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!isAuthenticated) {
        setError("You must be logged in to offer a skill")
        return
      }

      const hoursNum = Number.parseInt(hours)

      let demoVideoUrl = null
      if (videoFile) {
        const formData = new FormData()
        formData.append("file", videoFile)
        formData.append("isDemoVideo", "true")

        try {
          console.log("[v0] Uploading demo video...")
          const uploadRes = await fetch("/api/upload/standalone-video", {
            method: "POST",
            body: formData,
          })

          const contentType = uploadRes.headers.get("content-type")

          if (uploadRes.ok && contentType?.includes("application/json")) {
            const uploadData = await uploadRes.json()
            demoVideoUrl = uploadData.url
            console.log("[v0] Demo video uploaded successfully:", demoVideoUrl)
          } else {
            const errorText = await uploadRes.text()
            console.error("[v0] Demo video upload failed:", uploadRes.status, errorText)
            notifyError("Failed to upload demo video")
          }
        } catch (uploadError) {
          console.error("[v0] Demo video upload error:", uploadError)
          notifyError("Failed to upload demo video")
        }
      }

      const skillRes = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          hours_offered: hoursNum,
          category,
          certification: certification !== "None" ? certification : null,
          certificate_url: certificateUrl || null,
          certificate_issuer: certificateIssuer || null,
          certificate_id: certificateId || null,
          demo_video_url: demoVideoUrl,
        }),
      })

      if (!skillRes.ok) {
        const errorData = await skillRes.json()
        throw new Error(errorData.error || "Failed to create skill")
      }

      const result = await skillRes.json()

      if (result.verification_status === "auto_verified") {
        notifySuccess("Skill created and automatically verified!")
      } else if (result.verification_status === "pending_review") {
        notifySuccess("Skill created! Your certificate is pending review.")
      } else {
        notifySuccess("Skill created successfully!")
      }

      setTitle("")
      setDescription("")
      setHours("")
      setCategory("")
      setCertification("None")
      setCertificateUrl("")
      setCertificateIssuer("")
      setCertificateId("")
      setVideoFile(null)
      setVideoPreview("")

      router.push("/dashboard")
    } catch (err) {
      console.error("[v0] Error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to offer skill. Please try again."
      setError(errorMessage)
      notifyError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Checking authentication...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Offer Your Skill</h1>
          <p className="mt-2 text-lg text-muted-foreground">Share your expertise and earn time credits</p>
        </div>

        <div className="mb-8 flex gap-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all duration-300 ${
                  s <= step
                    ? "scale-110 bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 2 && <div className={`h-1 w-12 rounded-full ${s < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Skill Details</CardTitle>
                  <CardDescription>Tell us about the skill you want to offer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Skill Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Web Development, Guitar Lessons"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={loading}
                      className="rounded-xl border-border/50 bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory} disabled={loading}>
                      <SelectTrigger id="category" className="rounded-xl border-border/50 bg-background/50">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what you can help with..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={loading}
                      rows={4}
                      className="rounded-xl border-border/50 bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours Available</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="1"
                      max="20"
                      placeholder="e.g., 5"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      disabled={loading}
                      className="rounded-xl border-border/50 bg-background/50"
                    />
                    <p className="text-xs text-muted-foreground">How many hours can you dedicate to this skill?</p>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive ring-1 ring-destructive/20">
                  {error}
                </div>
              )}

              <Button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="w-full rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                size="lg"
              >
                Next: Add Certification & Video
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Certification</CardTitle>
                  <CardDescription>Add your certification details to get verified faster</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="certification">Certification Level</Label>
                    <Select value={certification} onValueChange={setCertification} disabled={loading}>
                      <SelectTrigger id="certification" className="rounded-xl border-border/50 bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CERTIFICATIONS.map((cert) => (
                          <SelectItem key={cert} value={cert}>
                            {cert}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificateUrl">Certificate URL (Optional)</Label>
                    <Input
                      id="certificateUrl"
                      type="url"
                      placeholder="e.g., https://coursera.org/verify/ABC123"
                      value={certificateUrl}
                      onChange={(e) => setCertificateUrl(e.target.value)}
                      disabled={loading}
                      className="rounded-xl border-border/50 bg-background/50"
                    />
                    <p className="text-xs text-muted-foreground">Link to your certificate for automatic verification</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificateIssuer">Certificate Issuer (Optional)</Label>
                    <Select value={certificateIssuer} onValueChange={setCertificateIssuer} disabled={loading}>
                      <SelectTrigger id="certificateIssuer" className="rounded-xl border-border/50 bg-background/50">
                        <SelectValue placeholder="Select issuer" />
                      </SelectTrigger>
                      <SelectContent>
                        {CERTIFICATE_ISSUERS.map((issuer) => (
                          <SelectItem key={issuer} value={issuer}>
                            {issuer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificateId">Certificate ID (Optional)</Label>
                    <Input
                      id="certificateId"
                      placeholder="e.g., ABC123XYZ"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                      disabled={loading}
                      className="rounded-xl border-border/50 bg-background/50"
                    />
                    <p className="text-xs text-muted-foreground">Certificate or credential ID for verification</p>
                  </div>

                  {certificateUrl && certificateIssuer && (
                    <div className="rounded-xl bg-primary/10 p-4 text-sm ring-1 ring-primary/20">
                      <p className="font-medium text-primary">Auto-Verification Enabled</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Your certificate will be automatically verified if the URL matches the issuer
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Demo Video</CardTitle>
                  <CardDescription>Upload a video demonstrating your skill (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video">Video File</Label>
                    <div className="rounded-xl border-2 border-dashed border-border/50 p-6 text-center transition-all hover:border-primary/50 hover:bg-primary/5">
                      <input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        disabled={loading}
                        className="hidden"
                      />
                      <label htmlFor="video" className="cursor-pointer">
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

                    {videoPreview && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-foreground">Video Preview:</p>
                        <video
                          src={videoPreview}
                          controls
                          className="w-full rounded-xl border border-border/50 bg-black"
                          style={{ maxHeight: "300px" }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setVideoFile(null)
                            setVideoPreview("")
                          }}
                          className="w-full rounded-xl"
                        >
                          Remove Video
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive ring-1 ring-destructive/20">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 rounded-xl"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Offering...
                    </>
                  ) : (
                    "Offer Skill"
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
