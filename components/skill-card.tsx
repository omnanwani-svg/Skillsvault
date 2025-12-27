"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Skill } from "@/lib/mock-api"

interface SkillCardProps {
  skill: Skill
  onRequest?: (skill: Skill) => void
  isOwnSkill?: boolean
  onVideoPreview?: (videoUrl: string) => void
}

export function SkillCard({ skill, onRequest, isOwnSkill = false, onVideoPreview }: SkillCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 transition-all duration-300 ${
              star <= Math.round(rating) ? "fill-accent text-accent" : "fill-muted text-muted"
            }`}
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl border-border/50 bg-card shadow-lg ring-1 ring-border/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 hover:ring-primary/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-accent/0 opacity-0 transition-opacity duration-300 group-hover:opacity-5" />

      <CardHeader className="relative pb-4">
        <div className="mb-4 flex items-start justify-between">
          <Badge
            variant="secondary"
            className="rounded-lg bg-secondary/20 px-3 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-secondary/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-secondary/30"
          >
            {skill.category}
          </Badge>

          <Badge
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-all duration-300 group-hover:scale-110 ${
              skill.verificationStatus === "verified"
                ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                : skill.verificationStatus === "pending"
                  ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                  : "bg-red-500/20 text-red-400 ring-1 ring-red-500/30"
            }`}
          >
            {skill.verificationStatus === "verified"
              ? "✓ Verified"
              : skill.verificationStatus === "pending"
                ? "⏳ Pending"
                : skill.verificationStatus === "rejected"
                  ? "✗ Rejected"
                  : "⏳ Pending"}{" "}
            {/* Default to pending if undefined */}
          </Badge>
        </div>

        <CardTitle className="mb-2 text-xl font-bold tracking-tight text-card-foreground transition-colors duration-300 group-hover:text-primary">
          {skill.title}
        </CardTitle>
        <CardDescription className="leading-relaxed text-muted-foreground">{skill.description}</CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {skill.ratingCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3 ring-1 ring-border/30 transition-all duration-300 group-hover:bg-muted/50 group-hover:ring-border/50">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {renderStars(skill.rating)}
                <span className="text-sm font-bold text-foreground">{skill.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground">({skill.ratingCount} reviews)</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3 ring-1 ring-border/30 transition-all duration-300 group-hover:bg-muted/50 group-hover:ring-border/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
            <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-card-foreground">{skill.userName}</p>
            <p className="text-xs text-muted-foreground">Community Member</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-accent/10 p-3 ring-1 ring-accent/20 transition-all duration-300 group-hover:bg-accent/20 group-hover:ring-accent/40">
          <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-bold text-accent">{skill.hoursOffered} hours</span>
        </div>

        {skill.demoVideoUrl && (
          <Button
            onClick={() => onVideoPreview?.(skill.demoVideoUrl!)}
            variant="outline"
            className="w-full rounded-xl border-border/50 bg-transparent transition-all hover:border-accent hover:bg-accent/10 active:scale-95"
            size="sm"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Watch Demo
          </Button>
        )}

        <Button
          onClick={() => onRequest?.(skill)}
          className="w-full rounded-xl shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-primary/40 active:scale-95"
          size="lg"
          disabled={!!isOwnSkill}
        >
          {isOwnSkill ? "Your Skill" : "Request Help"}
        </Button>
      </CardContent>
    </Card>
  )
}
