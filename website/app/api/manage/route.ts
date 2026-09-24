import { ownerSignedIn } from "@/lib/owner";
import { requestsDb } from "@/db/requests";
import { notificationsConfigured } from "@/lib/notifications";
import { z } from "zod";
export async function GET(request:Request){
  if(!await ownerSignedIn())return Response.json({error:'Not authorised'},{status:403});
  const offset=Math.min(100000,Math.max(0,Number.parseInt(new URL(request.url).searchParams.get('offset')||'0',10)||0));
  try{const db=requestsDb();const [briefs,counts,events,sources]=await Promise.all([
    db.prepare('SELECT * FROM introduction_requests ORDER BY created_at DESC, id DESC LIMIT 50 OFFSET ?').bind(offset).all(),
    db.prepare("SELECT COUNT(*) AS total, COALESCE(SUM(mode='need'),0) AS buyers, COALESCE(SUM(mode='supply'),0) AS providers, COALESCE(SUM(stage IN ('qualified','introduced','accepted','paid')),0) AS qualified, COALESCE(SUM(stage IN ('accepted','paid')),0) AS accepted, COALESCE(SUM(stage='paid'),0) AS paid, COALESCE(SUM(notification_state!='sent'),0) AS pending FROM introduction_requests").first<{total:number}>(),
    db.prepare("SELECT event,COUNT(DISTINCT visit_id) AS total FROM conversion_events WHERE created_at > datetime('now','-30 days') GROUP BY event ORDER BY CASE event WHEN 'page_view' THEN 0 WHEN 'cta_click' THEN 1 WHEN 'example_select' THEN 2 WHEN 'form_start' THEN 3 WHEN 'brief_continue' THEN 4 ELSE 5 END").all(),
    db.prepare("SELECT source, COUNT(*) AS total, COALESCE(SUM(stage IN ('qualified','introduced','accepted','paid')),0) AS qualified, COALESCE(SUM(stage='paid'),0) AS paid FROM introduction_requests WHERE created_at > datetime('now','-30 days') GROUP BY source ORDER BY total DESC").all()
  ]);return Response.json({requests:briefs.results,total:counts?.total||0,counts,events:events.results,sources:sources.results,configured:notificationsConfigured()},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'Could not load briefs.'},{status:503})}
}
export async function PATCH(request:Request){
  if(!await ownerSignedIn())return Response.json({error:'Not authorised'},{status:403});
  if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403});
  try{const raw=await request.text();if(raw.length>500)return Response.json({error:'Request too large'},{status:413});const result=z.object({id:z.string().uuid(),stage:z.enum(['new','qualified','introduced','accepted','paid','closed'])}).safeParse(JSON.parse(raw));if(!result.success)return Response.json({error:'Invalid stage'},{status:400});const updated=await requestsDb().prepare('UPDATE introduction_requests SET stage=? WHERE id=?').bind(result.data.stage,result.data.id).run();return Response.json({updated:!!updated.meta.changes},{status:updated.meta.changes?200:404})}catch{return Response.json({error:'Could not update brief.'},{status:503})}
}
