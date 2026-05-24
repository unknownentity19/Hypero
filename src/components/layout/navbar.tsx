"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  desc?: string;
  external?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Product",
    items: [
      {
        label: "Overview",
        href: "/product",
        desc: "What Hypero is and why it exists.",
      },
      {
        label: "Features",
        href: "/features",
        desc: "Canvas, agents, integrations, runtime.",
      },
      {
        label: "Solutions",
        href: "/solutions",
        desc: "Industry workflows and use cases.",
      },
      {
        label: "Pricing",
        href: "/pricing",
        desc: "Plans, limits, and add-ons.",
      },
    ],
  },
  {
    label: "Build",
    items: [
      {
        label: "Open Studio",
        href: "/studio",
        desc: "Visual AI workflow builder.",
      },
      {
        label: "Terminal",
        href: "/terminal",
        desc: "Use Hypero from your CLI.",
      },
    ],
  },
  {
    label: "Developers",
    items: [
      {
        label: "Documentation",
        href: "/docs",
        desc: "Quickstart, guides, and concepts.",
      },
      {
        label: "API Reference",
        href: "/docs#api-reference",
        desc: "Endpoints, SDKs, and auth.",
      },
      {
        label: "Webhooks",
        href: "/docs#webhooks",
        desc: "Inbound triggers and signing.",
      },
    ],
  },
];

function isGroupActive(group: NavGroup, pathname: string) {
  return group.items.some((item) => {
    const base = item.href.split("#")[0]?.split("?")[0] ?? item.href;
    if (base === "/") return pathname === "/";
    return pathname === base || pathname.startsWith(`${base}/`);
  });
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, ready } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  // Close user menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  // Close nav dropdowns on outside click / escape
  useEffect(() => {
    if (!openGroup) return;
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroup(null);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [openGroup]);

  const openGroupNow = (label: string) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpenGroup(label);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenGroup(null), 140);
  };

  const initials = user
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-background/0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center" aria-label="Hypero home">
            <Logo size="lg" />
          </Link>

          <nav className="hidden md:block" ref={navRef}>
            <ul className="flex items-center gap-1">
              <li className="relative">
                <Link
                  href="/"
                  onMouseEnter={() => setOpenGroup(null)}
                  className={cn(
                    "relative inline-flex h-8 items-center px-3 text-sm transition-colors",
                    pathname === "/"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {pathname === "/" && openGroup === null ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  ) : null}
                  <span className="relative">Home</span>
                </Link>
              </li>
              {NAV_GROUPS.map((group) => {
                const isOpen = openGroup === group.label;
                const isActive = isGroupActive(group, pathname);
                return (
                  <li
                    key={group.label}
                    className="relative"
                    onMouseEnter={() => openGroupNow(group.label)}
                    onMouseLeave={scheduleClose}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenGroup((cur) =>
                          cur === group.label ? null : group.label,
                        )
                      }
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                      className={cn(
                        "relative inline-flex h-8 items-center gap-1 px-3 text-sm transition-colors",
                        isActive || isOpen
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {(isActive || isOpen) ? (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 rounded-full bg-accent"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      ) : null}
                      <span className="relative">{group.label}</span>
                      <ChevronDown
                        className={cn(
                          "relative h-3 w-3 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen ? (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.15 }}
                          role="menu"
                          className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                        >
                          <ul className="py-1.5">
                            {group.items.map((item) => (
                              <li key={item.href + item.label}>
                                <Link
                                  href={item.href}
                                  role="menuitem"
                                  className="group/item flex items-start gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent"
                                  onClick={() => setOpenGroup(null)}
                                >
                                  <div className="min-w-0 flex-1">
                                    <span className="block font-medium text-foreground">
                                      {item.label}
                                    </span>
                                    {item.desc ? (
                                      <span className="block text-[11px] leading-snug text-muted-foreground">
                                        {item.desc}
                                      </span>
                                    ) : null}
                                  </div>
                                  <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100" />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Auth area */}
          {!ready ? (
            <div className="hidden md:block h-8 w-24" aria-hidden />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((s) => !s)}
                className="hidden md:inline-flex h-8 items-center gap-2 rounded-full border border-border bg-background pl-1 pr-3 text-sm text-foreground transition-colors hover:bg-accent"
                aria-label="Account menu"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-semibold">
                  {initials || "U"}
                </span>
                <span className="font-medium text-[13px] max-w-[8rem] truncate">
                  {user.name.split(" ")[0]}
                </span>
              </button>
              <AnimatePresence>
                {menuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                  >
                    <div className="px-3 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <p className="mt-2 inline-flex rounded-md bg-accent border border-border px-1.5 py-0.5 text-[10px] font-mono text-foreground">
                        ws: {user.workspace}
                      </p>
                    </div>
                    <nav className="py-1">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/studio"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
                      >
                        <Sparkles className="h-4 w-4" />
                        Open studio
                      </Link>
                      <Link
                        href="/docs"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent"
                      >
                        <Command className="h-4 w-4" />
                        Documentation
                      </Link>
                    </nav>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        signOut();
                        router.push("/");
                      }}
                      className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/signin"
                className="hidden md:inline-flex h-8 items-center px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Button href="/signup" size="sm" className="hidden md:inline-flex">
                Get Started
              </Button>
            </>
          )}

          <button
            type="button"
            className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setMobileOpen((s) => !s)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-border bg-background"
        >
          <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-4">
            <Link
              href="/"
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                pathname === "/"
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              Home
            </Link>
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="flex flex-col gap-1">
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const base =
                    item.href.split("#")[0]?.split("?")[0] ?? item.href;
                  const active =
                    pathname === base || pathname.startsWith(`${base}/`);
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              {user ? (
                <>
                  <Button href="/dashboard" size="md" className="w-full">
                    Open dashboard
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      signOut();
                      router.push("/");
                    }}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/signup" size="md" className="w-full">
                    Get Started
                  </Button>
                  <Button
                    href="/signin"
                    variant="outline"
                    size="md"
                    className="w-full"
                  >
                    Sign in
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </header>
  );
}
