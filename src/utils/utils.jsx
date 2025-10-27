// Decode minister name from hex format
const decodeHexString = (hex) =>
  decodeURIComponent(hex.replace(/(..)/g, "%$1"));

// Helper function to decode hex string to readable text
const hexToString = (hex) => {
  try {
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  } catch (error) {
    console.error("Error decoding hex string:", error);
    return hex; // Return original if decoding fails
  }
};

// Helper function to extract name from protobuf format
const extractNameFromProtobuf = (nameObj) => {
  try {
    if (typeof nameObj === "string") {
      const parsed = JSON.parse(nameObj);
      if (parsed.value) {
        return hexToString(parsed.value);
      }
    }
    return nameObj; // Return as-is if not in expected format
  } catch (error) {
    console.error("Error parsing protobuf name:", error);
    return nameObj;
  }
};

const makeMultilineText = (name, wordsPerLine = 4) => {
  if (!name || typeof name !== "string") return "";

  const words = name.trim().split(" ");
  const lines = [];

  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(" "));
  }

  const finalName = lines.join("\n");

  return finalName;
};

// Helper: safely parse YYYY-MM-DD → Date
const parseDate = (dateStr, fallback) => {
  if (!dateStr) return fallback;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? fallback : date;
};

// Helper: safely format Date → YYYY-MM-DD
const formatDate = (date, fallback = "") => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return fallback;
  return date.toISOString().split("T")[0];
};

export default {
  decodeHexString,
  hexToString,
  extractNameFromProtobuf,
  makeMultilineText,
  parseDate,
  formatDate,
};
