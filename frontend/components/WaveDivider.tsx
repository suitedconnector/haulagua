interface WaveDividerProps {
  flip?: boolean;
  topColor?: string;
  bottomColor?: string;
}

export function WaveDivider({ flip = false, topColor = "transparent", bottomColor = "transparent" }: WaveDividerProps) {
  return (
    <div style={{ lineHeight: 0, transform: flip ? "rotate(180deg)" : undefined }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 44" width="100%" height="44" preserveAspectRatio="none">
        <path d="M0,28 Q98,44 195,28 Q293,12 390,28 L390,0 L0,0 Z" fill={topColor} />
      </svg>
    </div>
  );
}
