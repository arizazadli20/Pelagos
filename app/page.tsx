"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthScreen from "@/components/AuthScreen";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("peykgoz-auth") === "true") {
      router.push("/account");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <AuthScreen 
      onLogin={() => {
        localStorage.setItem("peykgoz-auth", "true");
        router.push("/account");
      }} 
    />
  );
}
