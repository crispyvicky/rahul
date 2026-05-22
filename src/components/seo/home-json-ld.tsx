import JsonLd from "./json-ld";
import { HOME_FAQS, SITE, SITE_URL } from "@/lib/seo";

export default function HomeJsonLd() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    url: SITE_URL,
    jobTitle: "Fitness Influencer & Coach",
    description: SITE.description,
    email: SITE.email,
    image: `${SITE_URL}/LOGO.png`,
    nationality: { "@type": "Country", name: SITE.countryName },
    homeLocation: {
      "@type": "Place",
      name: `${SITE.city}, ${SITE.countryName}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: SITE.city,
        addressRegion: SITE.region,
        addressCountry: SITE.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: SITE.geo.latitude,
        longitude: SITE.geo.longitude,
      },
    },
    sameAs: [SITE.social.instagram, SITE.social.youtube, SITE.social.facebook],
    knowsAbout: [
      "Fitness coaching",
      "Hypertrophy training",
      "Brand collaborations",
      "Transformation programs",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE_URL,
    description: SITE.description,
    inLanguage: "en-IN",
    publisher: { "@type": "Person", name: SITE.name, url: SITE_URL },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/workout-plans?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${SITE_URL}/#local`,
    name: `${SITE.name} — ${SITE.city}`,
    description: `Fitness coaching and influencer services in ${SITE.city}, ${SITE.countryName}.`,
    url: SITE_URL,
    image: `${SITE_URL}/LOGO.png`,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: SITE.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    areaServed: {
      "@type": "City",
      name: SITE.city,
      containedInPlace: { "@type": "Country", name: SITE.countryName },
    },
    sameAs: [SITE.social.instagram, SITE.social.youtube, SITE.social.facebook],
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: HOME_FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return <JsonLd data={[person, website, localBusiness, faqPage]} />;
}
