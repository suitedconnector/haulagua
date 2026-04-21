interface WaveDividerProps {
  flip?: boolean;
  className?: string;
}

export function WaveDivider({ flip = false, className }: WaveDividerProps) {
  return (
    <div
      style={{ lineHeight: 0, transform: flip ? "rotate(180deg)" : undefined }}
      className={className}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 390 44"
        width="100%"
        height="44"
        preserveAspectRatio="none"
      >
        <path d="M0,14 Q98,-4 195,14 Q293,32 390,14 L390,44 L0,44 Z" fill="#2AA0DC" />
        <path d="M0,28 Q98,12 195,28 Q293,44 390,28 L390,44 L0,44 Z" fill="none" />
      </svg>
    </div>
  );
}
