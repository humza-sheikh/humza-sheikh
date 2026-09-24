import { ownerSignedIn } from "@/lib/owner";
import { requestsDb } from "@/db/requests";
import { notifyRequest, notificationsConfigured } from "@/lib/notifications";
export async function POST(request:Request){
  if(!await ownerSignedIn())return Response.json({error:'Not authorised'},{status:403});
  if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403});
  if(!notificationsConfigured())return Response.json({error:'Connect an email provider and verified sender first.'},{status:503});
  try{const pending=await requestsDb().prepare("SELECT id FROM introduction_requests WHERE notification_state IN ('pending','failed') OR (notification_state='sending' AND notification_at < datetime('now','-5 minutes')) ORDER BY created_at DESC LIMIT 5").all<{id:string}>();let sent=0;for(const brief of pending.results){if(await notifyRequest(brief.id))sent++}return Response.json({sent,attempted:pending.results.length})}catch{return Response.json({error:'Could not retry alerts.'},{status:503})}
}
