import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth(); // Use server-side auth

  // Redirect based on authentication status
  redirect(userId ? "/dashboard" : "/sign-in");
}
