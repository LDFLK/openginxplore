
import InfoTooltip from "../../../components/InfoToolTip";

// Process a single string and replace citations with tooltips
function processString(str) {
    if (typeof str !== "string") return str;

    // Regex to match [citation] but NOT [*text*](url) patterns
    const citationRegex = /\[([^\]]+?)\](?!\()/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = citationRegex.exec(str)) !== null) {
        const citation = match[1];
        const startIndex = match.index;

        // Skip if this is clearly part of a markdown link (starts with *)
        if (citation.startsWith("*")) {
            continue;
        }

        // Add text before the citation
        if (startIndex > lastIndex) {
            parts.push(str.substring(lastIndex, startIndex));
        }

        // Add the citation with tooltip
        parts.push(
            <span key={`citation-${startIndex}-${Math.random()}`} className="inline-flex items-center ">
                <InfoTooltip message={citation} iconSize={12} />
            </span>
        );

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < str.length) {
        parts.push(str.substring(lastIndex));
    }

    return parts.length > 0 ? parts : str;
}

// Recursively process children (handles arrays, strings, and React elements)
function processChildren(children) {
    if (!children) return null;

    // If it's a string, process it for citations
    if (typeof children === "string") {
        return processString(children);
    }

    // If it's an array, recursively process each element
    if (Array.isArray(children)) {
        return children.map((child, index) => {
            if (typeof child === "string") {
                const processed = processString(child);
                // If processString returns an array, wrap each element
                if (Array.isArray(processed)) {
                    return <span key={index}>{processed}</span>;
                }
                return processed;
            }
            // If it's a React element with children, recursively process
            if (child && typeof child === "object" && child.props && child.props.children) {
                return {
                    ...child,
                    props: {
                        ...child.props,
                        children: processChildren(child.props.children)
                    }
                };
            }
            return child;
        });
    }

    // If it's a React element with children, recursively process
    if (children && typeof children === "object" && children.props && children.props.children) {
        return {
            ...children,
            props: {
                ...children.props,
                children: processChildren(children.props.children)
            }
        };
    }

    return children;
}

// Main component to wrap content with citation detection
export function TextWithCitations({ children }) {
    const processed = processChildren(children);
    return <>{processed}</>;
}