"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { IconArrowRight, IconLock } from "@/lib/components/ui/Icons";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const search = useSearchParams();
  const error = search.get("error");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username) return;
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        username,
        callbackUrl: "/buyers",
        redirect: true,
      });
      // res is redirected by NextAuth when redirect: true
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 42,
            height: 42,
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
            <p style={{ margin: 0, color: "var(--muted)" }}>Use your demo username to continue</p>
          </div>
        </div>

        {error ? (
          <div className="card" style={{ background: "#fff6f6", borderColor: "#fecaca", marginBottom: 12 }}>
            <div style={{ color: "#991b1b", fontSize: 14 }}>Sign in failed. Please try again.</div>
          </div>
        ) : null}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="input"
              placeholder="e.g., demo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <button type="submit" disabled={loading || !username} className="btn btn-primary">
            {loading ? "Signing in..." : (<>Continue <IconArrowRight /></>)}
          </button>
        </form>

        <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)", display: "flex", justifyContent: "space-between" }}>
          <span>By continuing you agree to our terms and privacy policy.</span>
          <Link href="/login" className="btn btn-link">Back</Link>
        </div>
      </div>
    </div>
  );
}
