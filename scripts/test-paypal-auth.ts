
import dotenv from "dotenv";
dotenv.config();

async function testPayPalAuth() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiBase = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

  if (!clientId || !clientSecret) {
    console.error("Error: PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is missing from .env");
    return;
  }

  console.log("Authenticating with PayPal Sandbox API...");
  console.log(`Endpoint: ${apiBase}`);

  try {
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    const response = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();

    if (response.ok && data.access_token) {
      console.log("\nSUCCESS! Connected to PayPal API successfully.");
      console.log(`Access Token (truncated): ${data.access_token.substring(0, 25)}...`);
      console.log(`Token Expires In: ${data.expires_in} seconds\n`);
    } else {
      console.error("\nPayPal Authentication Failed:", data);
    }
  } catch (err: any) {
    console.error("\nNetwork or Parsing Error:", err.message);
  }
}

testPayPalAuth();

