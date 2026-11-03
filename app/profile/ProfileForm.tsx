"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { AGE, ECON, EDUCATION, GENDER, PARTY, RACE, type Opt } from "@/lib/options";

type Profile = {
  consent_at: string | null; party: string | null; age_bracket: string | null; gender: string | null;
  race: string[] | null; economic_status: string | null; education: string | null; state: string | null;
};

function Single({ id, label, hint, opts, value, onChange }: { id: string; label: string; hint?: string; opts: Opt[]; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }} id={id}>
      <legend className="legend">{label}</legend>
      {hint && <span className="hint" style={{ marginBottom: 4 }}>{hint}</span>}
      <div className="chips">
        {opts.map((o) => (
          <button type="button" key={o.value} className="chip-opt" aria-pressed={value === o.value}
            onClick={() => onChange(value === o.value ? null : o.value)}>{o.label}</button>
        ))}
      </div>
    </fieldset>
  );
}

export default function ProfileForm({ initial }: { initial: Profile | null }) {
  const router = useRouter();
  const [p, setP] = useState<Profile>({
    consent_at: initial?.consent_at ?? null, party: initial?.party ?? null, age_bracket: initial?.age_bracket ?? null,
    gender: initial?.gender ?? null, race: initial?.race ?? [], economic_status: initial?.economic_status ?? null,
    education: initial?.education ?? null, state: initial?.state ?? null,
  });
  const [consent, setConsent] = useState(!!initial?.consent_at);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const set = (k: keyof Profile) => (v: string | null) => setP({ ...p, [k]: v });

  const toggleRace = (v: string) => {
    const cur = p.race ?? [];
    if (v === "prefer_not") return setP({ ...p, race: cur.includes(v) ? [] : ["prefer_not"] });
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur.filter((x) => x !== "prefer_not"), v];
    setP({ ...p, race: next });
  };

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(""); setMsg("");
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return router.push("/login"); }
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, ...p,
      consent_at: consent ? (p.consent_at ?? new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) setErr("Couldn't save your profile: " + error.message);
    else { setMsg("Profile saved."); router.refresh(); }
  }

  return (
    <form className="col" onSubmit={save}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p className="eyebrow">Your profile</p>
        <h1 className="title" style={{ fontSize: 40 }}>Tell us about you</h1>
        <p className="muted" style={{ margin: 0 }}>Every question is optional. Answers are used only in combined, anonymous statistics, never shown with your name or email.</p>
      </div>

      <div className="panel">
        <Single id="party" label="Which best describes you?" hint="This lets your poll answers count toward the Democrat or Republican side."
          opts={PARTY} value={p.party} onChange={set("party")} />
      </div>

      <div className="panel">
        <Single id="age" label="Age" opts={AGE} value={p.age_bracket} onChange={set("age_bracket")} />
        <Single id="gender" label="Gender" opts={GENDER} value={p.gender} onChange={set("gender")} />
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="legend">Race or ethnicity</legend>
          <span className="hint" style={{ marginBottom: 4 }}>Select all that apply.</span>
          <div className="chips">
            {RACE.map((o) => (
              <button type="button" key={o.value} className="chip-opt" aria-pressed={(p.race ?? []).includes(o.value)} onClick={() => toggleRace(o.value)}>{o.label}</button>
            ))}
          </div>
        </fieldset>
        <Single id="econ" label="Economic status" hint="How would you describe your household?" opts={ECON} value={p.economic_status} onChange={set("economic_status")} />
        <Single id="edu" label="Highest level of education completed" opts={EDUCATION} value={p.education} onChange={set("education")} />
      </div>

      <div className="panel">
        <label className="check">
          <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span><b>Include my answers in Overlap's research.</b> My poll answers and the details above may be combined with other players' answers to produce anonymous statistics and new game rounds. I can withdraw at any time. <Link href="/privacy" target="_blank">Privacy policy</Link></span>
        </label>
        <span className="hint">Without this, you can still play, take the typology quiz and answer polls, but your answers won't be counted.</span>
      </div>

      {err && <p className="error" role="alert">{err}</p>}
      {msg && <p className="ok" role="status">{msg}</p>}
      <div className="btn-row" style={{ justifyContent: "flex-start" }}>
        <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button>
        <Link className="btn btn-ghost" href="/typology">Take the typology quiz</Link>
      </div>
    </form>
  );
}
