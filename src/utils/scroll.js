import { navigate, getRouteState } from "../hooks/useRoute";

/* Smooth scroll com compensação do header fixo (altura = 76px no CSS) */
const HEADER_OFFSET = 76;
const SCROLL_DURATION = 1000;
let scrollFrame = null;

export function scrollToHash(hash) {
  const id = hash.startsWith("#") ? hash.slice(1) : "";
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;

  const startY = window.scrollY;
  const targetY = Math.max(0, el.getBoundingClientRect().top + startY - (hash === "#inicio" ? 0 : HEADER_OFFSET));
  const distance = targetY - startY;
  const startTime = performance.now();

  if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);

  const animateScroll = (time) => {
    const progress = Math.min((time - startTime) / SCROLL_DURATION, 1);
    const easedProgress = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    window.scrollTo(0, startY + distance * easedProgress);

    if (progress < 1) {
      scrollFrame = window.requestAnimationFrame(animateScroll);
    } else {
      scrollFrame = null;
    }
  };

  scrollFrame = window.requestAnimationFrame(animateScroll);
  window.history.replaceState(null, "", hash);
  return true;
}

/* onClick para links internos e navegação entre páginas. Chama `after` (ex.: fechar menu). */
export function handleAnchorClick(e, href, after) {
  if (!href || href === "#") {
    if (e) e.preventDefault();
    return;
  }

  /* Rota direta (ex.: /catalogos ou /) */
  if (href.startsWith("/")) {
    if (e) e.preventDefault();
    navigate(href);
    if (after) after();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  /* Âncora (#inicio, #produtos, etc.) */
  if (href.startsWith("#")) {
    const route = getRouteState();
    if (!route.isHome) {
      if (e) e.preventDefault();
      navigate("/" + href);
      if (after) after();
      return;
    }

    if (scrollToHash(href)) {
      if (e) e.preventDefault();
      if (after) after();
    }
  }
}

/* Evita que href="#" (placeholder) role a página para o topo */
export function preventPlaceholder(e) {
  if (e.currentTarget.getAttribute("href") === "#") e.preventDefault();
}
