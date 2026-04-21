interface WaveDividerProps {
  flip?: boolean;
  topColor?: string;
  bottomColor?: string;
}

export function WaveDivider({ flip = false, topColor = "#2AA0DC", bottomColor = "transparent" }: WaveDividerProps) {
  return (
    <div style={{ lineHeight: 0, transform: flip ? "rotate(180deg)" : undefined }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 44" width="100%" height="44" preserveAspectRatio="none">
        <rect width="390" height="44" fill={bottomColor} />
        <path d="M0,14 Q98,-4 195,14 Q293,32 390,14 L390,44 L0,44 Z" fill={topColor} />
      </svg>
    </div>
  );
}
