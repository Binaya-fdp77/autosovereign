import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 400, margin: "60px auto" }}>
      <h1>AutoSovereign</h1>
      <p>Welcome.</p>
      <Link href="/checkout">Go to checkout</Link>
    </main>
  );
}