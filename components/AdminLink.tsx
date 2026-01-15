"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useDevAdminMode } from "@/components/DevAdminToggle";

export default function AdminLink() {
  const { data: session } = useSession();
  const { isDevAdmin } = useDevAdminMode();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAdmin = () => {
      if (!session?.user?.id) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      // Check dev mode first (development only) - check localStorage immediately
      // In dev mode, ONLY use dev admin toggle - ignore server admin status
      if (process.env.NODE_ENV === "development") {
        const localValue = localStorage.getItem("dev_admin_mode") === "true"
        const devAdminValue = localValue || isDevAdmin
        if (isMounted) {
          setIsAdmin(devAdminValue);
          setLoading(false);
        }
        return;
      }

      // Only check server if not in dev mode
      async function checkServerAdmin() {
        try {
          const response = await fetch("/api/admin/check", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (isMounted) {
              setIsAdmin(data.isAdmin);
            }
          } else {
            if (isMounted) {
              setIsAdmin(false);
            }
          }
        } catch {
          if (isMounted) {
            setIsAdmin(false);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }

      checkServerAdmin();
    };

    checkAdmin();

    // Listen for dev admin mode changes
    if (process.env.NODE_ENV === "development") {
      const handleChange = (e: CustomEvent) => {
        if (isMounted) {
          setIsAdmin(e.detail.enabled);
        }
      };
      
      window.addEventListener("devAdminModeChanged", handleChange as EventListener);
      
      return () => {
        isMounted = false;
        window.removeEventListener("devAdminModeChanged", handleChange as EventListener);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [session?.user?.id, isDevAdmin]);

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <Link href="/admin" className="block">
      <Button variant="ghost" size="sm" className="w-full md:w-auto justify-start md:justify-center">
        <Shield className="h-4 w-4 mr-2" />
        Admin
      </Button>
    </Link>
  );
}

