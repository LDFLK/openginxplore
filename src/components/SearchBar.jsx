import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Search input component for the header
 * Navigates to /search?q={query} on Enter
 */
export default function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery.length >= 2) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-48 md:max-w-64 mx-2 md:mx-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full pl-8 pr-3 py-1.5 text-xs md:text-sm bg-background-dark border border-border rounded-md
                     text-primary placeholder:text-primary/50
                     focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent
                     transition-colors"
        />
      </div>
    </form>
  );
}
