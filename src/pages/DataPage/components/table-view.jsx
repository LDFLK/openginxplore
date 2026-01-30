import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import formatText from "../../../utils/common_functions";
import { ExportButton } from "./export-button";

export function DataTable({ columns, rows, title }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRows = useMemo(() => {
    const safeRows = rows ?? [];
    const trimmedSearch = searchTerm.trim();
    if (!trimmedSearch) return safeRows;
    return safeRows.filter((row) =>
      row.some((cell) =>
        String(cell).toLowerCase().includes(trimmedSearch.toLowerCase())
      )
    );
  }, [rows, searchTerm]);

  const sortedRows = useMemo(() => {
    if (sortColumn === null || sortDirection === null) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filteredRows, sortColumn, sortDirection]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedRows.slice(start, start + itemsPerPage);
  }, [sortedRows, currentPage]);

  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);

  const handleSort = (columnIndex) => {
    if (sortColumn === columnIndex) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnIndex);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4 w-full mt-2 md:mt-4 lg:mt-6">
      {/* Search */}
      <div className="flex justify-end gap-2">
        <input
          placeholder="Search table..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="p-1 lg:p-2 rounded-sm border border-border text-primary text-xs lg:text-sm"
        />

        <ExportButton columns={columns} rows={rows} filename={title} />
      </div>

      {/* Table */}
      <div className="border border-border/15 rounded-lg overflow-x-auto">
        <table className="w-full min-w-max text-xs md:text-sm">
          <thead>
            <tr className="bg-background-dark/95 border-b border-background-dark">
              {columns && columns.map((column, index) => (
                <th key={index} className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort(index)}
                    className="flex items-center gap-2 font-semibold text-xs md:text-sm hover:text-accent transition-colors text-primary/75 whitespace-nowrap hover:cursor-pointer"
                  >
                    {formatText({ name: column })}
                    {sortColumn === index &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-b-border/75 hover:bg-muted/10 transition-colors"
                >
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-3 whitespace-nowrap text-primary/85 text-xs md:text-sm">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns ? columns.length : 0}
                  className="text-xs lg:text-sm text-center py-6 text-gray-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <p className="text-xs lg:text-sm text-muted-foreground">
          Showing{" "}
          {paginatedRows.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}{" "}
          to {Math.min(currentPage * itemsPerPage, sortedRows.length)} of{" "}
          {sortedRows.length} results
        </p>

        {totalPages > 1 && (
          <div className="flex gap-1 md:gap-2">
            <button
              size="2"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex justify-center items-center border border-accent/75 text-xs lg:text-sm px-2 py-1 rounded-md text-accent/75 hover:bg-accent/10 transition-colors hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:border-border disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
              <span>Previous</span>
            </button>
            <button
              size="2"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage >= totalPages}
              className="flex justify-center items-center border border-accent/75 text-xs lg:text-sm px-2 py-1 rounded-md text-accent/75 hover:bg-accent/10 transition-colors hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:border-border disabled:hover:bg-transparent"
            >
              <span>Next</span>
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
