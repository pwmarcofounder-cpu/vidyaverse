import { useEffect, useState } from "react";
import { X, Send } from "lucide-react";

import { LOGO_URL, TELEGRAM_URL } from "./branding";

const DISMISS_KEY = "apex-telegram-dismissed";

export function TelegramPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    const timer = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-3 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-label="Join PW-MARCO on Telegram"
        className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-xl"
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <img
          src={LOGO_URL}
          alt="PW-MARCO logo"
          className="mx-auto h-16 w-16 object-contain"
          width={64}
          height={64}
        />
        <h2 className="mt-3 text-lg font-bold">Join PW-MARCO on Telegram</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Get new batch drops, lecture updates and study alerts the moment they go live.
        </p>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Send className="h-4 w-4" aria-hidden />
          JOIN NOW
        </a>
        <button
          onClick={dismiss}
          className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}