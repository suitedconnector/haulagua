'use client';

import Link from 'next/link';

export type CalculatorResultProps = {
  label?: string;
  value: number | null;
  unit?: string;
  ctaText?: string;
  showHaulerCTAs?: boolean;
};

export default function CalculatorResult({
  label = 'Estimated Gallons',
  value,
  unit = 'gallons',
  ctaText = 'Find Bulk Water Haulers Near You',
  showHaulerCTAs = true,
}: CalculatorResultProps) {
  if (value === null) {
    return (
      <p
        className="text-center text-sm italic text-[#333333]/40"
        style={{ fontFamily: 'var(--font-lato, Lato, sans-serif)' }}
      >
        Enter dimensions above to see your estimate.
      </p>
    );
  }

  const formatted = value.toLocaleString('en-US');

  return (
    <div className="rounded-lg border-t-4 border-[#F2A900] bg-[#F8F9FA] p-8">
      <p
        className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-[#333333]/50"
        style={{ fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}
      >
        {label}
      </p>
      <p
        className="text-center text-4xl font-bold text-[#005A9C] sm:text-5xl"
        style={{ fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}
      >
        {formatted}
      </p>
      <p
        className="mt-1 text-center text-sm text-[#333333]/50"
        style={{ fontFamily: 'var(--font-lato, Lato, sans-serif)' }}
      >
        {unit}
      </p>

      {showHaulerCTAs && (
        <div className="mt-8">
          <p
            className="mb-4 text-center text-sm font-semibold text-[#333333]"
            style={{ fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}
          >
            {ctaText}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/water-haulers/tx"
              className="inline-flex items-center justify-center rounded-md bg-[#005A9C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#F2A900] hover:text-[#333333]"
              style={{ fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}
            >
              Find Texas Haulers →
            </Link>
            <Link
              href="/water-haulers/az"
              className="inline-flex items-center justify-center rounded-md bg-[#005A9C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#F2A900] hover:text-[#333333]"
              style={{ fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}
            >
              Find Arizona Haulers →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
