"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import UserMenu from "./UserMenu";

interface HeaderProps {
  variant?: "landing" | "dashboard";
}

export default function Header({ variant = "landing" }: HeaderProps) {
  const { data: session } = useSession();

  if (variant === "dashboard") {
    // Dashboard header: Logo on left, UserMenu on right
    return (
      <div className="flex-shrink-0 px-8 pt-6 pb-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.svg"
            alt="Progressable Logo"
            width={40}
            height={40}
            className="transition-transform group-hover:scale-105"
          />
          <span className="text-xl font-bold text-indigo-600">Progressable</span>
        </Link>

        <UserMenu
          userName={session?.user?.name}
          userEmail={session?.user?.email}
        />
      </div>
    );
  }

  // Landing page header: Logo on left, auth buttons on right
  return (
    <header className="container mx-auto px-6 py-6">
      <nav className="flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.svg"
            alt="Progressable Logo"
            width={48}
            height={48}
            className="transition-transform group-hover:scale-105"
          />
          <span className="text-2xl font-bold text-indigo-600">Progressable</span>
        </Link>

        <div className="flex gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to App
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-6 py-2 text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Start for Free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
