import { describe, it, expect } from 'vitest';
import pako from 'pako';
import { encodeToHash, decodeFromHash } from '../urlEncoding';
import { CURRENT_VERSION } from '../urlMigrations';
import type { CalculatorInputs } from '../../types/mortgage';

/**
 * Helper to manually encode data with a specific version (or no version)
 * Used for testing backward compatibility
 */
function manualEncode(data: Record<string, unknown>): string {
  const json = JSON.stringify(data);
  const compressed = pako.deflate(json);
  const base64 = btoa(String.fromCharCode(...compressed));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

describe('urlEncoding', () => {
  describe('Round-trip encoding', () => {
    it('should encode and decode minimal inputs', () => {
      const inputs: CalculatorInputs = {
        currentLoan: {
          currentDate: '2025-01-01',
          principal: 500000,
          annualRate: 6.5,
          monthlyPayment: 3160.34,
          extraMonthlyPrincipal: 0
        },
        lumpSums: [],
        refinanceOptions: [],
        paymentSettings: {}
      };

      const hash = encodeToHash(inputs);
      const decoded = decodeFromHash(hash);

      expect(decoded).not.toBeNull();
      expect(decoded).toEqual(inputs);
    });

    it('should encode and decode full inputs with all optional fields', () => {
      const inputs: CalculatorInputs = {
        currentLoan: {
          currentDate: '2025-01-01',
          principal: 500000,
          annualRate: 6.5,
          monthlyPayment: 3160.34,
          extraMonthlyPrincipal: 500
        },
        lumpSums: [
          { id: 'lump-1', amount: 50000, date: '2025-06-01' },
          { id: 'lump-2', amount: 25000, date: '2026-01-01' }
        ],
        refinanceOptions: [
          {
            id: 'refi-1',
            label: '30-year 5.5%',
            termYears: 30,
            annualRate: 5.5,
            startDate: '2025-03-01',
            desiredMonthlyPayment: 2800
          },
          {
            id: 'refi-2',
            label: '15-year 4.5%',
            termYears: 15,
            annualRate: 4.5,
            startDate: '2025-03-01'
          }
        ],
        paymentSettings: {
          enableRecast: true,
          recastDate: '2025-07-01',
          loanMaturityDate: '2055-01-01'
        }
      };

      const hash = encodeToHash(inputs);
      const decoded = decodeFromHash(hash);

      expect(decoded).not.toBeNull();

      // Check structure (IDs are regenerated, so check separately)
      expect(decoded!.currentLoan).toEqual(inputs.currentLoan);
      expect(decoded!.lumpSums).toHaveLength(2);
      expect(decoded!.lumpSums[0]).toMatchObject({
        amount: 50000,
        date: '2025-06-01'
      });
      expect(decoded!.lumpSums[1]).toMatchObject({
        amount: 25000,
        date: '2026-01-01'
      });
      expect(decoded!.refinanceOptions).toHaveLength(2);
      expect(decoded!.refinanceOptions[0]).toMatchObject({
        label: '30-year 5.5%',
        termYears: 30,
        annualRate: 5.5,
        startDate: '2025-03-01',
        desiredMonthlyPayment: 2800
      });
      expect(decoded!.refinanceOptions[1]).toMatchObject({
        label: '15-year 4.5%',
        termYears: 15,
        annualRate: 4.5,
        startDate: '2025-03-01'
      });
      expect(decoded!.paymentSettings).toEqual(inputs.paymentSettings);
    });
  });

  describe('Edge cases', () => {
    it('should return null for empty string', () => {
      expect(decodeFromHash('')).toBeNull();
    });

    it('should return null for garbage input', () => {
      expect(decodeFromHash('not-valid-base64url')).toBeNull();
      expect(decodeFromHash('!@#$%^&*()')).toBeNull();
    });

    it('should return null for malformed JSON', () => {
      const hash = manualEncode({ invalid: 'structure' });
      // This will fail validation because it lacks the 'c' field
      expect(decodeFromHash(hash)).toBeNull();
    });
  });

  describe('Version field', () => {
    it('should stamp encoded output with current version', () => {
      const inputs: CalculatorInputs = {
        currentLoan: {
          currentDate: '2025-01-01',
          principal: 500000,
          annualRate: 6.5,
          monthlyPayment: 3160.34,
          extraMonthlyPrincipal: 0
        },
        lumpSums: [],
        refinanceOptions: [],
        paymentSettings: {}
      };

      const hash = encodeToHash(inputs);

      // Decode manually to inspect the raw structure
      const base64 = hash.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
      const compressedData = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
      const decompressed = pako.inflate(compressedData, { to: 'string' });
      const raw = JSON.parse(decompressed);

      expect(raw.v).toBe(CURRENT_VERSION);
    });
  });

  describe('Backward compatibility', () => {
    it('should decode v0 data (no version field)', () => {
      // Manually construct v0 format (original format without version field)
      const v0Data = {
        c: {
          d: '2025-01-01',
          p: 500000,
          r: 6.5,
          m: 3160.34
        }
        // No 'v' field - this is v0
      };

      const hash = manualEncode(v0Data);
      const decoded = decodeFromHash(hash);

      expect(decoded).not.toBeNull();
      expect(decoded!.currentLoan).toEqual({
        currentDate: '2025-01-01',
        principal: 500000,
        annualRate: 6.5,
        monthlyPayment: 3160.34,
        extraMonthlyPrincipal: 0
      });
    });

    it('should decode v0 data with optional fields', () => {
      const v0Data = {
        c: {
          d: '2025-01-01',
          p: 500000,
          r: 6.5,
          m: 3160.34,
          e: 500
        },
        l: [
          { a: 50000, d: '2025-06-01' }
        ],
        s: {
          e: true,
          r: '2025-07-01'
        }
      };

      const hash = manualEncode(v0Data);
      const decoded = decodeFromHash(hash);

      expect(decoded).not.toBeNull();
      expect(decoded!.currentLoan.extraMonthlyPrincipal).toBe(500);
      expect(decoded!.lumpSums).toHaveLength(1);
      expect(decoded!.lumpSums[0].amount).toBe(50000);
      expect(decoded!.paymentSettings.enableRecast).toBe(true);
    });
  });

  describe('Migration handling', () => {
    it('should pass through current version data unchanged', () => {
      const inputs: CalculatorInputs = {
        currentLoan: {
          currentDate: '2025-01-01',
          principal: 500000,
          annualRate: 6.5,
          monthlyPayment: 3160.34,
          extraMonthlyPrincipal: 0
        },
        lumpSums: [],
        refinanceOptions: [],
        paymentSettings: {}
      };

      const hash = encodeToHash(inputs);
      const decoded = decodeFromHash(hash);

      expect(decoded).toEqual(inputs);
    });

    it('should treat missing version as v0', () => {
      const dataWithoutVersion = {
        c: {
          d: '2025-01-01',
          p: 400000,
          r: 5.5,
          m: 2271.16
        }
      };

      const hash = manualEncode(dataWithoutVersion);
      const decoded = decodeFromHash(hash);

      expect(decoded).not.toBeNull();
      expect(decoded!.currentLoan.principal).toBe(400000);
    });

    it('should reject future version data', () => {
      const futureData = {
        v: CURRENT_VERSION + 1,
        c: {
          d: '2025-01-01',
          p: 500000,
          r: 6.5,
          m: 3160.34
        }
      };

      const hash = manualEncode(futureData);
      const decoded = decodeFromHash(hash);

      // Migration error should be caught and return null
      expect(decoded).toBeNull();
    });
  });
});
