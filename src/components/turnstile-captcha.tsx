import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";
import { useTheme } from "@/providers/theme-provider";

interface TurnstileCaptchaProps {
  onError?: (error: string) => void;
  onTokenChange: (token: string) => void;
}

export function TurnstileCaptcha({
  onTokenChange,
  onError,
}: TurnstileCaptchaProps) {
  const { theme } = useTheme();
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  function handleSuccess(token: string) {
    onTokenChange(token);
  }

  function handleExpire() {
    onTokenChange("");
    onError?.("CAPTCHA has expired. Please verify again.");
  }

  function handleError() {
    onTokenChange("");
    onError?.("CAPTCHA verification failed. Please try again.");
  }

  return (
    <div className="rounded-xl border border-input bg-input">
      <Turnstile
        className="overflow-hidden rounded-[calc(var(--radius)+5px)]"
        onError={handleError}
        onExpire={handleExpire}
        onSuccess={handleSuccess}
        options={{
          theme: theme === "system" ? "auto" : theme,
          size: "flexible",
        }}
        ref={turnstileRef}
        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
      />
    </div>
  );
}
