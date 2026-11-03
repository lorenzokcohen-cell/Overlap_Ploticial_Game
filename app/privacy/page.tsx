export const metadata = { title: "Privacy · Overlap" };

export default function Privacy() {
  return (
    <div className="col prose">
      <p className="eyebrow">Last updated November 3, 2026</p>
      <h1 className="title" style={{ fontSize: 40 }}>Privacy policy</h1>
      <p>Overlap is a daily game about how Americans see each other across party lines. This page explains what we collect and how we use it. Before launching publicly, have this policy reviewed by someone qualified, and fill in the contact details below.</p>

      <h2>What we collect</h2>
      <ul>
        <li><b>Account details:</b> your email address and a securely hashed password, managed by our authentication provider, Supabase.</li>
        <li><b>Optional profile details:</b> party identification, age range, gender, race or ethnicity, economic status and education. Every one of these is optional, and "Prefer not to say" is always available.</li>
        <li><b>Your answers:</b> poll responses, typology quiz answers and game scores.</li>
      </ul>
      <p>You can play the daily game without an account. In that case, your progress stays in your own browser and we collect nothing.</p>

      <h2>How we use it</h2>
      <ul>
        <li>To run your account: streaks, scores and your typology result.</li>
        <li><b>Only if you turn on research use in your profile:</b> to combine your answers with other players' answers and produce anonymous statistics, such as "62% of Democrats on Overlap agree." Results are shown only when at least 100 people from each party side have answered, so no one can be singled out.</li>
        <li>We never sell your data, never show your answers alongside your name or email, and never use them for political advertising or campaign targeting.</li>
      </ul>

      <h2>Important limits</h2>
      <p>Overlap's own polls come from people who chose to play. They are not a representative sample of the country, and we label them that way. The national figures in the game come from published polls by nonpartisan organizations, with a link to each source.</p>

      <h2>Your choices</h2>
      <ul>
        <li>Edit or clear any profile detail at any time.</li>
        <li>Turn off research use at any time. Your answers then stop counting in future statistics.</li>
        <li>Delete your account from the Account page. This permanently erases your profile, answers and history.</li>
      </ul>

      <h2>Age</h2>
      <p>Accounts are for people 18 and older.</p>

      <h2>Contact</h2>
      <p>Questions about your data: [add a contact email before launch].</p>
    </div>
  );
}
