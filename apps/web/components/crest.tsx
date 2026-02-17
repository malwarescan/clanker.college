/**
 * Clanker.College crest: shield silhouette with bracket motif.
 * Use in header mark, favicon, certificate stamp. Not a generic coding icon.
 */
export function Crest({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Shield silhouette */}
      <path
        d="M16 2L4 6v10c0 7 5 12 12 14 7-2 12-7 12-14V6L16 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Bracket motif inside shield */}
      <path
        d="M12 10h3v12h-3M20 10h-3v12h3M12 10c0-2 2-4 4-4s4 2 4 4M16 22v-4"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}
