import type { Metadata } from "next";
import Link from "next/link";
import "@fontsource/zilla-slab/500.css";
import "@fontsource/zilla-slab/700.css";
import "@fontsource/libre-franklin/400.css";
import "@fontsource/libre-franklin/600.css";
import "@fontsource/libre-franklin/700.css";
import "@fontsource/libre-franklin/800.css";
import "./globals.css";
import { Mark } from "./components/Logo";
import { supabaseServer } from "@/lib/supabase/server";


export const metadata: Metadata = {
  title: "Overlap",
  description: "A daily game: guess where Democrats and Republicans actually stand.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="en">
      <body>
        <header className="mast gutter">
          <div className="mast-in">
            <Link href="/" className="brand"><Mark />Overlap</Link>
            <nav className="nav" aria-label="Main">
              <Link href="/polls">Polls</Link>
              <Link href="/typology">Typology</Link>
              {user ? <Link href="/account">Account</Link> : <Link href="/login" className="cta">Sign in</Link>}
            </nav>
          </div>
        </header>
        <main className="gutter">{children}</main>
      </body>
    </html>
  );
}
