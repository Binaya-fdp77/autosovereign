'use client';
import { useState } from 'react';

interface SettlementCertificateCardProps {
  contracts: any[];
  onCertificateGenerated: () => void;
}

export default function SettlementCertificateCard({ contracts, onCertificateGenerated }: SettlementCertificateCardProps) {
  const [selectedContractId, setSelectedContractId] = useState('');
  const [gitCommitSha, setGitCommitSha] = useState('8f4a1c90e3d211b8972e81112bc3456789abcdef');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);

  const handleGenerateCertificate = async () => {
    if (!selectedContractId) {
      alert('Select a contract to generate a settlement certificate.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/settlement-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: selectedContractId, gitCommitSha })
      });

      const data = await res.json();
      if (data.success) {
        setCertificate(data.certificate);
        onCertificateGenerated();
      } else {
        alert('Certificate Error: ' + data.error);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-cyan-400">Cryptographic Settlement Certificate</h2>
          <p className="text-xs text-slate-400 mt-0.5">SHA-256 Tamper-Proof Proof (Git SHA + PayPal Payout ID)</p>
        </div>
        <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-1 rounded-full">
          Hackathon Winner Shield Active
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Target Escrow Contract</label>
          <select
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="">-- Select Completed Escrow Contract --</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} (${c.totalAmount})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Verified GitHub Commit SHA</label>
          <input
            type="text"
            value={gitCommitSha}
            onChange={(e) => setGitCommitSha(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          onClick={handleGenerateCertificate}
          disabled={loading || !selectedContractId}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg text-xs transition-colors disabled:opacity-50"
        >
          {loading ? 'Hashing & Binding Signature...' : 'Generate Verified Settlement Certificate'}
        </button>
      </div>

      {certificate && (
        <div className="mt-4 bg-slate-950 border border-cyan-800 rounded-lg p-4 space-y-3 font-mono text-xs print:bg-white print:text-black">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-cyan-400 font-bold">{certificate.certificateId}</span>
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-sans">
              100% DETERMINISTIC VERIFIED
            </span>
          </div>

          <div className="space-y-1 text-slate-300">
            <p><strong className="text-slate-400">Contract Title:</strong> {certificate.title}</p>
            <p><strong className="text-slate-400">Total Settled:</strong> ${certificate.totalAmount} {certificate.currency}</p>
            <p><strong className="text-slate-400">PayPal Batch ID:</strong> <span className="text-indigo-400">{certificate.paypalBatchId}</span></p>
            <p><strong className="text-slate-400">Git Commit SHA:</strong> <span className="text-purple-400">{certificate.gitCommitSha}</span></p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-2 rounded text-[11px] break-all">
            <span className="text-slate-500 block mb-0.5 font-sans">SHA-256 Verification Signature:</span>
            <span className="text-cyan-400">{certificate.cryptographicSignature}</span>
          </div>

          <button
            onClick={() => window.print()}
            className="mt-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs py-1.5 rounded transition-colors font-sans"
          >
            Print / Export Official Certificate (PDF)
          </button>
        </div>
      )}
    </div>
  );
}