/**
 * Site-wide config. `url` is the only deploy switch. Canonical tags,
 * Open Graph, JSON-LD, robots.txt, sitemap.xml, and the Eleventy path
 * prefix all follow it. Do not add a trailing slash.
 *
 * GitHub Pages project site:
 *   https://truekao1.github.io/storage24
 *
 * Affiliate `url` values stay empty until a program issues a tracked
 * link. Templates must then fall back to `publicUrl` as a plain
 * (non-affiliate) link. Do not present an empty or public URL as a
 * tracked affiliate link.
 *
 * Traditional self-storage operators (Public Storage, Extra Space,
 * CubeSmart, Manhattan Mini Storage, StorQuest, and similar) are linked
 * as plain facility pages. No official Public Storage or Extra Space
 * publisher program with published terms was found in the November 18,
 * 2026 research pass.
 */
const url = normalizeSiteUrl("https://truekao1.github.io/storage24");

function normalizeSiteUrl(value) {
  const parsed = new URL(value);
  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  if (!parsed.pathname || parsed.pathname === "/") return parsed.origin;
  return parsed.origin + parsed.pathname;
}

function pathPrefixFromUrl(value) {
  const { pathname } = new URL(value);
  if (!pathname || pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export default {
  name: "Storage24",
  tagline: "Find storage you can reach at night, with climate control and month-to-month terms.",
  description:
    "A directory of self-storage facilities that publishes access hours separately from office hours, and flags climate control and month-to-month leases only when the operator’s own page says so.",
  url,
  pathPrefix: pathPrefixFromUrl(url),
  locale: "en_US",
  language: "en",
  emailListings: "azb31pt9@mail.grokbot.com",
  emailContact: "azb31pt9@mail.grokbot.com",
  emailsArePlaceholders: false,
  disclosure:
    "Storage24 may earn a commission if you use an approved affiliate link, at no extra cost to you. Until a program approves a tracked URL, buttons go to that company’s public website and are not affiliate links. Individual storage facility pages are ordinary public links, not affiliate offers.",
  affiliates: {
    neighbor: {
      id: "neighbor",
      name: "Neighbor",
      url: "",
      publicUrl: "https://www.neighbor.com/",
      programUrl: "https://host.neighbor.com/affiliate/",
    },
    spareFoot: {
      id: "spareFoot",
      name: "SpareFoot",
      url: "",
      publicUrl: "https://www.sparefoot.com/",
      programUrl: "https://about.sparefoot.com/partners",
    },
  },
};
