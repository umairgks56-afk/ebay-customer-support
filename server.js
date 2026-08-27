import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const root = path.dirname(fileURLToPath(import.meta.url));

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
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
    if (!ai) return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });

    const prompt = `${SYSTEM}\n\nCategory: ${category}\nTone: ${tone}\nCustomer message:\n${customerMessage}\n\nOrder/product context:\n${orderContext || "(none)"}\n\nSeller instructions:\n${sellerInstructions || "(none)"}\n\nWrite only the customer-facing eBay reply.`;
    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    res.json({ reply: response.text?.trim() || "" });
  } catch (error) {
    console.error(error);
    const status = Number(error?.status || error?.code || 500);
    const message = status === 429
      ? "Gemini free-tier limit reached. Please wait and try again later."
      : (error?.message || "Generation failed.");
    res.status(500).json({ error: message });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true, model: MODEL, keyConfigured: Boolean(process.env.GEMINI_API_KEY) }));
app.listen(PORT, "0.0.0.0", () => console.log(`eBay Customer Support AI listening on ${PORT}`));
