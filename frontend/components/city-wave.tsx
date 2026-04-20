export function CityWave({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 390 44"
      width="100%"
      height="44"
      preserveAspectRatio="none"
      className={className}
    >
      {/* lighter blue wave, thicker */}
      <path
        d="M0,14 Q98,-4 195,14 Q293,32 390,14 L390,44 L0,44 Z"
        fill="#2AA0DC"
      />
      {/* dark blue wave, fills bottom */}
      <path
        d="M0,28 Q98,12 195,28 Q293,44 390,28 L390,44 L0,44 Z"
        fill="#0461AA"
      />
    </svg>
  );
}
