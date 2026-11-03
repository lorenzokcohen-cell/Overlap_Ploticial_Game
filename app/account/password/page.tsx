"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function NewPassword() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  return (
    <div className="col" style={{ maxWidth: 420 }}>
      <h1 className="title" style={{ fontSize: 40 }}>Set a new password</h1>
      <form className="panel" onSubmit={async (e) => {
        e.preventDefault(); setErr(""); setMsg("");
        if (pw.length < 8) return setErr("Use at least 8 characters.");
        const { error } = await supabaseBrowser().auth.updateUser({ password: pw });
        if (error) setErr(error.message); else { setMsg("Password updated."); setTimeout(() => router.push("/account"), 900); }
      }}>
        <div className="field">
          <label htmlFor="pw">New password</label>
          <input id="pw" className="input" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        {err && <p className="error">{err}</p>}{msg && <p className="ok">{msg}</p>}
        <button className="btn btn-primary">Save password</button>
      </form>
    </div>
  );
}
