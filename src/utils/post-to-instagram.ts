import { toast } from "sonner";

type InstagramShareOptions = {
  url: string; // Required
  text?: string; // Optional text to include
};

export function shareToInstagram({ url, text }: InstagramShareOptions) {
  if (!url) {
    throw new Error("Instagram share requires a URL");
  }

  // Instagram doesn't have a direct web share URL like Facebook or LinkedIn
  // We'll use the Web Share API if available, otherwise fall back to copying the link
  if (navigator.share) {
    navigator
      .share({
        title: text || "Check this out!",
        url,
      })
      .catch(() => {
        toast.error("Failed to share to Instagram.");
      });
  } else {
    // Fallback: Open Instagram website or copy to clipboard
    // Since Instagram doesn't support direct web sharing, we'll open their homepage
    // Users can manually paste the link in their post
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");

    // Copy the URL to clipboard for easy pasting
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success(
          "Link copied to clipboard. You can now paste it in your Instagram post."
        );
      })
      .catch(() => {
        toast.error("Failed to copy link to clipboard.");
      });
  }
}
