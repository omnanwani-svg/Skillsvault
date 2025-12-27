"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"

interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  bio: string | null
}

export default function EditProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/profile")

        if (res.status === 401) {
          router.push("/login")
          return
        }

        if (!res.ok) {
          throw new Error("Failed to fetch profile")
        }

        const data = await res.json()

        setProfile(data)
        setFullName(data.full_name || "")
        setBio(data.bio || "")
        if (data.avatar_url) {
          setAvatarPreview(data.avatar_url)
        }
      } catch (err) {
        console.error("[v0] Error loading profile:", err)
        setError("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        setAvatarFile(file)
        const preview = URL.createObjectURL(file)
        setAvatarPreview(preview)
        setError("")
      } else {
        setError("Please select a valid image file")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)

    try {
      if (!fullName.trim()) {
        setError("Full name is required")
        return
      }

      let avatarUrl = profile?.avatar_url

      if (avatarFile) {
        try {
          const formData = new FormData()
          formData.append("file", avatarFile)

          const uploadRes = await fetch("/api/upload/avatar", {
            method: "POST",
            body: formData,
          })

          if (!uploadRes.ok) {
            throw new Error("Failed to upload avatar")
          }
          const uploadData = await uploadRes.json()
          avatarUrl = uploadData.url
        } catch (uploadError) {
          console.error("[v0] Avatar upload error:", uploadError)
          setError("Failed to upload avatar. Proceeding without avatar update.")
          avatarUrl = profile?.avatar_url
        }
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          bio: bio || null,
          avatar_url: avatarUrl,
        }),
      })

      if (!res.ok) {
        const contentType = res.headers.get("content-type")
        let errorMessage = "Failed to update profile"

        if (contentType?.includes("application/json")) {
          try {
            const errorData = await res.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            errorMessage = `Server error: ${res.status}`
          }
        }

        throw new Error(errorMessage)
      }

      setSuccess("Profile updated successfully!")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err) {
      console.error("[v0] Error updating profile:", err)
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
          <p className="mt-2 text-muted-foreground">Update your profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <Card className="border-border/50 bg-card shadow-lg ring-1 ring-border/20">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload a new profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview || "/placeholder.svg"}
                      alt="Avatar preview"
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

                <div className="flex-1">
                  <Label htmlFor="avatar" className="block cursor-pointer">
                    <div className="rounded-xl border-2 border-dashed border-border/50 p-4 text-center transition-all hover:border-primary/50 hover:bg-primary/5">
                      <svg
                        className="mx-auto h-8 w-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="mt-2 text-sm font-medium text-foreground">Click to upload</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </div>
                  </Label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={saving}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card className="border-border/50 bg-card shadow-lg ring-1 ring-border/20">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="rounded-xl border-border/50 bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={saving}
                  className="rounded-xl border-border/50 bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={saving}
                  rows={4}
                  className="rounded-xl border-border/50 bg-background/50"
                />
                <p className="text-xs text-muted-foreground">{bio.length}/500 characters</p>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive ring-1 ring-destructive/20">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-400 ring-1 ring-emerald-500/20">
              {success}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
            >
              {saving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
