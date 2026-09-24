import { requestsDb } from "@/db/requests";
import { notifyRequest } from "@/lib/notifications";
import { z } from "zod";
const attribution=z.string().max(80).regex(/^[a-zA-Z0-9 _.-]*$/);
const schema=z.object({id:z.string().uuid(),mode:z.enum(["need","supply"]),name:z.string().trim().min(1).max(120),email:z.string().trim().email().max(254),company:z.string().trim().min(1).max(160),location:z.string().trim().min(1).max(180),timing:z.string().trim().min(1).max(180),details:z.string().trim().min(15).max(4000),website:z.string().max(0).optional(),visitId:z.string().uuid(),source:attribution.default("direct"),campaign:attribution.default("")});
export async function POST(request:Request){
  const origin=request.headers.get("origin"); if(origin&&origin!==new URL(request.url).origin)return Response.json({error:"Please submit the form from this website."},{status:403});
  if(!request.headers.get("content-type")?.includes("application/json"))return Response.json({error:"Invalid request."},{status:415});
  try {
    const raw=await request.text(); if(raw.length>12000)return Response.json({error:"Your request is too long."},{status:413});
    let data:unknown; try{data=JSON.parse(raw)}catch{return Response.json({error:"Invalid request."},{status:400})}
    const result=schema.safeParse(data); if(!result.success)return Response.json({error:"Please include your name, work email, company, location, timeframe and at least 15 characters about your brief."},{status:400});
    const d=result.data, db=requestsDb();
    const existing=await db.prepare("SELECT id FROM introduction_requests WHERE id=?").bind(d.id).first();
    if(!existing) {
      const recent=await db.prepare("SELECT COUNT(*) AS count FROM introduction_requests WHERE email=? AND created_at > datetime('now','-1 hour')").bind(d.email).first<{count:number}>();
      if((recent?.count || 0)>=5)return Response.json({error:"You’ve sent several briefs recently. Please email me to add further details."},{status:429});
      await db.batch([
        db.prepare("INSERT INTO introduction_requests (id,mode,name,email,company,location,details,timing,source,campaign,visit_id) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING").bind(d.id,d.mode,d.name,d.email,d.company,d.location,d.details,d.timing,d.source,d.campaign,d.visitId),
        db.prepare("INSERT INTO conversion_events (id,visit_id,event,placement,source,campaign) VALUES (?,?,'form_submit',?,?,?) ON CONFLICT DO NOTHING").bind(d.id,d.visitId,d.mode,d.source,d.campaign)
      ]);
      // Storage success is independent of alert delivery; failures remain retryable.
      try {await notifyRequest(d.id);} catch {console.error("Brief saved; notification needs review");}
    }
    return Response.json({saved:true,reference:`HS-${d.id.slice(0,8).toUpperCase()}`},{status:201,headers:{"Cache-Control":"no-store"}});
  } catch {console.error("Request storage failed");return Response.json({error:"I couldn’t save your brief. Please try again."},{status:503});}
}
