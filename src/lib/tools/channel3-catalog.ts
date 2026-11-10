import { tool } from "ai";
import { z } from "zod";

export const channel3ProductLookupTool = tool({
  description: "Fetches verified product specs, pricing, and merchant data across 100M+ products via Channel3 API.",
  parameters: z.object({
    query: z.string().describe("Product query or direct URL to look up."),
  }),
  execute: async ({ query }) => {
    const CHANNEL3_API_KEY = process.env.CHANNEL3_API_KEY;
    
    const response = await fetch(\https://api.trychannel3.com/v1/search?q=\ + encodeURIComponent(query), {
      headers: {
        Authorization: \Bearer \ + CHANNEL3_API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { found: false, items: [] };
    }

    const data = await response.json();
    return {
      found: true,
      products: data.results.slice(0, 3).map((item: any) => ({
        title: item.title,
        price: item.price,
        currency: item.currency,
        merchant: item.merchant_domain,
        url: item.url,
      })),
    };
  },
});
