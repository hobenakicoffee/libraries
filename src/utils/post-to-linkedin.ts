type LinkedInShareOptions = {
  url: string; // Required
  title?: string; // Optional title
  summary?: string; // Optional summary/description
  source?: string; // Optional source attribution
};

export function shareToLinkedIn({
  url,
  title,
  summary,
  source,
}: LinkedInShareOptions) {
  if (!url) {
    throw new Error("LinkedIn share requires a URL");
  }

  const params = new URLSearchParams({
    url,
  });

  if (title) params.append("title", title);
  if (summary) params.append("summary", summary);
  if (source) params.append("source", source);

  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;

  window.open(shareUrl, "_blank", "noopener,noreferrer");
}
