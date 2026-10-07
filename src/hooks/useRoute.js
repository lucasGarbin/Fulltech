import { useEffect, useState } from "react";

export function getRouteState() {
  const pathname = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
  const hash = window.location.hash || "";

  const isCatalogos = pathname === "/catalogos" || hash.startsWith("#/catalogos");
  const isAdmin = pathname === "/admin" || hash.startsWith("#/admin");
  const isHome = !isCatalogos && !isAdmin;

  return {
    pathname,
    hash,
    isCatalogos,
    isAdmin,
    isHome,
  };
}

export function navigate(url) {
  if (!url) return;
  const current = window.location.pathname + window.location.hash;
  if (url === current) return;
  window.history.pushState(null, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export default function useRoute() {
  const [route, setRoute] = useState(getRouteState);

  useEffect(() => {
    const onChange = () => setRoute(getRouteState());

    window.addEventListener("popstate", onChange);
    window.addEventListener("hashchange", onChange);

    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener("hashchange", onChange);
    };
  }, []);

  return route;
}
