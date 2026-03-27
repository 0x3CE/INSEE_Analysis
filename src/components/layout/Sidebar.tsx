"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Heart, Users, Landmark, BarChart3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUI } from "@/components/layout/UIContext";

const NAV_ITEMS = [
  { href: "/economy", label: "Économie", icon: TrendingUp },
  { href: "/health", label: "Santé", icon: Heart },
  { href: "/social", label: "Social", icon: Users },
  { href: "/investment", label: "Investissement", icon: Landmark },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-white/20 text-white"
                : "text-blue-200 hover:bg-white/10 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 px-5 py-5 border-b border-blue-700">
        <BarChart3 className="h-6 w-6 text-blue-200" />
        <div>
          <p className="text-sm font-bold leading-tight">Observatoire</p>
          <p className="text-xs text-blue-300 leading-tight">National</p>
        </div>
      </div>
      <NavLinks onNavigate={onNavigate} />
      <div className="px-5 py-4 border-t border-blue-700">
        <p className="text-xs text-blue-400">
          Sources : INSEE, data.gouv.fr, DBnomics
        </p>
      </div>
    </>
  );
}

export function Sidebar() {
  const { isMobileMenuOpen, closeMobileMenu } = useUI();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 flex-col bg-dsfr-blue text-white shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-dsfr-blue text-white md:hidden transition-transform duration-200",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <button
          onClick={closeMobileMenu}
          className="absolute top-4 right-4 text-blue-300 hover:text-white p-1"
          aria-label="Fermer le menu"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent onNavigate={closeMobileMenu} />
      </aside>
    </>
  );
}
