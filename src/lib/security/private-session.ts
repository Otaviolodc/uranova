// Presentation protection only. Authorization remains on the server and in RLS.
export function protectPrivateSession(root: HTMLElement, userId: string) {
  let disposed = false;
  let generation = 0;
  const hide = () => { root.style.display = "none"; root.inert = true; };
  const leave = () => {
    generation++;
    hide();
    window.location.replace("/auth/login");
  };
  async function validate() {
    const current = ++generation;
    hide();
    try {
      const response = await fetch("/auth/session", { cache: "no-store", credentials: "same-origin", signal: AbortSignal.timeout(10000) });
      const session = response.ok ? await response.json() : null;
      if (disposed || current !== generation) return;
      if (session?.userId !== userId) { leave(); return; }
      if (document.visibilityState !== "hidden") {
        root.style.display = "contents";
        root.inert = false;
      }
    } catch { if (!disposed && current === generation) leave(); }
  }
  const pagehide = () => { generation++; hide(); };
  const pageshow = (event: PageTransitionEvent) => {
    if (event.persisted) { pagehide(); window.location.reload(); }
  };
  const visibility = () => {
    if (document.visibilityState === "hidden") pagehide();
    else void validate();
  };
  const storage = (event: StorageEvent) => { if (event.key === "uranova:logout") leave(); };
  const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel("uranova:auth");
  if (channel) channel.onmessage = (event) => { if (event.data === "SIGNED_OUT") leave(); };
  window.addEventListener("pagehide", pagehide);
  window.addEventListener("pageshow", pageshow);
  window.addEventListener("storage", storage);
  document.addEventListener("visibilitychange", visibility);
  // Fallback for native form submissions and browsers without cross-tab messaging.
  const timer = window.setInterval(() => {
    if (document.visibilityState === "visible") void validate();
  }, 15000);
  void validate();
  return () => {
    disposed = true; generation++;
    window.clearInterval(timer);
    channel?.close();
    window.removeEventListener("pagehide", pagehide);
    window.removeEventListener("pageshow", pageshow);
    window.removeEventListener("storage", storage);
    document.removeEventListener("visibilitychange", visibility);
  };
}
