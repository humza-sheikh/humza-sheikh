"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { IntroductionRequest } from "@/lib/notifications";
type Dashboard={requests:IntroductionRequest[];total:number;configured:boolean;counts:{total:number;buyers:number;providers:number;qualified:number;accepted:number;paid:number;pending:number};events:{event:string;total:number}[];sources:{source:string;total:number;qualified:number;paid:number}[]};
const stages=[['new','New'],['qualified','Qualified'],['introduced','Introduced'],['accepted','Introduction accepted'],['paid','Paid'],['closed','Closed']] as const;
export default function Manage(){
  const [data,setData]=useState<Dashboard|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(''),[offset,setOffset]=useState(0),[message,setMessage]=useState('');
  async function load(start=offset){try{const response=await fetch(`/api/manage?offset=${start}`,{cache:'no-store'});if(!response.ok)throw new Error('Could not load your briefs. Please refresh.');setData(await response.json());setError('')}catch(e){setError(e instanceof Error?e.message:'Unable to load briefs.')}}
  useEffect(() => {
    const controller = new AbortController();
    async function fetchPage() {
      try {
        const response = await fetch(`/api/manage?offset=${offset}`, {
          cache: 'no-store', signal: controller.signal,
        });
        if (!response.ok) throw new Error('Could not load your briefs. Please refresh.');
        const dashboard: Dashboard = await response.json();
        if (!controller.signal.aborted) { setData(dashboard); setError(''); }
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to load briefs.');
      }
    }
    void fetchPage();
    return () => controller.abort();
  }, [offset]);
  async function update(id:string,stage:string){setBusy(id);setMessage('');try{const response=await fetch('/api/manage',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,stage})});if(!response.ok)throw new Error('Could not update this brief. Please try again.');await load();setMessage('Brief updated.')}catch(e){setError(e instanceof Error?e.message:'Update failed.')}finally{setBusy('')}}
  async function retry(){setBusy('alerts');setMessage('');try{const response=await fetch('/api/manage/notifications',{method:'POST'});const result=await response.json() as {error?:string;sent?:number;attempted?:number};if(!response.ok)throw new Error(result.error||'Could not send alerts.');setMessage(`${result.sent} of ${result.attempted} alerts accepted by the email provider.`);await load()}catch(e){setError(e instanceof Error?e.message:'Retry failed.')}finally{setBusy('')}}
  return <main className="wrap manage-page"><div className="manage-header"><div><Link href="/" className="small-label">HUMZA SHEIKH / PRIVATE WORKSPACE</Link><h1>Your introductions.</h1></div><button className="button dark" onClick={()=>void load()} disabled={!!busy}>Refresh</button></div>{error&&<p role="alert" className="form-error">{error}</p>}{message&&<p role="status" className="manage-message">{message}</p>}{!data&&!error&&<p>Loading your briefs…</p>}{data&&<>
    <div className="manage-metrics">{[['All briefs',data.counts.total],['Qualified+',data.counts.qualified],['Accepted+',data.counts.accepted],['Paid',data.counts.paid]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><p className="manage-note">{data.counts.buyers} buyer briefs · {data.counts.providers} provider offers. Qualified+ includes introduced, accepted and paid briefs. Stages are updated by you.</p>
    <div className="notification-banner"><div><strong>{data.configured?'Submission alerts are configured.':'Email alerts need a connection.'}</strong><p>{data.configured?`${data.counts.pending} alerts are awaiting provider acceptance. “Sent” means accepted by the email provider, not confirmed inbox delivery.`:'Briefs are saved here. Add a Resend API key and a verified sender in site settings to send alerts to humza@humzasheikh.com.'}</p></div><button onClick={retry} disabled={!data.configured||!!busy||!data.counts.pending} className="button dark">{busy==='alerts'?'Sending…':'Send pending alerts'}</button></div>
    <details className="measurement"><summary>Website activity · last 30 days</summary><div className="measurement-grid"><div><h2>The inquiry flow</h2>{data.events.length?data.events.map(row=><p key={row.event}><span>{row.event.replaceAll('_',' ')}</span><strong>{row.total}</strong></p>):<p>No activity recorded yet.</p>}<small>One count per visit and action. No cookies or persistent visitor identifiers. Do Not Track and Global Privacy Control are respected for interaction events.</small></div><div><h2>Briefs by source</h2>{data.sources.length?data.sources.map(row=><p key={row.source}><span>{row.source}</span><span>{row.total} briefs · {row.qualified} qualified · {row.paid} paid</span></p>):<p>No briefs recorded yet.</p>}<small>Attribution uses utm_source and utm_campaign. “Direct” means no campaign source was supplied.</small></div></div></details>
    <div className="manage-list-heading"><h2>Incoming briefs</h2><span>{data.total?`${offset+1}–${Math.min(offset+50,data.total)} of ${data.total}`:'No briefs yet'}</span></div><div className="manage-list">{data.requests.map(brief=><article className="manage-brief" key={brief.id}><div className="manage-brief-top"><div><span className="small-label">{brief.mode==='need'?'BUSINESS NEED':'PROVIDER OFFER'} / HS-{brief.id.slice(0,8).toUpperCase()}</span><h3>{brief.company}</h3><a href={`mailto:${brief.email}`}>{brief.name} · {brief.email}</a></div><label>Stage<select value={brief.stage} disabled={busy===brief.id} onChange={e=>void update(brief.id,e.target.value)}>{stages.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label></div><p className="manage-brief-details">{brief.details}</p><dl><div><dt>Timing</dt><dd>{brief.timing||'Not supplied'}</dd></div><div><dt>Location</dt><dd>{brief.location}</dd></div><div><dt>Received</dt><dd>{brief.created_at} UTC</dd></div><div><dt>Source / campaign</dt><dd>{brief.source}{brief.campaign?` / ${brief.campaign}`:''}</dd></div></dl><small>Alert: {brief.notification_state==='sent'?'Accepted by email provider':brief.notification_state==='pending'?'Pending':brief.notification_state==='failed'?'Needs retry':'In progress'}</small></article>)}</div><div className="manage-pagination"><button className="text-link" disabled={offset===0} onClick={()=>setOffset(Math.max(0,offset-50))}>Previous</button><button className="text-link" disabled={offset+50>=data.total} onClick={()=>setOffset(offset+50)}>Next</button></div>
  </>}</main>;
}
