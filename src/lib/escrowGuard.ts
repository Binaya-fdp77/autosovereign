import crypto from 'crypto';

export interface EscrowReleaseRule {
  isCodeAudited: boolean;
  isConsensusReached: boolean;
  isBudgetValid: boolean;
  hasBuyerApprovedOrJuryWon: boolean;
}

export class EscrowDeterministicGuard {
  /**
   * Strictly deterministic boolean check for money movement.
   * AI output NEVER touches payout triggers directly.
   */
  static validatePayoutEligibility(rules: EscrowReleaseRule): { eligible: boolean; reason: string } {
    if (!rules.isBudgetValid) {
      return { eligible: false, reason: 'DETERMINISTIC_REJECT: Invalid or corrupted budget payload' };
    }
    if (!rules.isCodeAudited) {
      return { eligible: false, reason: 'DETERMINISTIC_REJECT: Code Auditor verification step missing' };
    }
    if (!rules.isConsensusReached || !rules.hasBuyerApprovedOrJuryWon) {
      return { eligible: false, reason: 'DETERMINISTIC_REJECT: Multi-Agent Jury consensus not satisfied' };
    }
    return { eligible: true, reason: 'DETERMINISTIC_PASS: All security rules hard-verified' };
  }

  /**
   * Generates a deterministic idempotency key for PayPal API headers.
   * Prevents double payouts during network latency or duplicate retries.
   */
  static generatePayPalIdempotencyKey(contractId: string, milestoneId: string): string {
    const raw = `PAYPAL-IDEMPOTENCY-${contractId}-${milestoneId}`;
    return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 36);
  }
}