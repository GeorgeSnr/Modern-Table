import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";


export type Invoice = {
  id: number;
  invoice: string;
  status: string;
  method: string;
  amount: number;
};

// Function to fetch all invoices according to current filters
const fetchAllInvoicesForExport = async (filters: {
  search?: string;
  status?: string | null;
  method?: string | null;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.method) params.append("method", filters.method);

    // Use a very high pageSize to fetch all (or adjust backend to support 'all')
    params.append("page", "1");
    params.append("pageSize", "10000");

    const res = await fetch(`/api/invoices?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch invoices for export");

    const data = await res.json();
    return data.invoices || [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Main export function
export const handleExportExcel = async (filters: {
  search?: string;
  status?: string | null;
  method?: string | null;
}) => {
  try {
    // 1️⃣ Fetch all invoices according to filters
    const invoices = await fetchAllInvoicesForExport(filters);

    if (!invoices.length) {
      toast.error("⚠️ No invoices to export");
      return;
    }

    // 2️⃣ Format invoices for Excel (optional: match frontend table style)
    const formattedInvoices = invoices.map((inv:Invoice) => ({
      Invoice: inv.invoice,
      Status: inv.status,
      Method: inv.method,
      Amount: `Ugx ${inv.amount.toFixed(2)}`,
    }));

    // 3️⃣ Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(formattedInvoices);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");

    // 4️⃣ Generate Blob and download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    saveAs(blob, `invoices-${timestamp}.xlsx`);

    toast.success("✅ Excel exported successfully!");
  } catch (error) {
    console.error("Export error:", error);
    toast.error("❌ Failed to export Excel file");
  }
};
