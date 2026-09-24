import { env } from "cloudflare:workers";
import { getChatGPTUser, type ChatGPTUser } from "@/app/chatgpt-auth";
export function isOwner(user: ChatGPTUser | null) { return !!user && !!env.OWNER_EMAIL && user.email.toLowerCase() === env.OWNER_EMAIL.toLowerCase(); }
export async function ownerSignedIn() { return isOwner(await getChatGPTUser()); }
