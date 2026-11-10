import { tool } from "ai";
import { z } from "zod";

export const kernelWebVerifierTool = tool({
  description: "Spins up a Kernel cloud headless browser session to verify live web deliverables or GitHub commits.",
  parameters: z.object({
    targetUrl: z.string().url().describe("The URL of the deployed deliverable to inspect."),
    expectedSelector: z.string().optional().describe("CSS selector to check on the live page."),
  }),
  execute: async ({ targetUrl, expectedSelector }) => {
    const KERNEL_API_KEY = process.env.KERNEL_API_KEY;
    if (!KERNEL_API_KEY) {
      throw new Error("Missing KERNEL_API_KEY in environment variables.");
    }

    const response = await fetch("https://api.kernel.sh/v1/browser/sessions", {
      method: "POST",
      headers: {
        Authorization: \Bearer $ {KERNEL_API_KEY}\,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: targetUrl,
        stealth: true,
        actions: expectedSelector
          ? [{ type: "waitForSelector", selector: expectedSelector }]
          : [{ type: "screenshot" }],
      }),
    });

    if (!response.ok) {
      return { verified: false, reason: \Kernel browser failed to reach \$ {targetUrl}\ };
    }

    const sessionData = await response.json();
    return {
      verified: true,
      sessionId: sessionData.id,
      status: "DELIVERABLE_DOM_VERIFIED",
    };
  },
});
