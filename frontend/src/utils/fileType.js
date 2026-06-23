const KNOWN_VARIANTS = ["pdf", "xlsx", "csv", "docx"];

export const getFileTypeVariant = (type) => {
  const variant = (type || "").toLowerCase();
  return KNOWN_VARIANTS.includes(variant) ? variant : "default";
};
