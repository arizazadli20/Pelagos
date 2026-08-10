"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy route — redirect to /dashboard. */
export default function AccountRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}
