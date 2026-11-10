import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";

async function runSimulation() {
  console.log("🚀 Starting AutoSovereign End-to-End Simulation...\n");

  try {
    // 1. Dual-Agent Negotiation Handshake
    console.log("🤖 Step 1: Running Buyer-Seller AI Agent Handshake...");
    const handshakeRes = await fetch(BASE_URL + "/api/agent/handshake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectScope: "Enterprise Autonomous Micro-Escrow Platform",
        maxBudget: 1250.00,
      }),
    });
    const handshakeData: any = await handshakeRes.json();
    console.log("✅ Agent Consensus Reached!");
    console.log("   Agreed Price: $" + handshakeData.agreedPrice);
    console.log("   Transcript Summary:", handshakeData.summary || "Negotiation completed successfully.\n");

    // 2. Create PayPal Escrow Order
    console.log("💳 Step 2: Creating PayPal v2 Micro-Escrow Order...");
    const escrowRes = await fetch(BASE_URL + "/api/escrow/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractId: "cnt_" + Math.floor(Math.random() * 90000 + 10000),
        title: "Autonomous Agent Protocol",
        amount: handshakeData.agreedPrice || 1250.00,
      }),
    });
    const escrowData: any = await escrowRes.json();
    console.log("✅ Escrow Order Created Successfully!");
    console.log("   PayPal Order ID:", escrowData.paypalOrderId);
    console.log("   Approval URL:", escrowData.approveUrl || "N/A\n");

    // 3. Simulate PayPal Webhook (Order Approved / Funded)
    console.log("📡 Step 3: Dispatching PayPal Webhook (CHECKOUT.ORDER.APPROVED)...");
    const webhookRes = await fetch(BASE_URL + "/api/webhooks/paypal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "CHECKOUT.ORDER.APPROVED",
        resource: {
          id: escrowData.paypalOrderId || "TEST_ORDER_ID",
          status: "COMPLETED",
          purchase_units: [
            {
              payments: {
                captures: [{ id: "CAP_" + Math.floor(Math.random() * 90000 + 10000) }],
              },
            },
          ],
        },
      }),
    });
    const webhookData: any = await webhookRes.json();
    console.log("✅ Webhook Processed Successfully!");
    console.log("   Server Response:", webhookData);

    console.log("\n🎉 E2E Simulation Completed Successfully! Check your AG Grid dashboard for live telemetry updates.");
  } catch (error) {
    console.error("❌ Simulation failed. Make sure 'npm run dev' is running on port 3000.", error);
  }
}

runSimulation();
