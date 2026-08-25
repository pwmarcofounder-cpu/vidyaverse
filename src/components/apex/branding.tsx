import { Link } from "@tanstack/react-router";

import logoAsset from "@/assets/vidyaverse-logo.png.asset.json";

export const LOGO_URL = logoAsset.url;
export const TELEGRAM_URL = "https://t.me/vidya_verse";

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img
        src={LOGO_URL}
        alt="VidyaVerse logo"
        className={compact ? "h-8 w-8 object-contain" : "h-10 w-10 object-contain"}
        width={40}
        height={40}
        decoding="async"
      />

      <span className="leading-none">
        <span className="block font-display text-base font-bold tracking-tight sm:text-lg">
          VidyaVerse
        </span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Learn. Practice. Excel.
        </span>
      </span>
    </Link>
  );
}