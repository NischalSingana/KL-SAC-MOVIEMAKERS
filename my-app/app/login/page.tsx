"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) setError("Invalid credentials. Please try again.");
      else { router.push("/dashboard"); router.refresh(); }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontFamily: "var(--font-lexend), sans-serif" }}>

      {/* Full bleed video */}
      <video
        src="/api/video?key=1773256410365064.mp4"
        autoPlay loop muted playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
      />
      {/* Soft scrim */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.52)", zIndex: 1 }} />

      {/* Content — fully transparent */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 360, padding: "0 28px" }}>

        {/* Heading */}
        <div style={{ marginBottom: 52, textAlign: "center" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 14 }}>
            KL University · SAC
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 6 }}>
            Movie Makers
          </h1>
          <div style={{ width: 32, height: 2, background: "#E50914", margin: "16px auto 0" }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 36 }}>

          {/* Error */}
          {error && (
            <p style={{ fontSize: 12, fontWeight: 300, color: "#fca5a5", textAlign: "center", letterSpacing: "0.02em" }}>
              {error}
            </p>
          )}

          {/* Email */}
          <div style={{ position: "relative" }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder=" "
              id="email"
              style={{
                width: "100%", height: 44, background: "transparent", border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.25)", color: "#ffffff",
                fontSize: 14, fontWeight: 300, fontFamily: "inherit",
                letterSpacing: "0.02em", outline: "none", padding: "0", boxSizing: "border-box",
                transition: "border-color 0.25s",
              }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = "#E50914")}
              onBlur={e  => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")}
            />
            <label
              htmlFor="email"
              style={{ position: "absolute", top: email ? -18 : 12, left: 0, fontSize: email ? 10 : 14, fontWeight: email ? 500 : 400, color: email ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.75)", letterSpacing: email ? "0.18em" : "0.02em", textTransform: email ? "uppercase" : "none", transition: "all 0.2s", pointerEvents: "none" }}
            >
              Email address
            </label>
          </div>

          {/* Password */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder=" "
              id="password"
              style={{
                width: "100%", height: 44, background: "transparent", border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.25)", color: "#ffffff",
                fontSize: 14, fontWeight: 300, fontFamily: "inherit",
                letterSpacing: "0.08em", outline: "none", padding: "0 28px 0 0", boxSizing: "border-box",
                transition: "border-color 0.25s",
              }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = "#E50914")}
              onBlur={e  => (e.currentTarget.style.borderBottomColor = "rgba(255,255,255,0.25)")}
            />
            <label
              htmlFor="password"
              style={{ position: "absolute", top: password ? -18 : 12, left: 0, fontSize: password ? 10 : 14, fontWeight: password ? 500 : 400, color: password ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.75)", letterSpacing: password ? "0.18em" : "0.02em", textTransform: password ? "uppercase" : "none", transition: "all 0.2s", pointerEvents: "none" }}
            >
              Password
            </label>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(v => !v)}
              style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center" }}
            >
              {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
            </button>
          </div>

          {/* Submit */}
          <div style={{ marginTop: 8 }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%", height: 48, borderRadius: 6,
                background: "#E50914", border: "none",
                color: "#ffffff", fontSize: 12, fontWeight: 400,
                letterSpacing: "0.22em", textTransform: "uppercase",
                fontFamily: "inherit",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 0 32px rgba(229,9,20,0.3)",
                transition: "opacity 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLElement).style.boxShadow = "0 0 48px rgba(229,9,20,0.5)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px rgba(229,9,20,0.3)"; }}
            >
              {isLoading
                ? <><Loader2 style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} /> Signing in</>
                : "Sign in"
              }
            </button>

            <p style={{ textAlign: "center", marginTop: 28, fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.75)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Secured · Admin only
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
