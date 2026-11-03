"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AccountActions() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [err, setErr] = useState("");
  const supabase = supabaseBrowser();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="btn-row" style={{ justifyContent: "flex-start" }}>
        <button className="btn btn-ghost" onClick={async () => { await supabase.auth.signOut(); router.push("/"); router.refresh(); }}>Sign out</button>
        {!confirming && <button className="btn btn-danger" onClick={() => setConfirming(true)}>Delete account</button>}
      </div>
      {confirming && (
        <div className="panel" style={{ borderColor: "var(--danger)" }}>
          <p style={{ margin: 0 }}><b>Delete your account and all your data?</b> Your profile, poll answers, typology results and game history are erased permanently. This can't be undone.</p>
          {err && <p className="error">{err}</p>}
          <div className="btn-row" style={{ justifyContent: "flex-start" }}>
            <button className="btn btn-danger" onClick={async () => {
              const { error } = await supabase.rpc("delete_my_account");
              if (error) return setErr("Couldn't delete your account: " + error.message);
              await supabase.auth.signOut(); router.push("/"); router.refresh();
            }}>Yes, delete everything</button>
            <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Keep my account</button>
          </div>
        </div>
      )}
    </div>
  );
}
