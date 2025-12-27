"use client"
import { Button } from "@/components/ui/button"

interface VideoPreviewModalProps {
  videoUrl: string
  isOpen: boolean
  onClose: () => void
}

export function VideoPreviewModal({ videoUrl, isOpen, onClose }: VideoPreviewModalProps) {
  if (!isOpen) return null

  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")
  const embedUrl = isYouTube
    ? videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")
    : videoUrl

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-card p-6 shadow-2xl ring-1 ring-border/50 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg bg-muted/50 p-2 transition-all hover:bg-muted active:scale-95"
        >
          <svg className="h-6 w-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground">Demo Video</h2>
        </div>

        <div className="relative mb-6 overflow-hidden rounded-xl bg-black/50 ring-1 ring-border/50">
          <div className="aspect-video">
            {isYouTube ? (
              <iframe
                src={embedUrl}
                title="Demo Video"
                className="h-full w-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video controls className="h-full w-full">
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>

        <Button onClick={onClose} className="w-full rounded-xl active:scale-95" size="lg">
          Close
        </Button>
      </div>
    </div>
  )
}
