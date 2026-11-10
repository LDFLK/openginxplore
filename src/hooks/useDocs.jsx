import { useQuery } from "@tanstack/react-query";
import { getDocsFiles, getDocsMarkdown } from "../services/docsServices";

const DOCS_STALE_TIME = 1000 * 60 * 60 * 24;

export const useDocsFiles = () => {
  return useQuery({
    queryKey: ["docsFiles"],
    queryFn: ({ signal }) => getDocsFiles({ signal }),
    staleTime: DOCS_STALE_TIME,
    gcTime: DOCS_STALE_TIME,
  });
};

export const useDocMarkdown = (fileName) => {
  return useQuery({
    queryKey: ["docMarkdown", fileName],
    queryFn: ({ signal }) => getDocsMarkdown({ fileName, signal }),
    enabled: !!fileName,
    staleTime: DOCS_STALE_TIME,
    gcTime: DOCS_STALE_TIME,
  });
};
