type FacebookShareOptions = {
  url: string; // Required
  quote?: string; // Optional (may be ignored by FB)
  hashtag?: string; // Only ONE hashtag allowed
  ref?: string; // Channel / campaign reference
};

export function shareToFacebook({
  url,
  quote,
  hashtag,
  ref,
}: FacebookShareOptions) {
  if (!url) {
    throw new Error("Facebook share requires a URL");
  }

  const params = new URLSearchParams({
    u: url,
  });

  if (quote) {
    params.append("quote", quote);
  }
  if (hashtag) {
    params.append("hashtag", hashtag);
  }
  if (ref) {
    params.append("ref", ref);
  }

  const shareUrl = `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;

  window.open(shareUrl, "_blank", "noopener,noreferrer");
}
