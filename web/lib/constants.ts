export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://unitatlas.hortiprise.com";

export const STATES = [
  "UP",
  "Bihar",
  "Jharkhand",
  "Punjab",
  "Haryana",
  "HimachalPradesh",
  "Uttarakhand",
  "Rajasthan",
  "Maharashtra",
  "Gujarat",
  "TamilNadu",
  "Kerala",
  "Karnataka",
  "AndhraPradesh",
  "Telangana",
  "WestBengal",
  "Tripura",
  "Assam",
  "MadhyaPradesh",
  "Chhattisgarh",
] as const;
