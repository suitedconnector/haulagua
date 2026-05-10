'use client';

import { useState, useMemo } from 'react';
import ShapeSelector, { type PoolShape } from './shared/ShapeSelector';
import CalculatorResult from './shared/CalculatorResult';

const MULTIPLIERS: Record<PoolShape, number> = {
  rectangular: 7.48,
  oval: 5.9,
  kidney: 7.0,
};

const INPUT_CLASS =
  'w-full rounded-md border-2 border-gray-300 bg-white px-4 py-2.5 text-sm text-[#333333] ' +
  'placeholder:text-[#333333]/30 transition-colors ' +
  'focus:border-[#005A9C] focus:ring-2 focus:ring-[#005A9C]/20 focus:outline-none';

const LABEL_STYLE = { fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' };
const BODY_STYLE  = { fontFamily: 'var(--font-lato, Lato, sans-serif)' };

export default function PoolCalculator() {
  const [selectedShape, setSelectedShape] = useState<PoolShape | null>(null);
  const [length, setLength]     = useState('');
  const [width, setWidth]       = useState('');
  const [avgDepth, setAvgDepth] = useState('');

  const gallons = useMemo<number | null>(() => {
    if (!selectedShape) return null;
    const l = parseFloat(length);
    const w = parseFloat(width);
    const d = parseFloat(avgDepth);
    if (!l || !w || !d || l <= 0 || w <= 0 || d <= 0) return null;
    return Math.round(l * w * d * MULTIPLIERS[selectedShape]);
  }, [selectedShape, length, width, avgDepth]);

  return (
    <div className="mx-auto max-w-3xl bg-white px-4 py-12">
      <div className="space-y-8">

        {/* Header */}
        <div>
          <h2
            className="text-3xl font-bold text-[#333333]"
            style={LABEL_STYLE}
          >
            Pool Gallon Calculator
          </h2>
          <p className="mt-2 text-base text-[#333333]/70" style={BODY_STYLE}>
            Calculate exactly how many gallons your pool holds. No signup required.
          </p>
        </div>

        {/* Step 1: Shape */}
        <div>
          <p className="mb-4 text-lg font-semibold text-[#333333]" style={LABEL_STYLE}>
            Step 1 — Choose your pool shape
          </p>
          <ShapeSelector selected={selectedShape} onSelect={setSelectedShape} />
        </div>

        {/* Step 2: Dimensions — revealed after shape is chosen */}
        {selectedShape && (
          <div>
            <p className="mb-4 text-lg font-semibold text-[#333333]" style={LABEL_STYLE}>
              Step 2 — Enter your pool dimensions
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="pool-length"
                  className="mb-1.5 block text-sm font-semibold text-[#333333]"
                  style={LABEL_STYLE}
                >
                  Length (feet)
                </label>
                <input
                  id="pool-length"
                  type="number"
                  min={1}
                  max={1000}
                  step={1}
                  placeholder="e.g. 30"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label
                  htmlFor="pool-width"
                  className="mb-1.5 block text-sm font-semibold text-[#333333]"
                  style={LABEL_STYLE}
                >
                  Width (feet)
                </label>
                <input
                  id="pool-width"
                  type="number"
                  min={1}
                  max={1000}
                  step={1}
                  placeholder="e.g. 15"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label
                  htmlFor="pool-depth"
                  className="mb-1.5 block text-sm font-semibold text-[#333333]"
                  style={LABEL_STYLE}
                >
                  Avg Depth (feet)
                </label>
                <input
                  id="pool-depth"
                  type="number"
                  min={1}
                  max={50}
                  step={0.5}
                  placeholder="e.g. 5"
                  value={avgDepth}
                  onChange={(e) => setAvgDepth(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        <CalculatorResult value={gallons} />

        {/* Disclaimer */}
        <p className="text-xs text-[#333333]/40" style={BODY_STYLE}>
          These are estimates. Actual pool volume may vary based on shape irregularities and exact depth.
        </p>
      </div>
    </div>
  );
}
