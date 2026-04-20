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
      {/* lighter blue wave, slightly higher */}
      <path
        d="M0,24 Q98,8 195,24 Q293,40 390,24 L390,44 L0,44 Z"
        fill="#067ABC"
        opacity="0.77"
      />
      {/* dark blue wave, fills bottom */}
      <path
        d="M0,30 Q98,14 195,30 Q293,46 390,30 L390,44 L0,44 Z"
        fill="#0461AA"
      />
    </svg>
  );
}
