import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Download } from "lucide-react";
import { useState } from "react";

export function ExportButton({ columns, rows, filename }) {
  const [open, setOpen] = useState(false);

  const exportCSV = () => {
    const csv = [
      columns.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell);
            return str.includes(",") ? `"${str}"` : str;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = rows.map((row) => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportXLSX = async () => {
    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.aoa_to_sheet([columns, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (error) {
      console.error("Error exporting XLSX:", error);
      alert("Failed to export XLSX. Please try again.");
    }
  };

  const exportPDF = async () => {
    try {
      const jsPDF = await import("jspdf");
      const autoTable = await import("jspdf-autotable");

      const doc = new jsPDF.jsPDF();
      doc.setFontSize(14);
      doc.text(filename, 14, 15);

      autoTable.default(doc, {
        head: [columns],
        body: rows.map((row) => row.map((cell) => String(cell))),
        startY: 25,
        margin: 10,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: {
          fillColor: [255, 165, 0],
          textColor: [0, 0, 0],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button className="flex hover:cursor-pointer bg-active-green/80 hover:bg-active-green items-center gap-2 border rounded-md px-3 py-1 text-sm transition">
          <Download className="w-4 h-4" />
          Export
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="min-w-[160px] rounded-md bg-background-dark shadow-md border p-1"
        >
          <DropdownMenu.Item
            onSelect={exportCSV}
            className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm"
          >
            Export as CSV
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={exportJSON}
            className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm"
          >
            Export as JSON
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={exportXLSX}
            className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm"
          >
            Export as XLSX
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={exportPDF}
            className="px-3 py-2 rounded hover:bg-gray-100 cursor-pointer text-sm"
          >
            Export as PDF
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
