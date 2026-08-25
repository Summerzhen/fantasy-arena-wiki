const DEFAULT_SITE_URL = "https://fantasyarena.wiki";

export function getCanonicalSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  try {
    const url = new URL(rawUrl);
    url.protocol = "https:";
    url.hostname = url.hostname.replace(/^www\./, "");
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}
