import Link from "next/link";
import { ownerSignedIn } from "@/lib/owner";
import Manage from "./manage";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export const metadata:Metadata={title:"Briefs — Humza Sheikh",robots:{index:false,follow:false},openGraph:{images:[]},twitter:{images:[]}};
export default async function ManagePage(){
  if(!await ownerSignedIn())return <main className="wrap manage-page"><h1>Private workspace</h1><p>Open humzasheikh.com/manage and sign in with your owner email to view briefs.</p><Link className="text-link" href="/">Back to the website</Link></main>;
  return <Manage/>;
}
