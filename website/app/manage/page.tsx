import Link from "next/link";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { isOwner } from "@/lib/owner";
import Manage from "./manage";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export const metadata:Metadata={title:"Briefs — Humza Sheikh",robots:{index:false,follow:false},openGraph:{images:[]},twitter:{images:[]}};
export default async function ManagePage(){
  const user=await requireChatGPTUser("/manage");
  if(!isOwner(user))return <main className="wrap manage-page"><h1>Private workspace</h1><p>This page is available to the site owner.</p><Link className="text-link" href="/">Back to the website</Link></main>;
  return <Manage/>;
}
