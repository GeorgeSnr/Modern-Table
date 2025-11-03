'use client';

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { handleExportExcel } from "@/utils/exportExcel";


type Invoice = {
  id: number;
  invoice: string;
  status: string;
  method: string;
  amount: number;
};


// ✅ Status color helper
function getStatusColor(status: string) {
  const s = status.trim().toLowerCase();
  if (s === "paid")
    return "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300";
  if (s === "pending")
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300";
  return "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300";
}

export function UserTable() {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [methodFilter, setMethodFilter] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 5;

  // ✅ Fetch invoices (renamed)
  const fetchInvoices = async () => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    if (search) params.append("search", search);
    if (statusFilter) params.append("status", statusFilter);
    if (methodFilter) params.append("method", methodFilter);

    const res = await fetch(`/api/invoices?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch invoices");
    const data = await res.json();
    console.log("✅ API Response:", data);
    return data;
  };

  // ✅ Adjusted to expect `{ invoices, total }`
  const { data, isLoading, isError } = useQuery<{ invoices: Invoice[]; total: number }, Error>({
    queryKey: ["invoices", page, search, statusFilter, methodFilter],
    queryFn: fetchInvoices,
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "all" ? null : value);
    setPage(1);
  };

  const handleMethodChange = (value: string) => {
    setMethodFilter(value === "all" ? null : value);
    setPage(1);
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );

  if (isError)
    return <p className="text-red-500 text-center">Error loading invoices</p>;

  const totalItems = data?.total ?? 0;
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="space-y-8 mt-4">
      {/* Filters */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="flex flex-wrap gap-6 items-end">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Label className="text-gray-700 dark:text-gray-200 mb-2 block font-medium">
              Search Invoice
            </Label>
            <Input
              placeholder="Search by invoice..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 pr-8 border-gray-300 focus:border-blue-400 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:ring-gray-500"
              aria-label="Search invoice"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-8 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <div className="flex gap-2">
          </div>

          {/* Status */}
          <div className="flex-1 min-w-[160px]">
            <Label className="text-gray-700 dark:text-gray-200 mb-2 block font-medium">
              Status
            </Label>
            <Select value={statusFilter ?? "all"} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-10 dark:bg-gray-700 dark:text-gray-100">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Method */}
          <div className="flex-1 min-w-[160px]">
            <Label className="text-gray-700 dark:text-gray-200 mb-2 block font-medium">
              Payment Method
            </Label>
            <Select value={methodFilter ?? "all"} onValueChange={handleMethodChange}>
              <SelectTrigger className="h-10 dark:bg-gray-700 dark:text-gray-100">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700 dark:text-gray-100">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="h-10 px-5 mt-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            Search
          </Button>
        </div>

      </div>
      {/* Export Excel Button */}
<Button
  onClick={() => handleExportExcel({ search, status: statusFilter, method: methodFilter })}
  className="mb-4"
>
  Export Excel
</Button>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 transition">
        <Table>
          <TableCaption className="dark:text-gray-300 text-gray-500">
            Invoice Records
          </TableCaption>
          <TableHeader className="bg-gray-50 dark:bg-gray-900">
            <TableRow>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Invoice</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Status</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Method</TableHead>
              <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-200">Amount</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.invoices?.length ? (
              data.invoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <TableCell className="font-medium">{invoice.invoice}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        getStatusColor(invoice.status)
                      )}
                    >
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell className="text-right">Ugx {invoice.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No invoices found
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {data?.invoices?.length ? (
            <TableFooter className="bg-gray-50 dark:bg-gray-900">
              <TableRow>
                <TableCell colSpan={3} className="font-semibold text-gray-700 dark:text-gray-200">
                  Total
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-800 dark:text-gray-100">
                  Ugx {data.invoices.reduce((acc, i) => acc + i.amount, 0).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>

      {/* Pagination */}
      {data?.invoices?.length ? (
        <div className="flex flex-wrap justify-between items-center gap-4 mt-4 text-sm text-gray-700 dark:text-gray-200">
          <span className="font-medium">
            Showing{" "}
            <span className="text-blue-600 dark:text-blue-400">{startItem}</span>–
            <span className="text-blue-600 dark:text-blue-400">{endItem}</span> of{" "}
            <span className="text-blue-600 dark:text-blue-400">{totalItems}</span> records
          </span>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              className="h-9 px-4"
            >
              Previous
            </Button>
            <span className="font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
              className="h-9 px-4"
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
