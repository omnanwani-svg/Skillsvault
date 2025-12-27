import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

function verifyCertificate(certificateUrl?: string, certificateIssuer?: string, demoVideoUrl?: string): string {
  // If no certificate or video, status is pending
  if (!certificateUrl && !demoVideoUrl) {
    return "pending"
  }

  // If certificate URL is provided, check if it contains the issuer name
  if (certificateUrl && certificateIssuer) {
    const url = certificateUrl.toLowerCase()
    const issuer = certificateIssuer.toLowerCase()

    // List of trusted issuers
    const trustedIssuers = [
      "coursera",
      "linkedin",
      "google",
      "udemy",
      "edx",
      "microsoft",
      "aws",
      "ibm",
      "meta",
      "facebook",
    ]

    // Check if URL contains the issuer name
    if (url.includes(issuer)) {
      // Check if it's a trusted issuer
      const isTrusted = trustedIssuers.some((trusted) => issuer.includes(trusted) || url.includes(trusted))

      if (isTrusted) {
        return "auto_verified"
      }
    }
  }

  // If certificate or video exists but doesn't meet auto-verify criteria
  if (certificateUrl || demoVideoUrl) {
    return "pending_review"
  }

  return "pending"
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let query = supabase.from("skills").select("*")

    if (category) {
      query = query.eq("category", category)
    }

    const { data: skills, error } = await query

    if (error) throw error

    const userIds = [...new Set(skills?.map((skill: any) => skill.user_id) || [])]

    const { data: profiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds)

    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])

    const transformedData = skills?.map((skill: any) => {
      const profile = profileMap.get(skill.user_id)

      return {
        id: skill.id,
        title: skill.title,
        description: skill.description,
        category: skill.category,
        hoursOffered: skill.hourly_rate || 1,
        certification: skill.certification_level,
        demoVideoFile: skill.demo_video_url,
        demoVideoUrl: skill.demo_video_url,
        verificationStatus: skill.verification_status || (skill.is_verified ? "verified" : "pending"),
        certificateUrl: skill.certificate_url,
        certificateIssuer: skill.certificate_issuer,
        certificateId: skill.certificate_id,
        rating: 0,
        ratingCount: 0,
        userId: skill.user_id,
        userName: profile?.full_name || "Unknown User",
        avatarUrl: profile?.avatar_url || null,
        isVerified: skill.is_verified,
        createdAt: skill.created_at,
        updatedAt: skill.updated_at,
      }
    })

    return NextResponse.json(transformedData || [])
  } catch (error) {
    console.error("[v0] Error fetching skills:", error)
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      hours_offered,
      hourly_rate,
      certification,
      certificate_url,
      certificate_issuer,
      certificate_id,
      demo_video_url,
    } = body

    if (!title || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const verificationStatus = verifyCertificate(certificate_url, certificate_issuer, demo_video_url)

    console.log("[v0] Certificate verification:", {
      certificate_url,
      certificate_issuer,
      demo_video_url,
      verificationStatus,
    })

    const { data, error } = await supabase
      .from("skills")
      .insert({
        user_id: user.user.id,
        title,
        description,
        category,
        hourly_rate: hourly_rate || hours_offered || 1,
        certification_level: certification && certification !== "None" ? certification : null,
        certificate_url: certificate_url || null,
        certificate_issuer: certificate_issuer || null,
        certificate_id: certificate_id || null,
        demo_video_url: demo_video_url || null,
        verification_status: verificationStatus,
        is_verified: verificationStatus === "auto_verified",
      })
      .select()

    if (error) throw error

    return NextResponse.json(
      {
        ...data[0],
        message: "Skill uploaded successfully",
        verification_status: verificationStatus,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error creating skill:", error)
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 })
  }
}
