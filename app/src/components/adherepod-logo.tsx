export function AdherepodLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="10 35 100 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="10" y="35" width="100" height="50" rx="25" fill="#0f172a" />
      <rect x="26" y="65" width="5" height="10" rx="2" fill="#ef4444" />
      <rect x="33" y="57" width="5" height="18" rx="2" fill="#ef4444" />
      <rect x="40" y="45" width="5" height="30" rx="2" fill="#ef4444" />
      <rect x="47" y="57" width="5" height="18" rx="2" fill="#ef4444" />
      <rect x="54" y="65" width="5" height="10" rx="2" fill="#ef4444" />
      <rect x="64" y="45" width="5" height="30" rx="2" fill="white" />
      <rect x="71" y="45" width="5" height="18" rx="2" fill="white" />
      <rect x="78" y="47" width="5" height="14" rx="2" fill="white" />
      <rect x="85" y="45" width="5" height="18" rx="2" fill="white" />
    </svg>
  );
}
