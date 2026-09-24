import { env } from "cloudflare:workers";
import { requestsDb } from "@/db/requests";

export type IntroductionRequest = { id:string; mode:string; name:string; email:string; company:string; location:string; details:string; timing:string; source:string; campaign:string; stage:string; created_at:string; notification_state:string };
export function notificationsConfigured() { return !!env.RESEND_API_KEY && !!env.NOTIFICATION_FROM; }
export async function notifyRequest(id: string) {
  if (!notificationsConfigured()) return false;
  const db = requestsDb();
  const claimed = await db.prepare("UPDATE introduction_requests SET notification_state='sending', notification_at=CURRENT_TIMESTAMP WHERE id=? AND (notification_state IN ('pending','failed') OR (notification_state='sending' AND notification_at < datetime('now','-5 minutes')))").bind(id).run();
  if (!claimed.meta.changes) return false;
  try {
    const brief = await db.prepare("SELECT * FROM introduction_requests WHERE id=?").bind(id).first<IntroductionRequest>();
    if (!brief) throw new Error("Brief not found");
    const reference = `HS-${brief.id.slice(0,8).toUpperCase()}`;
    const response = await fetch("https://api.resend.com/emails", {
      method:"POST", headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json","Idempotency-Key":`brief/${id}`}, signal:AbortSignal.timeout(7000),
      body:JSON.stringify({from:env.NOTIFICATION_FROM,to:["humza@humzasheikh.com"],reply_to:brief.email,subject:`New ${brief.mode === "need" ? "business brief" : "provider offer"} · ${reference}`,text:[`Reference: ${reference}`,`Name: ${brief.name}`,`Email: ${brief.email}`,`Company: ${brief.company}`,`Location: ${brief.location}`,`Timing: ${brief.timing}`,"",brief.details,"",`Source: ${brief.source}`,`Campaign: ${brief.campaign || "—"}`,"", "Review and update this brief in your Site’s /manage page."].join("\n")})
    });
    if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
    const result = await response.json() as {id?:string};
    await db.prepare("UPDATE introduction_requests SET notification_state='sent', notification_id=?, notification_at=CURRENT_TIMESTAMP WHERE id=?").bind(result.id || null,id).run();
    return true;
  } catch {
    await db.prepare("UPDATE introduction_requests SET notification_state='failed', notification_at=CURRENT_TIMESTAMP WHERE id=?").bind(id).run();
    return false;
  }
}
