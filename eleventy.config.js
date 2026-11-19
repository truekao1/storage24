import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HtmlBasePlugin } from "@11ty/eleventy";
import site from "./src/_data/site.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function originAndPrefix(base) {
  const root = String(base || "").replace(/\/$/, "");
  try {
    const { origin, pathname } = new URL(root);
    const prefix = !pathname || pathname === "/" ? "" : pathname.replace(/\/$/, "");
    return { origin, prefix, root };
  } catch {
    return { origin: root, prefix: "", root };
  }
}

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addWatchTarget("data/cities/");
  eleventyConfig.addWatchTarget("src/assets/");

  eleventyConfig.addFilter("isoDate", (value) => {
    if (!value) return "";
    return String(value).slice(0, 10);
  });

  eleventyConfig.addFilter("displayDate", (value) => {
    if (!value) return "";
    const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("hoursSummary", (hours) => {
    if (!hours) return "Confirm with the store";
    if (hours.summary) return hours.summary;
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const values = days.map((day) => (hours[day] || "").trim());
    const groups = [];
    let i = 0;
    while (i < 7) {
      let j = i;
      while (j + 1 < 7 && values[j + 1] === values[i] && values[i]) j += 1;
      if (values[i]) {
        const label = i === j ? labels[i] : `${labels[i]}–${labels[j]}`;
        groups.push(`${label} ${values[i]}`);
      }
      i = j + 1;
    }
    return groups.join("; ") || "Confirm with the store";
  });

  eleventyConfig.addFilter("telHref", (phone) => {
    if (!phone) return "";
    const digits = String(phone).replace(/[^\d+]/g, "");
    return digits ? `tel:${digits}` : "";
  });

  eleventyConfig.addFilter("slugifyId", (name) =>
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );

  eleventyConfig.addFilter("jsonLd", (obj) =>
    JSON.stringify(obj).replace(/</g, "\\u003c")
  );

  eleventyConfig.addFilter("absoluteUrl", (pathname, base) => {
    const { origin, prefix, root } = originAndPrefix(base);
    if (!pathname) return `${root}/`;
    if (/^https?:\/\//.test(pathname)) return pathname;
    const pathName = pathname.startsWith("/") ? pathname : `/${pathname}`;
    if (prefix && (pathName === prefix || pathName.startsWith(`${prefix}/`))) {
      return `${origin}${pathName}`;
    }
    return `${root}${pathName}`;
  });

  eleventyConfig.addFilter("cityPath", (city) => {
    const state = String(city.state || "").toLowerCase();
    const slug =
      city.citySlug ||
      String(city.city || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
    return `/${state}/${slug}/`;
  });

  eleventyConfig.addFilter("joinList", (items) => {
    if (!Array.isArray(items) || !items.length) return "";
    return items.join(", ");
  });

  eleventyConfig.addFilter("affiliateHref", (program) => {
    if (!program) return "";
    const tracked = String(program.url || "").trim();
    if (tracked) return tracked;
    return program.publicUrl || "";
  });

  eleventyConfig.addFilter("affiliateIsTracked", (program) =>
    Boolean(program && String(program.url || "").trim())
  );

  const dayMap = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  function parseClockRange(value) {
    if (!value) return null;
    const text = String(value);
    if (/^not published$/i.test(text.trim())) return null;
    if (/^closed$/i.test(text.trim())) return null;
    const re =
      /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)|midnight|noon)\s*[–-]\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)|midnight)/i;
    const m = text.match(re);
    if (!m) return null;
    const to24 = (s) => {
      const t = s.trim().toLowerCase();
      if (t === "midnight") return "00:00";
      if (t === "noon") return "12:00";
      const mm = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)/);
      if (!mm) return null;
      let h = Number(mm[1]);
      const min = mm[2];
      const ap = mm[3];
      if (ap === "pm" && h !== 12) h += 12;
      if (ap === "am" && h === 12) h = 0;
      return `${String(h).padStart(2, "0")}:${min}`;
    };
    let opens = to24(m[1]);
    let closes = to24(m[2]);
    if (!opens || !closes) return null;
    if (closes === "00:00" && /midnight/i.test(m[2])) closes = "23:59";
    return { opens, closes };
  }

  function listingToLocalBusiness(listing) {
    const url = listing.website || listing.bookingUrl;
    const business = {
      "@type": "LocalBusiness",
      name: listing.name,
      url,
      telephone: listing.phone || undefined,
      areaServed: listing.area,
      description:
        listing.offersNotes ||
        listing.feeNotes ||
        listing.visitNotes ||
        undefined,
    };
    if (listing.address) {
      business.address = {
        "@type": "PostalAddress",
        streetAddress: listing.address,
      };
    }
    const hours = [];
    const hoursSource = listing.accessHours || listing.hours;
    if (hoursSource) {
      for (const [day, value] of Object.entries(dayMap)) {
        const raw = hoursSource[day];
        if (!raw) continue;
        if (/24\s*hours|24\/7/i.test(raw) && !/not\s+published|closed/i.test(raw)) {
          hours.push({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: value,
            opens: "00:00",
            closes: "23:59",
          });
          continue;
        }
        const range = parseClockRange(raw);
        if (range) {
          hours.push({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: value,
            opens: range.opens,
            closes: range.closes,
          });
        }
      }
    }
    if (hours.length) business.openingHoursSpecification = hours;
    return business;
  }

  eleventyConfig.addFilter("defaultCityFaqs", (city) => [
    {
      q: `Can I get into a storage unit at night in ${city.city}?`,
      a: `Only if that facility publishes after-hours or 24-hour access, or says extended access is available on request. Access hours (when you can reach your unit) are not the same as office hours (when staff are present). We copy both from the operator’s page and do not treat a “24/7” marketing badge as published around-the-clock gate hours when the access-hours table says otherwise. Confirm with the facility before you go late at night.`,
    },
    {
      q: "What is the difference between access hours and office hours?",
      a: "Access hours, sometimes called gate hours, are when you can enter the property and reach your unit without staff help. Office hours are when the rental office is open. A location can have later access than its office, or the same hours for both. If a day’s hours were not published, we write “Not published” rather than inventing “Closed.”",
    },
    {
      q: "Do these facilities have climate-controlled units?",
      a: "We flag climate control only when that facility’s public page says the location offers climate-controlled storage. The flag does not mean every unit is climate controlled, and it is not a guarantee of a specific temperature. Ask the operator which units are climate controlled before you rent.",
    },
    {
      q: "Are the leases month to month?",
      a: "We flag month-to-month only when the facility page or a clearly applicable operator page says leases are month to month. If we could not find that statement, we leave the flag off. Terms can still include notice periods, deposits, or insurance requirements — read the operator’s lease.",
    },
    {
      q: "Do you list live prices or available units?",
      a: "No. Unit prices and vacancy change often. We do not cache live rates or open units. If a listing ever includes a price, it is labeled as listed on a date. Follow the operator’s own page for current pricing.",
    },
    {
      q: `How does Storage24 verify listings in ${city.city}?`,
      a: "We only publish facts we found on a public page — usually the facility’s own website. Each listing has source links and a last-checked date. We do not invent hours, amenities, or prices. If a site was down or a detail was unclear, we left it out.",
    },
  ]);

  eleventyConfig.addFilter("cityJsonLd", (city, siteObj) => {
    const pageUrl = `${siteObj.url}/${String(city.state).toLowerCase()}/${city.citySlug}/`;
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Self-storage with published access hours in ${city.city}, ${city.state}`,
      url: pageUrl,
      isPartOf: { "@type": "WebSite", name: siteObj.name, url: siteObj.url },
      about: {
        "@type": "ItemList",
        name: `Self-storage facilities in ${city.city}, ${city.state}`,
        numberOfItems: (city.listings || []).length,
        itemListElement: (city.listings || []).map((listing, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: listingToLocalBusiness(listing),
        })),
      },
    };
  });

  eleventyConfig.addFilter("faqJsonLd", (faqs, pageUrl) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: pageUrl,
    mainEntity: (faqs || []).map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  }));

  eleventyConfig.addFilter("breadcrumbJsonLd", (crumbs, siteObj) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: (crumbs || []).map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url
        ? crumb.url.startsWith("http")
          ? crumb.url
          : `${siteObj.url}${crumb.url.startsWith("/") ? crumb.url : `/${crumb.url}`}`
        : undefined,
    })),
  }));

  eleventyConfig.addFilter("homeJsonLd", (siteObj, cities) => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteObj.name,
    url: siteObj.url,
    description: siteObj.description,
    publisher: { "@type": "Organization", name: siteObj.name, url: siteObj.url },
    hasPart: {
      "@type": "ItemList",
      name: "Cities with self-storage listings",
      numberOfItems: (cities || []).length,
      itemListElement: (cities || []).map((city, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${city.city}, ${city.state}`,
        url: `${siteObj.url}/${String(city.state).toLowerCase()}/${city.citySlug}/`,
      })),
    },
  }));

  eleventyConfig.addFilter("guideJsonLd", (siteObj) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Need storage access at night? How 24-hour storage really works",
    name: "Need storage access at night? How 24-hour storage really works",
    url: `${siteObj.url}/guides/need-storage-access-at-night-how-24-hour-storage-really-works/`,
    description:
      "How 24-hour storage access actually works, how access hours differ from office hours, and what climate control and month-to-month leases mean on an operator’s own page.",
    isPartOf: { "@type": "WebSite", name: siteObj.name, url: siteObj.url },
    publisher: { "@type": "Organization", name: siteObj.name, url: siteObj.url },
  }));

  eleventyConfig.addCollection("cities", () => {
    const dir = path.join(__dirname, "data", "cities");
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => {
        const raw = fs.readFileSync(path.join(dir, name), "utf8");
        const data = JSON.parse(raw);
        data._file = name;
        if (!data.citySlug) {
          data.citySlug = String(data.city || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");
        }
        return data;
      })
      .sort((a, b) =>
        `${a.city}, ${a.state}`.localeCompare(`${b.city}, ${b.state}`)
      );
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    pathPrefix: site.pathPrefix,
  };
}
