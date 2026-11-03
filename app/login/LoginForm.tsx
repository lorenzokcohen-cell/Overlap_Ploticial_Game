"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setNotice(""); setBusy(true);
    const supabase = supabaseBrowser();
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next); router.refresh();
      } else if (mode === "signup") {
        if (!adult) throw new Error("You need to be 18 or older to create an account.");
        if (!terms) throw new Error("Please agree to the privacy policy to continue.");
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/profile` },
        });
        if (error) throw error;
        if (data.session) { router.push("/profile"); router.refresh(); }
        else setNotice("Check your inbox for a confirmation link. It takes you straight to your profile.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/account/password`,
        });
        if (error) throw error;
        setNotice("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="col" style={{ maxWidth: 420 }}>
      <h1 className="title" style={{ fontSize: 40 }}>
        {mode === "signin" ? "Sign in" : mode === "signup" ? "Create your account" : "Reset password"}
      </h1>
      <p className="muted" style={{ margin: 0 }}>
        {mode === "signup"
          ? "Keep your streak, find your political type, and add your voice to Overlap's polls."
          : mode === "signin" ? "Welcome back." : "We'll email you a link to set a new password."}
      </p>
      <form onSubmit={submit} className="panel">
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {mode !== "reset" && (
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" className="input" type="password" required minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password} onChange={(e) => setPassword(e.target.value)} />
            {mode === "signup" && <span className="hint">At least 8 characters.</span>}
          </div>
        )}
        {mode === "signup" && (
          <>
            <label className="check"><input id="adult" type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />I am 18 or older.</label>
            <label className="check"><input id="terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <span>I've read the <Link href="/privacy" target="_blank">privacy policy</Link>.</span></label>
          </>
        )}
        {error && <p className="error" role="alert">{error}</p>}
        {notice && <p className="ok" role="status">{notice}</p>}
        <button className="btn btn-primary" disabled={busy}>
          {busy ? "One moment…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
        </button>
      </form>
      <div className="small" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {mode !== "signin" && <button className="btn" style={{ padding: 0 }} onClick={() => setMode("signin")}>Have an account? Sign in</button>}
        {mode !== "signup" && <button className="btn" style={{ padding: 0 }} onClick={() => setMode("signup")}>New here? Create an account</button>}
        {mode === "signin" && <button className="btn" style={{ padding: 0, fontWeight: 500 }} onClick={() => setMode("reset")}>Forgot password?</button>}
      </div>
    </div>
  );
}
