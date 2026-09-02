"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import type { NavId } from "@/lib/nav";
import { getCurrentUser, logout } from "@/lib/auth";

type Props = {
  active: NavId;
  children: React.ReactNode;
};

// Demo login requirement disabled for now — this shell no longer checks
// isAuthenticated()/redirects to /login. To restore it, bring back that
// check (see git history) alongside middleware.ts's route guard.
export default function AppShell({ active, children }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("Operator");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (user?.name) setUserName(user.name);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      {!mounted ? null : (
        <div className="dashboard-shell">
          <Header
            onLogout={handleLogout}
            onMenuClick={() => setSidebarExpanded((v) => !v)}
            userName={userName}
            userRole="Admin"
          />
          <div className="dashboard-body">
            <Sidebar active={active} expanded={sidebarExpanded} />
            <main className="dashboard-main">{children}</main>
          </div>
        </div>
      )}
    </>
  );
}
