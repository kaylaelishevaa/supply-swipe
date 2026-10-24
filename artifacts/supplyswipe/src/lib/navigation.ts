import { useMemo } from "react";
import { useLocation, useSearch } from "wouter";

/** Client routing equivalents for the imported app's navigation hooks. */
export function useRouter() {
  const [, navigate] = useLocation();
  return useMemo(() => ({
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => window.history.back(),
  }), [navigate]);
}

export function usePathname() {
  return useLocation()[0];
}

export function useSearchParams() {
  const search = useSearch();
  return useMemo(() => new URLSearchParams(search), [search]);
}
