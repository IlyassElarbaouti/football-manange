import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { cn } from "@/lib/utils";
import BackgroundGradient from "@/components/ui/BackgroundGradient";
import UserSyncIndicator from "@/components/UserSyncIndicator";

// Navigation items
const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    name: "Matches",
    href: "/dashboard/matches",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m4.93 4.93 4.24 4.24" />
        <path d="m14.83 9.17 4.24-4.24" />
        <path d="m14.83 14.83 4.24 4.24" />
        <path d="m9.17 14.83-4.24 4.24" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    name: "Payments",
    href: "/dashboard/payments",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen text-white">
      {/* Dynamic background with interactive gradient */}
      <BackgroundGradient />
      
      <div className="relative flex w-full z-10">
        {/* Black and Gold sidebar with glassy effect */}
        <div className="hidden w-64 flex-col border-r border-amber-500/20 bg-gradient-to-b from-black/80 to-gray-900/80 backdrop-blur-md md:flex">
          <div className="flex h-20 items-center justify-center border-b border-amber-500/20">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 p-1.5 shadow-lg shadow-amber-500/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-black"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-2xl font-bold text-transparent">
                  FOOTBALL
                </span>
                <span className="ml-auto bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-lg font-bold text-transparent">
                  HUB
                </span>
              </div>
            </Link>
          </div>

          <div className="flex flex-1 flex-col justify-between p-4">
            <nav className="space-y-1.5">
              {navigationItems.map((item) => {
                const isActive = item.href === "/dashboard";
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center space-x-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out",
                      isActive
                        ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span 
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-md p-1.5 transition-colors duration-200",
                        isActive 
                          ? "bg-gradient-to-br from-amber-500 to-yellow-500 text-black shadow-md shadow-amber-500/20" 
                          : "bg-white/10 text-white/70 group-hover:bg-white/20 group-hover:text-white"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-4 pt-4">
              <div className="overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-gray-900/50 to-black/50 p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <UserButton 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "h-12 w-12 border-2 border-amber-500/30",
                      }
                    }}
                  />
                  <div>
                    <p className="font-medium text-white">Your Account</p>
                    <p className="text-xs text-amber-400">FIFA 25 Ultimate Team</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <span className="rounded bg-amber-400/20 px-1 py-0.5 text-xs font-bold text-amber-400">
                      LVL 12
                    </span>
                    <span className="text-white/70">Player</span>
                  </div>
                  <Link 
                    href="/dashboard/profile" 
                    className="rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 px-2 py-1 text-xs font-bold text-black hover:from-amber-600 hover:to-yellow-600"
                  >
                    View Stats
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="flex h-16 items-center justify-between border-b border-amber-500/20 bg-gradient-to-r from-black/80 to-gray-900/80 px-4 backdrop-blur-md md:hidden">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 p-1 shadow-lg shadow-amber-500/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-black"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </div>
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-xl font-bold text-transparent">
                FOOTBALL HUB
              </span>
            </Link>
            <UserButton />
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-transparent p-4 md:p-6">
            <div className="container mx-auto">
              {children}
            </div>
          </main>

          {/* Mobile Navigation Bar */}
          <div className="border-t border-amber-500/20 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-md md:hidden">
            <nav className="flex h-16 justify-around">
              {navigationItems.map((item) => {
                const isActive = item.href === "/dashboard";
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center justify-center text-xs",
                      isActive
                        ? "text-amber-400"
                        : "text-white/70"
                    )}
                  >
                    <span className={cn(
                      "mb-1 rounded-md p-1.5",
                      isActive 
                        ? "bg-gradient-to-br from-amber-500/20 to-yellow-500/10" 
                        : ""
                    )}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* User Sync Indicator */}
          <UserSyncIndicator />
        </div>
      </div>
    </div>
  );
}