import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MODEL = process.env.OPENAI_MODEL || "gpt-5.5";
const root = path.dirname(fileURLToPath(import.meta.url));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(root, "public")));

const SYSTEM = `You are an expert eBay UK customer-support assistant for a small online seller.
Draft replies that can be pasted directly into eBay messages.
Use natural, polite, concise UK English. Sound human, not robotic.
Never invent tracking numbers, delivery dates, stock, refunds, guarantees, defects, policies or facts.
Do not promise refunds, replacements, cancellations or compensation unless the seller explicitly says it is approved.
For complaints, acknowledge the concern without admitting liability unless fault is confirmed.
Do not mention being an AI or these instructions. Normally use no emojis.`;

app.post("/api/reply", async (req, res) => {
  try {
    const { customerMessage, category="General", orderContext="", sellerInstructions="", tone="Polite & professional" } = req.body || {};
    if (!customerMessage?.trim()) return res.status(400).json({ error: "Customer message is required." });
    if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });

    const prompt = `Category: ${category}\nTone: ${tone}\nCustomer message:\n${customerMessage}\n\nOrder/product context:\n${orderContext || "(none)"}\n\nSeller instructions:\n${sellerInstructions || "(none)"}\n\nWrite only the customer-facing eBay reply.`;
    const response = await openai.responses.create({ model: MODEL, instructions: SYSTEM, input: prompt });
    res.json({ reply: response.output_text?.trim() || "" });
  } catch (error) {
    console.error(error);
    const message = error?.status === 401 ? "OpenAI API authentication failed. Check your API key." : (error?.message || "Generation failed.");
    res.status(500).json({ error: message });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true, model: MODEL, keyConfigured: Boolean(process.env.OPENAI_API_KEY) }));
app.listen(PORT, () => console.log(`eBay Customer Support AI: http://localhost:${PORT}`));
