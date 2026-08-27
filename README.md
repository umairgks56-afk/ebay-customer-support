# eBay Customer Support AI

A simple eBay UK customer-support reply generator powered by the OpenAI Responses API.

## Features
- Buyer message input
- Delivery, return, refund, cancellation, complaint and other categories
- UK English reply generation
- Tone selector
- Optional order/product context
- Seller-specific instructions
- Copy and regenerate buttons
- API key remains server-side

## Run locally

Requirements: Node.js 18+ and an OpenAI API key.

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env`.
3. Put your API key in `.env` as `OPENAI_API_KEY=...`
4. Start with `npm start`
5. Open `http://localhost:3000`

Never commit `.env` or expose the API key in frontend code.
