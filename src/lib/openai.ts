import "server-only";
import OpenAI from "openai";
import { assertIntegrationsEnabled } from "@/lib/security/staging-policy";
import { lazyClient } from "@/lib/security/lazy-client";
export const openai = lazyClient(() => new OpenAI({apiKey:process.env.OPENAI_API_KEY}), assertIntegrationsEnabled);
