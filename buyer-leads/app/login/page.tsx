"use client";

import Link from "next/link";
import { IconArrowRight, IconLock } from "@/lib/components/ui/Icons";

export default function LoginPage() {
  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))",
            border: "1px solid var(--border)",
          }}>
            <IconLock />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Sign in</h1>
            <p style={{ margin: 0, color: "var(--muted)" }}>Access your buyer leads dashboard</p>
          </div>
        </div>

        <div style={{ height: 8 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/auth/signin" className="btn btn-primary">
            Continue to Sign In <IconArrowRight />
          </Link>
          <Link href="/buyers" className="btn btn-outline">
            Continue (if already authenticated)
          </Link>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
          By continuing you agree to our terms and privacy policy.
        </div>
      </div>
    </div>
  );
}
