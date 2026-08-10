"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import type { NavId } from "@/lib/nav";
import {
  getCurrentUser,
  isAuthenticated,
  logout,
  syncAuthCookie,
} from "@/lib/auth";

type Props = {
  active: NavId;
  children: React.ReactNode;
};

export default function AppShell({ active, children }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("Operator");

  useEffect(() => {
    syncAuthCookie();
    setMounted(true);

    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const user = getCurrentUser();
    if (user?.name) setUserName(user.name);
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!mounted || !isAuthenticated()) return null;

  return (
    <div className="dashboard-shell">
      <Header onLogout={handleLogout} userName={userName} userRole="Admin" />
      <div className="dashboard-body">
        <Sidebar active={active} />
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
}
