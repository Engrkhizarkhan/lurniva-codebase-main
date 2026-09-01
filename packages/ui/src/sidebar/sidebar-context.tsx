"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode, RefObject } from "react";

const COLLAPSED_STORAGE_KEY = "lurniva-sidebar-collapsed";

type Listener = () => void;
const collapsedListeners = new Set<Listener>();

function subscribeCollapsed(listener: Listener) {
  collapsedListeners.add(listener);
  return () => collapsedListeners.delete(listener);
}

function getCollapsedSnapshot() {
  return window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true";
}

function getCollapsedServerSnapshot() {
  return false;
}

function setCollapsedStore(value: boolean) {
  window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(value));
  collapsedListeners.forEach((listener) => listener());
}

export interface SidebarContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  mobileTriggerRef: RefObject<HTMLButtonElement | null>;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    getCollapsedServerSnapshot,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileTriggerRef = useRef<HTMLButtonElement | null>(null);

  const toggleCollapsed = useCallback(() => {
    setCollapsedStore(!getCollapsedSnapshot());
  }, []);

  const value = useMemo<SidebarContextValue>(
    () => ({
      collapsed,
      toggleCollapsed,
      mobileOpen,
      setMobileOpen,
      mobileTriggerRef,
    }),
    [collapsed, toggleCollapsed, mobileOpen],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}