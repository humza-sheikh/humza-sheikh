import { env } from "cloudflare:workers";
export function requestsDb(){if(!env.DB)throw new Error("Requests database unavailable");return env.DB;}
