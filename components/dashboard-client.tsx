"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { OfferSkillModal } from "@/components/offer-skill-modal"

export function DashboardClient() {
  const [showOfferModal, setShowOfferModal] = useState(false)

  return (
    <>
      <Button
        onClick={() => setShowOfferModal(true)}
        className="w-full rounded-xl shadow-lg shadow-primary/30 transition-all hover:shadow-primary/40 active:scale-95"
        size="lg"
      >
        <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Offer a Skill
      </Button>
      <Link href="/requests" className="block">
        <Button
          variant="outline"
          className="w-full rounded-xl border-border/50 bg-transparent transition-all hover:border-border active:scale-95"
          size="lg"
        >
          View Requests
        </Button>
      </Link>
      <OfferSkillModal
        open={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSuccess={() => setShowOfferModal(false)}
      />
    </>
  )
}
