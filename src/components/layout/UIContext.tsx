"use client";

import { createContext, useContext, useState } from "react";

interface UIContextValue {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  isComparePanelOpen: boolean;
  toggleComparePanel: () => void;
  closeComparePanel: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isComparePanelOpen, setComparePanelOpen] = useState(false);

  return (
    <UIContext.Provider
      value={{
        isMobileMenuOpen,
        toggleMobileMenu: () => setMobileMenuOpen((v) => !v),
        closeMobileMenu: () => setMobileMenuOpen(false),
        isComparePanelOpen,
        toggleComparePanel: () => setComparePanelOpen((v) => !v),
        closeComparePanel: () => setComparePanelOpen(false),
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}
