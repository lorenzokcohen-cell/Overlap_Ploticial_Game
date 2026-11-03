import { Suspense } from "react";
import LoginForm from "./LoginForm";
export const metadata = { title: "Sign in · Overlap" };
export default function Page() {
  return <Suspense><LoginForm /></Suspense>;
}
