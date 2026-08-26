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
import { IncidentStoreProvider } from "@/lib/incident-store";

type Props = {
  active: NavId;
  children: React.ReactNode;
};

export default function AppShell({ active, children }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState("Operator");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <IncidentStoreProvider>
      {!mounted || !isAuthenticated() ? null : (
        <div className="dashboard-shell">
          <Header
            onLogout={handleLogout}
            onMenuClick={() => setSidebarOpen((v) => !v)}
            userName={userName}
            userRole="Admin"
          />
          <div className="dashboard-body">
            <Sidebar active={active} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="dashboard-main">{children}</main>
          </div>
        </div>
      )}
    </IncidentStoreProvider>
  );
}
