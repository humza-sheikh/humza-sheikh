// First-party measurement: no cookies, browser storage or free-text form data.
let visitId = "";
export function createId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
export function visitContext() {
  if (!visitId) visitId = createId();
  const query = new URLSearchParams(window.location.search);
  const safe = (value: string | null) => (value || "").replace(/[^a-zA-Z0-9 _.-]/g, "").slice(0, 80);
  return { visitId, source: safe(query.get("utm_source")) || "direct", campaign: safe(query.get("utm_campaign")) };
}
export function track(event: string, placement: string) {
  if (typeof window === "undefined" || navigator.doNotTrack === "1" || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
  const body = JSON.stringify({ ...visitContext(), event, placement });
  void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}
