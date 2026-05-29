export default function formatText(name, options) {
  if (!name) return;

  const dateMatch = name.name.match(/(\d{4})[-_]\d{2}[-_]\d{2}/);
  const year = dateMatch ? dateMatch[1] : "";

  let withoutDate = name.name.replace(/\d{4}[-_]\d{2}[-_]\d{2}/g, "");
  withoutDate = withoutDate.replace(/_/g, " ").trim();

  const firstSpaceIndex = withoutDate.indexOf(" ");
  const capitalized =
    firstSpaceIndex === -1
      ? withoutDate.charAt(0).toUpperCase() + withoutDate.slice(1)
      : withoutDate.charAt(0).toUpperCase() + withoutDate.slice(1);

  if (options?.removeYear || !year) return capitalized;

  return `${capitalized} - ${year}`;
}

const colorList = [
  "bg-red-400/80",
  "bg-blue-400/80",
  "bg-green-400/80",
  "bg-yellow-400/80",
  "bg-purple-400/80",
  "bg-pink-400/80",
  "bg-indigo-400/80",
  "bg-teal-400/80",
  "bg-orange-400/80",
  "bg-cyan-400/80"
];

export const getEdgeColor = (index) => colorList[index % colorList.length];


