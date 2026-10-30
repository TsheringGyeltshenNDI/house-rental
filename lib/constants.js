export const SITE_NAME = "HouseRent";

export const BUCKET = "listing-images";
export const MAX_IMAGES = 8;

export const DZONGKHAGS = [
  "Bumthang",
  "Chhukha",
  "Dagana",
  "Gasa",
  "Haa",
  "Lhuentse",
  "Mongar",
  "Paro",
  "Pemagatshel",
  "Punakha",
  "Samdrup Jongkhar",
  "Samtse",
  "Sarpang",
  "Thimphu",
  "Trashigang",
  "Trashiyangtse",
  "Trongsa",
  "Tsirang",
  "Wangdue Phodrang",
  "Zhemgang",
];

// Popular places, shown as quick links on the home page.
export const POPULAR_DZONGKHAGS = [
  "Thimphu",
  "Paro",
  "Chhukha",
  "Punakha",
  "Wangdue Phodrang",
  "Sarpang",
  "Mongar",
  "Trashigang",
];

export const SORTS = [
  { value: "", label: "Newest" },
  { value: "rent-asc", label: "Lowest rent" },
  { value: "rent-desc", label: "Highest rent" },
];

export function formatRent(rent) {
  return `Nu. ${rent.toLocaleString("en-IN")}`;
}

export function formatBedrooms(bedrooms) {
  if (bedrooms === 0) return "Studio";
  return `${bedrooms} bedroom${bedrooms === 1 ? "" : "s"}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// WhatsApp needs the number with country code and no symbols.
// Bhutanese mobile numbers are 8 digits, so add 975 when it is missing.
export function whatsappNumber(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 8 ? `975${digits}` : digits;
}

// The message that is typed in for the visitor when they tap
// "Message on WhatsApp". They can still change it before sending.
export function whatsappMessage({ title, rent, location, dzongkhag, url }) {
  return [
    `Hello! I saw your listing "${title}" (${formatRent(rent)}/month, ${location}, ${dzongkhag}) on ${SITE_NAME}.`,
    "Is it still available? I would like to know more and arrange a visit.",
    url,
  ].join("\n\n");
}

export function whatsappLink(phone, message) {
  return `https://wa.me/${whatsappNumber(phone)}?text=${encodeURIComponent(message)}`;
}

// Where to go after logging in. Only paths on this site are allowed, so a
// crafted link cannot send people to another website.
export function safeRedirectPath(path) {
  return /^\/(?![/\\])/.test(path ?? "") ? path : "/my-listings";
}
