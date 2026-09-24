import { z } from "zod";
import { requestsDb } from "@/db/requests";
const schema = z.object({visitId:z.string().uuid(),event:z.enum(["page_view","cta_click","example_select","form_start","brief_continue"]),placement:z.enum(["home","header","hero","approach","mobile_sticky","provider","buyer","your brief","expertise","capacity","supply","need"]),source:z.string().max(80).regex(/^[a-zA-Z0-9 _.-]*$/),campaign:z.string().max(80).regex(/^[a-zA-Z0-9 _.-]*$/)});
export async function POST(request:Request) {
  if(request.headers.get("origin") !== new URL(request.url).origin) return new Response(null,{status:403});
  if(!request.headers.get("content-type")?.includes("application/json")) return new Response(null,{status:415});
  try { const raw = await request.text(); if(raw.length > 1500) return new Response(null,{status:413}); const parsed=schema.safeParse(JSON.parse(raw)); if(!parsed.success)return new Response(null,{status:400}); const d=parsed.data;
    await requestsDb().prepare("INSERT INTO conversion_events (id,visit_id,event,placement,source,campaign) VALUES (?,?,?,?,?,?) ON CONFLICT(visit_id,event,placement) DO NOTHING").bind(crypto.randomUUID(),d.visitId,d.event,d.placement,d.source,d.campaign).run();
    return new Response(null,{status:204});
  } catch {return new Response(null,{status:503});}
}
