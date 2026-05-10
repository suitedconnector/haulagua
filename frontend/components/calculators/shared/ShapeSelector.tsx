'use client';

export type PoolShape = 'rectangular' | 'oval' | 'kidney';

export type ShapeSelectorProps = {
  selected: PoolShape | null;
  onSelect: (shape: PoolShape) => void;
};

function RectangularIcon() {
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-full" aria-hidden="true">
      <rect x="8" y="14" width="104" height="52" rx="3" fill="#E8F4FD" stroke="#005A9C" strokeWidth="2.5" />
      {/* dimension tick marks */}
      <line x1="8" y1="72" x2="112" y2="72" stroke="#005A9C" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
      <line x1="116" y1="14" x2="116" y2="66" stroke="#005A9C" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
      <line x1="8" y1="69" x2="8" y2="75" stroke="#005A9C" strokeWidth="1.5" opacity="0.6" />
      <line x1="112" y1="69" x2="112" y2="75" stroke="#005A9C" strokeWidth="1.5" opacity="0.6" />
      <line x1="113" y1="14" x2="119" y2="14" stroke="#005A9C" strokeWidth="1.5" opacity="0.6" />
      <line x1="113" y1="66" x2="119" y2="66" stroke="#005A9C" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

function OvalIcon() {
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-full" aria-hidden="true">
      <ellipse cx="60" cy="40" rx="54" ry="30" fill="#E8F4FD" stroke="#005A9C" strokeWidth="2.5" />
      <line x1="6" y1="72" x2="114" y2="72" stroke="#005A9C" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
      <line x1="116" y1="10" x2="116" y2="70" stroke="#005A9C" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
      <line x1="6" y1="69" x2="6" y2="75" stroke="#005A9C" strokeWidth="1.5" opacity="0.6" />
      <line x1="114" y1="69" x2="114" y2="75" stroke="#005A9C" strokeWidth="1.5" opacity="0.6" />
      <line x1="113" y1="10" x2="119" y2="10" stroke="#005A9C" strokeWidth="1.5" opacity="0.6" />
      <line x1="113" y1="70" x2="119" y2="70" stroke="#005A9C" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

function KidneyIcon() {
  return (
    <svg viewBox="0 0 120 80" className="h-20 w-full" aria-hidden="true">
      {/*
        Right lobe: larger, sweeps from top-right down and around.
        Left lobe: smaller upper section with the characteristic concave notch.
      */}
      <path
        d="M 58 8
           C 82 6, 108 22, 108 44
           C 108 66, 84 76, 64 72
           C 50 69, 42 60, 42 52
           C 42 46, 46 43, 44 38
           C 42 32, 34 28, 34 20
           C 34 11, 44 9, 58 8 Z"
        fill="#E8F4FD"
        stroke="#005A9C"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SHAPES: { id: PoolShape; name: string; Icon: () => React.ReactElement }[] = [
  { id: 'rectangular', name: 'Rectangular', Icon: RectangularIcon },
  { id: 'oval', name: 'Oval', Icon: OvalIcon },
  { id: 'kidney', name: 'Kidney / Freeform', Icon: KidneyIcon },
];

import React from 'react';

export default function ShapeSelector({ selected, onSelect }: ShapeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {SHAPES.map(({ id, name, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className={[
            'flex flex-col items-center rounded-lg border-2 p-6 text-center transition-all duration-200',
            selected === id
              ? 'border-[#005A9C] bg-[#005A9C]/10 ring-2 ring-[#005A9C]'
              : 'border-gray-300 bg-white hover:border-[#005A9C]/50 hover:shadow-md',
          ].join(' ')}
        >
          <div className="w-full">
            <Icon />
          </div>
          <span
            className="mt-3 text-sm font-semibold text-[#333333]"
            style={{ fontFamily: 'var(--font-montserrat, Montserrat, sans-serif)' }}
          >
            {name}
          </span>
          <span
            className="mt-1 text-xs text-[#333333]/50"
            style={{ fontFamily: 'var(--font-lato, Lato, sans-serif)' }}
          >
            Length · Width · Avg Depth
          </span>
        </button>
      ))}
    </div>
  );
}
