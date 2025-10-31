import React from "react";
import { ChevronRightIcon, HomeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Breadcrumb({ items, onItemClick, setSelectedDatasets }) {
  const navigator = useNavigate();

  const handleClick = (index, item) => {
    setSelectedDatasets(null)
    if (onItemClick) {
      onItemClick(index, item);
    } else {
      navigator(item.path);
    }
  };

  return (
    <div className="container">
      <ol className="flex items-center gap-2 text-sm overflow-x-auto text-primary/75">
        <li>
          <button
            onClick={() => {
              setSelectedDatasets(null)
              if (onItemClick) onItemClick(-1, { label: "Home", path: "/" });
              else navigator("/");
            }}
            className="flex items-center gap-1 text-forground/10 hover:text-accent transition-colors hover:cursor-pointer"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
          </button>
        </li>

        {items && items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronRightIcon className="w-4 h-4 text-forground/10" />
            {index === items.length - 1 ? (
              <span className="text-accent font-medium">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => handleClick(index, item)}
                className="text-primary/75 hover:text-accent transition-colors hover:cursor-pointer"
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
