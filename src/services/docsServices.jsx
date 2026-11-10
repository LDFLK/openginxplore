import axios from "axios";

const GITHUB_USERNAME = "ldflk";
const REPO_NAME = "openginxplore";
const DOCS_BRANCH = "main";

export const getDocsFiles = async ({ signal } = {}) => {
  const { data } = await axios.get(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/docs`,
    { params: { ref: DOCS_BRANCH, t: Date.now() }, signal }
  );

  if (!Array.isArray(data)) return [];

  return data
    .filter((file) => file.name.endsWith(".md"))
    .map((file) => ({
      name: file.name.replace(/-/g, " ").replace(".md", ""),
      file: file.name,
      slug: file.name.replace(".md", ""),
    }));
};

export const getDocsMarkdown = async ({ fileName, signal }) => {
  const { data } = await axios.get(
    `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/${DOCS_BRANCH}/docs/${fileName}`,
    { params: { t: Date.now() }, responseType: "text", signal }
  );

  return data;
};
