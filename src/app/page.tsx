"use client";

import { Button } from "@/components/ui/button";
import firebase_app from "@/firebase/config";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { NextResponse } from "next/server";
import { useAuthState } from "react-firebase-hooks/auth";

const auth = getAuth(firebase_app);
export default function Home() {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if(!user) return router.push("/auth/login");
  return (
    <div>
      <h1>Welcome to Money Manager</h1>
      <Button onClick={() => auth.signOut()}>Sign out</Button>
    </div>
  );
}
