import fetch from 'node-fetch';

async function simulateWebhook() {
  const webhookEvent = {
    id: "WH-SIMULATED-TEST-EVENT-ID",
    event_version: "1.0",
    create_time: new Date().toISOString(),
    resource_type: "checkout-order",
    event_type: "PAYMENT.CAPTURE.COMPLETED",
    summary: "A payment capture was completed",
    resource: {
      id: "CAP-SIMULATED-12345",
      status: "COMPLETED",
      amount: {
        currency_code: "USD",
        value: "1500.00"
      },
      custom_id: "YOUR_COPIED_CONTRACT_ID"
    }
  };

  const headers = {
    'content-type': 'application/json',
    'paypal-transmission-id': 'simulated-transmission-id-999',
    'paypal-transmission-time': new Date().toISOString(),
    'paypal-cert-url': 'https://api.sandbox.paypal.com/v1/notifications/certs/CERT-SIMULATED',
    'paypal-auth-algo': 'SHA256withRSA',
    'paypal-transmission-sig': 'simulated-signature-hash-string',
  };

  console.log('Sending simulated PayPal webhook payload...');

  const response = await fetch('http://localhost:3000/api/webhooks/paypal', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(webhookEvent),
  });

  const data = await response.json();
  console.log(`Response Status: ${response.status}`);
  console.log('Response Body:', data);
}

simulateWebhook().catch(console.error);
