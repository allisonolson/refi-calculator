import pako from 'pako';
import type { CalculatorInputs, LumpSum, RefinanceOption } from '../types/mortgage';

/**
 * Compact field names mapping for URL encoding
 * Using short keys dramatically reduces JSON size
 */
interface CompactData {
  c: {           // currentLoan
    d: string;   // currentDate
    p: number;   // principal
    r: number;   // annualRate
    m: number;   // monthlyPayment
    e?: number;  // extraMonthlyPrincipal (optional)
  };
  l?: Array<{    // lumpSums (optional if empty)
    a: number;   // amount
    d: string;   // date
  }>;
  o?: Array<{    // refinanceOptions (optional if empty) - changed from 'r' to 'o' to avoid conflict
    l: string;   // label
    t: number;   // termYears
    r: number;   // annualRate
    s: string;   // startDate
    p?: number;  // desiredMonthlyPayment (optional)
  }>;
  s?: {          // paymentSettings (optional if empty)
    r?: string;  // recastDate
    m?: string;  // loanMaturityDate
  };
}

/**
 * Convert full inputs to compact format
 */
function toCompact(inputs: CalculatorInputs): CompactData {
  const compact: CompactData = {
    c: {
      d: inputs.currentLoan.currentDate,
      p: inputs.currentLoan.principal,
      r: inputs.currentLoan.annualRate,
      m: inputs.currentLoan.monthlyPayment
    }
  };

  // Only include extraMonthlyPrincipal if non-zero
  if (inputs.currentLoan.extraMonthlyPrincipal) {
    compact.c.e = inputs.currentLoan.extraMonthlyPrincipal;
  }

  // Only include lumpSums if not empty
  if (inputs.lumpSums.length > 0) {
    compact.l = inputs.lumpSums.map(ls => ({
      a: ls.amount,
      d: ls.date
    }));
  }

  // Only include refinanceOptions if not empty
  if (inputs.refinanceOptions.length > 0) {
    compact.o = inputs.refinanceOptions.map(refi => {
      const o: CompactData['o'][0] = {
        l: refi.label,
        t: refi.termYears,
        r: refi.annualRate,
        s: refi.startDate
      };
      if (refi.desiredMonthlyPayment) {
        o.p = refi.desiredMonthlyPayment;
      }
      return o;
    });
  }

  // Only include paymentSettings if has values
  const hasSettings = inputs.paymentSettings.recastDate || inputs.paymentSettings.loanMaturityDate;
  if (hasSettings) {
    compact.s = {};
    if (inputs.paymentSettings.recastDate) {
      compact.s.r = inputs.paymentSettings.recastDate;
    }
    if (inputs.paymentSettings.loanMaturityDate) {
      compact.s.m = inputs.paymentSettings.loanMaturityDate;
    }
  }

  return compact;
}

/**
 * Convert compact format back to full inputs
 */
function fromCompact(compact: CompactData): CalculatorInputs {
  return {
    currentLoan: {
      currentDate: compact.c.d,
      principal: compact.c.p,
      annualRate: compact.c.r,
      monthlyPayment: compact.c.m,
      extraMonthlyPrincipal: compact.c.e || 0
    },
    lumpSums: (compact.l || []).map((ls, index) => ({
      id: `lump-${index}`,  // Regenerate ID
      amount: ls.a,
      date: ls.d
    })),
    refinanceOptions: (compact.o || []).map((refi, index) => ({
      id: `refi-${index}`,  // Regenerate ID
      label: refi.l,
      termYears: refi.t,
      annualRate: refi.r,
      startDate: refi.s,
      desiredMonthlyPayment: refi.p
    })),
    paymentSettings: {
      recastDate: compact.s?.r,
      loanMaturityDate: compact.s?.m
    }
  };
}

/**
 * Base64url encoding (URL-safe variant of base64)
 */
function base64urlEncode(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');  // Remove padding
}

/**
 * Base64url decoding
 */
function base64urlDecode(str: string): Uint8Array {
  // Add padding back
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

/**
 * Encode inputs to compressed URL hash
 */
export function encodeToHash(inputs: CalculatorInputs): string {
  try {
    const compact = toCompact(inputs);
    const json = JSON.stringify(compact);
    const compressed = pako.deflate(json);
    return base64urlEncode(compressed);
  } catch (error) {
    console.error('Failed to encode inputs to hash:', error);
    throw error;
  }
}

/**
 * Decode compressed URL hash to inputs
 */
export function decodeFromHash(hash: string): CalculatorInputs | null {
  try {
    if (!hash) return null;

    const compressedData = base64urlDecode(hash);
    const decompressed = pako.inflate(compressedData, { to: 'string' });
    const compact = JSON.parse(decompressed) as CompactData;

    // Validate structure
    if (!compact || typeof compact !== 'object' || !compact.c) {
      return null;
    }

    return fromCompact(compact);
  } catch (error) {
    // Invalid hash, corrupted data, or parse error - fail silently
    return null;
  }
}
