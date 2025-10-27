import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyButton } from "../components/CopyButton";

const GITHUB_USERNAME = "ldflk";
const REPO_NAME = "orgchart";
const DOCS_BRANCH = "main";

export default function DocsPage() {
    const [files, setFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [content, setContent] = useState("");
    const [headings, setHeadings] = useState([]);
    const [currentHash, setCurrentHash] = useState(
        window.location.hash?.replace("#", "") || ""
    );

    const contentRef = useRef(null);
    const pendingFileRef = useRef(null);
    const pendingHashRef = useRef(null);
    const isManualScrollRef = useRef(false);

    // parse URL once on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fileParam = params.get("file");
        const hash = window.location.hash?.replace("#", "") || null;
        if (fileParam) pendingFileRef.current = fileParam;
        if (hash) pendingHashRef.current = hash;
    }, []);

    // update currentHash state when URL hash changes
    useEffect(() => {
        const handleHashChange = () => setCurrentHash(window.location.hash.replace("#", ""));
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    // fetch docs list
    useEffect(() => {
        async function fetchDocFiles() {
            try {
                const res = await fetch(
                    `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/docs?ref=${DOCS_BRANCH}&t=${Date.now()}`
                );
                const data = await res.json();
                const mdFiles = Array.isArray(data)
                    ? data
                        .filter((f) => f.name.endsWith(".md"))
                        .map((f) => ({
                            name: f.name.replace(/-/g, " ").replace(".md", ""),
                            file: f.name,
                            slug: f.name.replace(".md", ""),
                        }))
                    : [];

                setFiles(mdFiles);

                if (pendingFileRef.current) {
                    const matched = mdFiles.find((m) => m.slug === pendingFileRef.current);
                    if (matched) {
                        setActiveFile(matched);
                        return;
                    }
                }

                if (!activeFile && mdFiles.length) setActiveFile(mdFiles[0]);
            } catch (err) {
                console.error("Failed to fetch doc files", err);
            }
        }
        fetchDocFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    // helper to make slug
    const slugify = (s) =>
        String(s || "")
            .trim()
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");

    // generate headings
    function generateHeadingIds(md, fileSlug) {
        const extracted = [];
        const idCounts = {};
        const lines = md.split("\n");
        let lastMainHeading = null;

        for (let i = 0; i < lines.length; i++) {
            const match = lines[i].match(/^(#{1,3})\s+(.*)/);
            if (!match) continue;
            const level = match[1].length;
            const text = match[2].trim();

            let hasContentAfter = false;
            for (let j = i + 1; j < lines.length; j++) {
                const next = lines[j].trim();
                if (!next) continue;
                if (next.startsWith("#")) break;
                if (next.length > 0) {
                    hasContentAfter = true;
                    break;
                }
            }
            if (!hasContentAfter) continue;

            if (level === 2) lastMainHeading = text;

            let hashSlug = slugify(text);
            if (level === 3 && lastMainHeading) {
                hashSlug = `${slugify(lastMainHeading)}-${hashSlug}`;
            }

            let domId = `${fileSlug}-${hashSlug}`;
            if (idCounts[domId]) {
                idCounts[domId] += 1;
                domId = `${domId}-${idCounts[domId]}`;
            } else {
                idCounts[domId] = 1;
            }

            extracted.push({ level, text, id: domId, hash: hashSlug });
        }

        return extracted;
    }

    // fetch markdown whenever activeFile changes
    useEffect(() => {
        if (!activeFile) return;
        let cancelled = false;

        async function fetchMarkdown(fileName) {
            try {
                const res = await fetch(
                    `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/${DOCS_BRANCH}/docs/${fileName}?t=${Date.now()}`
                );
                const md = await res.text();
                if (cancelled) return;
                setContent(md);

                const fileSlug = activeFile.slug || activeFile.file.replace(".md", "");
                const newHeadings = generateHeadingIds(md, fileSlug);
                setHeadings(newHeadings);

                if (contentRef.current)
                    contentRef.current.scrollTo({ top: 0 });

                const pendingHash = pendingHashRef.current;
                const pendingFile = pendingFileRef.current;

                // Update URL with hash if pending, otherwise just file
                const newUrl = (pendingHash && pendingFile === fileSlug)
                    ? `?file=${fileSlug}#${pendingHash}`
                    : `?file=${fileSlug}`;
                window.history.replaceState(null, "", newUrl);

                if (pendingHash && pendingFile === fileSlug) {
                    const targetDomId = `${fileSlug}-${pendingHash}`;
                    setTimeout(() => {
                        const el = document.getElementById(targetDomId);
                        if (el && contentRef.current) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                            setCurrentHash(pendingHash);
                        }
                        pendingHashRef.current = null;
                        pendingFileRef.current = null;
                    }, 300);
                }
            } catch (err) {
                console.error("Failed to fetch markdown", err);
            }
        }

        fetchMarkdown(activeFile.file);

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFile]);


    const getHeadingId = (text, level) => {
        const h = headings.find((h) => h.text === text && h.level === level);
        return h ? h.id : `${activeFile?.slug || activeFile?.file.replace(".md", "")}-${slugify(text)}`;
    };

    const handleHeadingClick = (h) => {
        const el = document.getElementById(h.id);
        if (el) {
            isManualScrollRef.current = true;
            el.scrollIntoView({ behavior: "smooth", block: "start" });
            const fileSlug = activeFile.slug || activeFile.file.replace(".md", "");
            const newUrl = `?file=${fileSlug}#${h.hash}`;
            window.history.replaceState(null, "", newUrl);
            setCurrentHash(h.hash);
            setTimeout(() => {
                isManualScrollRef.current = false;
            }, 1000);
        }
    };
    // Track active heading based on scroll position
    useEffect(() => {
        if (!activeFile || !headings.length || !contentRef.current) return;

        const handleScroll = () => {
            if (isManualScrollRef.current) return;

            const container = contentRef.current;
            if (!container) return;

            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;

            const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

            const containerRect = container.getBoundingClientRect();
            const triggerPoint = containerRect.top + 100; // 100px from top of container

            const headingElements = headings
                .map((h) => {
                    const el = document.getElementById(h.id);
                    if (!el) return null;
                    const rect = el.getBoundingClientRect();
                    return {
                        ...h,
                        top: rect.top,
                        bottom: rect.bottom,
                        element: el,
                    };
                })
                .filter(Boolean);

            if (headingElements.length === 0) return;

            let activeHeading;

            if (isNearBottom) {
                // When near bottom, find the last visible heading
                const visibleHeadings = headingElements.filter(
                    (h) => h.top <= containerRect.bottom
                );
                activeHeading = visibleHeadings[visibleHeadings.length - 1] || headingElements[headingElements.length - 1];
            } else {
                // Normal scroll: find the last heading above trigger point
                activeHeading = headingElements[0];
                for (const heading of headingElements) {
                    if (heading.top <= triggerPoint) {
                        activeHeading = heading;
                    } else {
                        break;
                    }
                }
            }

            if (activeHeading && currentHash !== activeHeading.hash) {
                setCurrentHash(activeHeading.hash);
                const fileSlug = activeFile.slug || activeFile.file.replace(".md", "");
                const newUrl = `?file=${fileSlug}#${activeHeading.hash}`;
                window.history.replaceState(null, "", newUrl);
            }
        };

        const container = contentRef.current;
        container.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, [activeFile, headings, currentHash]);
    return (
        <div className="flex h-screen bg-gray-50 text-gray-800">
            <nav className="w-90 bg-white border-r border-gray-200 shadow-xs p-4 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">
                    Documentation
                </h2>

                <ul className="space-y-3">
                    {files.map((f) => (
                        <li key={f.file}>
                            <div
                                className={`cursor-pointer px-2 py-1 rounded-md transition-colors duration-200 ${activeFile?.file === f.file ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700 font-semibold"
                                    }`}
                                onClick={() => {
                                    const fileSlug = f.slug;
                                    if (activeFile?.file === f.file) {
                                        // Same file clicked — scroll to top and clear hash + highlight
                                        if (contentRef.current) {
                                            isManualScrollRef.current = true;
                                            contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
                                            setTimeout(() => {
                                                isManualScrollRef.current = false;
                                            }, 1000);
                                        }
                                        window.history.replaceState(null, "", `?file=${fileSlug}`);
                                        setCurrentHash("");
                                    }
                                    else {
                                        // Different file - clear hash
                                        window.history.replaceState(null, "", `?file=${fileSlug}`);
                                        setActiveFile(f);
                                    }
                                }}
                            >
                                {"> "}{f.name.replace(/\b\w/g, (c) => c.toUpperCase())}
                            </div>

                            {activeFile?.file === f.file && (
                                <ul className="mt-2 ml-3 border-l border-gray-200 pl-3 space-y-1">
                                    {headings.map((h) => {
                                        const isSelected = currentHash === h.hash;
                                        return (
                                            <li
                                                key={h.id}
                                                className={`p-1 cursor-pointer text-sm transition-colors duration-150 ${h.level === 2 ? "font-medium" : ""
                                                    } ${isSelected ? "text-blue-600" : h.level === 2 ? "text-gray-700" : "text-gray-600"} hover:text-blue-600`}
                                                style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
                                                onClick={() => handleHeadingClick(h)}
                                            >
                                                {h.text}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            <div ref={contentRef} className="flex-1 p-8 overflow-y-auto prose max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: ({ node, ...props }) => {
                            const text = props.children[0]?.toString() || "";
                            const id = getHeadingId(text, 1);
                            const headingData = headings.find((h) => h.id === id);
                            const showLink = Boolean(headingData); // only show if it's a real heading with hash
                            const link = showLink
                                ? `${window.location.origin}${window.location.pathname}?file=${activeFile?.slug || activeFile?.file.replace(".md", "")}#${headingData.hash}`
                                : null;

                            return (
                                <div className="group relative flex items-center gap-2">
                                    <h1
                                        id={id}
                                        className="text-3xl font-bold text-gray-900 border-b border-gray-200 pb-2 mt-10 mb-6 scroll-mt-24"
                                        {...props}
                                    />
                                    {showLink && <CopyButton link={link} />}
                                </div>
                            );
                        },

                        h2: ({ node, ...props }) => {
                            const text = props.children[0]?.toString() || "";
                            const id = getHeadingId(text, 2);
                            const headingData = headings.find((h) => h.id === id);
                            const showLink = Boolean(headingData);
                            const link = showLink
                                ? `${window.location.origin}${window.location.pathname}?file=${activeFile?.slug || activeFile?.file.replace(".md", "")}#${headingData.hash}`
                                : null;

                            return (
                                <div className="group relative flex items-center gap-2">
                                    <h2
                                        id={id}
                                        className="text-2xl font-semibold text-gray-800 mt-8 mb-4 scroll-mt-24"
                                        {...props}
                                    />
                                    {showLink && <CopyButton link={link} />}
                                </div>
                            );
                        },

                        h3: ({ node, ...props }) => {
                            const text = props.children[0]?.toString() || "";
                            const id = getHeadingId(text, 3);
                            const headingData = headings.find((h) => h.id === id);
                            const showLink = Boolean(headingData);
                            const link = showLink
                                ? `${window.location.origin}${window.location.pathname}?file=${activeFile?.slug || activeFile?.file.replace(".md", "")}#${headingData.hash}`
                                : null;

                            return (
                                <div className="group relative flex items-center gap-2">
                                    <h3
                                        id={id}
                                        className="text-xl font-medium text-gray-700 mt-6 mb-3 scroll-mt-24"
                                        {...props}
                                    />
                                    {showLink && <CopyButton link={link} />}
                                </div>
                            );
                        },

                        p: ({ node, ...props }) => <p className="mb-5 leading-relaxed text-gray-700" {...props} />,
                        a: ({ href, children, ...props }) => {
                            const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
                            const isGlossaryLink = href?.includes("file=glossary") || href?.startsWith("#");
                            const isInternal = href?.startsWith("/");

                            const showArrow = isExternal || isGlossaryLink || isInternal;

                            const linkClass = isExternal
                                ? "text-blue-600 underline hover:text-blue-800 font-medium"
                                : "font-medium text-gray-800 hover:text-gray-900";

                            // Always open in new tab
                            const linkTarget = "_blank";
                            const linkRel = "noopener noreferrer";

                            return (
                                <a
                                    href={href}
                                    className={`${linkClass} inline-flex items-center gap-0.5`}
                                    target={linkTarget}
                                    rel={linkRel}
                                    {...props}
                                >
                                    {children}

                                    {showArrow && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="11"
                                            height="11"
                                            fill="none"
                                            viewBox="0 0 21 21"
                                            strokeWidth={2.5}
                                            stroke="currentColor"
                                            className="opacity-70 inline-block"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M13 5h6m0 0v6m0-6L10 14"
                                            />
                                        </svg>
                                    )}
                                </a>
                            );
                        },


                        ul: ({ node, ...props }) => (
                            <ul className="list-disc pl-6 mb-5 space-y-1 text-gray-700" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                            <ol className="list-decimal pl-6 mb-5 space-y-1 text-gray-700" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                            <li className="ml-2 leading-relaxed" {...props} />
                        ),
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
}