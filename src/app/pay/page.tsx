import BuyerCheckout from "@/components/BuyerCheckout";
export default function Pay() {
  return (
    <main style={{ maxWidth: 420, margin: "60px auto", fontFamily: "sans-serif" }}>
      <h2>Fund escrow: Landing page build ($100)</h2>
      <BuyerCheckout contractId="demo-contract-1" />
    </main>
  );
}