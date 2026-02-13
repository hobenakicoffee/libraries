type XShareOptions = {
  text: string; // Required
  url?: string; // Optional URL to share
  hashtags?: string; // Comma-separated hashtags (without #)
  via?: string; // Twitter username to attribute (without @)
  related?: string; // Comma-separated accounts to recommend
};

export function shareToX({ text, url, hashtags, via, related }: XShareOptions) {
  if (!text) {
    throw new Error("X share requires text content");
  }

  const params = new URLSearchParams({
    text,
  });

  if (url) params.append("url", url);
  if (hashtags) params.append("hashtags", hashtags);
  if (via) params.append("via", via);
  if (related) params.append("related", related);

  const shareUrl = `https://twitter.com/intent/tweet?${params.toString()}`;

  window.open(shareUrl, "_blank", "noopener,noreferrer");
}
