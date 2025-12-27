import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const url = request.url.split("?")[0]
      return NextResponse.redirect(`${url.replace("/auth/callback", "")}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${new URL(request.url).origin}/auth/auth-code-error`)
}
