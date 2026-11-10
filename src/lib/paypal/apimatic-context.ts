import "server-only";

export const PAYPAL_APIMATIC_CONTEXT = 
APIMatic Grounded Context for PayPal Orders v2 & Payouts v1:
- Base Endpoint: https://api-m.sandbox.paypal.com
- Auth Header: Bearer <access_token>
- Order Creation: POST /v2/checkout/orders (Requires 'intent': 'CAPTURE', 'purchase_units' array with 'reference_id' and 'amount')
- Batch Payouts: POST /v1/payments/payouts (Requires 'sender_batch_header' and 'items' array with 'recipient_type': 'EMAIL')
- Header Requirements: 'PayPal-Request-Id' for Idempotency, 'PayPal-Mock-Response' for negative testing sandbox flags.
;
