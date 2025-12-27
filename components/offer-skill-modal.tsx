"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"

interface OfferSkillModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function OfferSkillModal({ open, onClose, onSuccess }: OfferSkillModalProps) {
  const router = useRouter()
  const supabase = createClient()

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } finally {
        setIsLoading(false)
      }
    }
    if (open) {
      checkAuth()
    }
  }, [open, supabase.auth])

  const handleNavigateToOffer = () => {
    onClose()
    router.push("/offer-skill")
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Offer a Skill</DialogTitle>
          <DialogDescription>Share your expertise with the community and earn time credits</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : !isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-sm text-destructive">You must be logged in to offer a skill</p>
            <Button variant="outline" className="w-full bg-transparent" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click below to open the full skill offering form where you can add certifications and demo videos.
            </p>
            <Button onClick={handleNavigateToOffer} className="w-full">
              Open Full Form
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={onClose}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
