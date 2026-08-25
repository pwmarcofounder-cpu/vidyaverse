import { Link } from "@tanstack/react-router";

export const LOGO_URL = "https://i.ibb.co/B51HMGdJ/IMG-20260825-191829-873.jpg";
export const TELEGRAM_URL = "https://t.me/vidya_verse";

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img
        src={LOGO_URL}
        alt="VidyaVerse logo"
        className={compact ? "h-8 w-8 rounded-lg object-cover" : "h-10 w-10 rounded-xl object-cover"}
        width={40}
        height={40}
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