"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function CheckoutPage() {
  return (
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h1>Checkout: $10.00</h1>
      <PayPalScriptProvider
        options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
          currency: "USD",
        }}
      >
        <PayPalButtons
          fundingSource="paypal"
          createOrder={async () => {
            const res = await fetch("/api/paypal/create-order", { method: "POST" });
            const data = await res.json();
            if (!data.id) throw new Error("Could not create order");
            return data.id;
          }}
          onApprove={async (data) => {
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID }),
            });
            const result = await res.json();
            alert(result.status === "COMPLETED" ? "Payment successful!" : "Payment failed");
          }}
          onError={(err) => {
            console.error(err);
            alert("Something went wrong. Check the terminal for details.");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}