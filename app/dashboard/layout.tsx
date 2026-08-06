"use client";

import Link from "next/link";
import Image from "next/image";

import { usePathname, useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  Receipt,
  UserRound,
  LogOut,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {

  const pathname = usePathname();

  const router = useRouter();

  async function handleLogout() {

    await supabase.auth.signOut();

    router.replace("/office-login");

  }

  function menuItem(
    href: string,
    label: string,
    icon: React.ReactNode
  ) {

    const active = pathname === href;

    return (
            <Link
        href={href}
        className={`group relative flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300

        ${
          active
            ? "bg-white text-[#1F4E79] shadow-lg"
            : "text-blue-100 hover:bg-white/10 hover:text-white"
        }`}
      >

        {active && (

          <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#61C6D9]" />

        )}

        <div
          className={`transition ${
            active ? "text-[#2E7BBE]" : ""
          }`}
        >

          {icon}

        </div>

        <span className="font-semibold">

          {label}

        </span>

      </Link>

    );

  }

  return (

    <div className="flex min-h-screen bg-[#F4F7FB]">

      {/* SIDEBAR */}

      <aside className="w-[290px] bg-[#1F4E79] text-white flex flex-col shadow-2xl">

        {/* LOGO */}

        <div className="border-b border-white/10 px-8 py-8">

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-lg">

              <Image
                src="/images/logo.jpg"
                alt="PureSpace"
                width={50}
                height={50}
                className="rounded-2xl"
              />

            </div>

            <div>

              <h1 className="text-[30px] font-extrabold">

                PureSpace

              </h1>

              <p className="text-sm text-blue-200">

                Office Dashboard

              </p>

            </div>

          </div>

        </div>

        {/* MENU */}

        <nav className="flex-1 overflow-y-auto px-6 py-8">

          <p className="mb-4 px-3 text-xs uppercase tracking-[0.30em] text-blue-200">

            Main

          </p>

          <div className="space-y-2">

            {menuItem(
              "/dashboard",
              "Dashboard",
              <LayoutDashboard className="h-5 w-5" />
            )}

          </div>

          <p className="mt-10 mb-4 px-3 text-xs uppercase tracking-[0.30em] text-blue-200">

            Operations

          </p>

          <div className="space-y-2">
                        {menuItem(
              "/dashboard/properties",
              "Properties",
              <Building2 className="h-5 w-5" />
            )}

            {menuItem(
              "/dashboard/team",
              "Employees",
              <Users className="h-5 w-5" />
            )}

            {menuItem(
              "/dashboard/schedule",
              "Schedule",
              <CalendarDays className="h-5 w-5" />
            )}

          </div>

          <p className="mt-10 mb-4 px-3 text-xs uppercase tracking-[0.30em] text-blue-200">

            Finance

          </p>

          <div className="space-y-2">

            {menuItem(
              "/dashboard/receipts",
              "Receipts",
              <Receipt className="h-5 w-5" />
            )}

          </div>

          <p className="mt-10 mb-4 px-3 text-xs uppercase tracking-[0.30em] text-blue-200">

            Clients

          </p>

          <div className="space-y-2">

            {menuItem(
              "/owner-home",
              "Owner Portal",
              <UserRound className="h-5 w-5" />
            )}

          </div>

        </nav>

        {/* FOOTER */}

        <div className="border-t border-white/10 p-6">

          <div className="mb-5 flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#163A5A] border border-white/10 font-bold text-lg">

              S

            </div>

            <div>

              <p className="font-semibold">

                Sara Lopez

              </p>

              <p className="text-xs text-blue-200">

                Office Admin

              </p>

            </div>

          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600"
          >

            <LogOut className="h-5 w-5" />

            Logout

          </button>

        </div>

      </aside>

      <main className="flex-1 overflow-y-auto">

        {children}

      </main>

    </div>

  );

}
