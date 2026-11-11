"use client";
import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const post = (url: string, body: object) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());

export default function BuyerCheckout({ contractId, onDone }: { contractId: string; onDone?: () => void }) {
  const [msg, setMsg] = useState("");
  const [decline, setDecline] = useState(false);
  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, currency: "USD", intent: "capture" }}>
      <label className="text-sm">
        <input type="checkbox" checked={decline} onChange={(e) => setDecline(e.target.checked)} /> Simulate card decline
      </label>
      <PayPalButtons
        createOrder={async () => {
          const d = await post("/api/escrow/create", { contractId });
          if (!d.paypalOrderId) throw new Error(d.error || "create failed");
          return d.paypalOrderId;
        }}
        onApprove={async () => {
          const d = await post("/api/escrow/capture", { contractId, simulate: decline ? "decline" : undefined });
          setMsg(d.success ? "Escrow funded" : `Payment failed: ${d.issue}`);
          if (d.success) onDone?.();
        }}
        onError={(e) => setMsg(String(e))}
      />
      <p className="text-sm">{msg}</p>
    </PayPalScriptProvider>
  );
}