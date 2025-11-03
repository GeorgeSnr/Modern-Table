'use client';

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient, UseMutationResult, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { saveAs } from "file-saver";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

import * as XLSX from "xlsx";

// -------------------- Types --------------------
type FormValues = {
  invoice: string;
  amount: number;
  status: string;
  method: string;
};

export function DialogData() {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { invoice: "", amount: 0, status: "", method: "" },
  });

  const mutation: UseMutationResult<any, any, FormValues, unknown> = useMutation({
    mutationFn: async (data: FormValues) => {
      // Send as single-element array for consistency with API
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: [data] }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to save invoice");
      return result;
    },
    onSuccess: () => {
      toast.success("Invoice saved successfully!");
      reset();
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      setTimeout(() => setOpen(false), 1200);
    },
    onError: (err: any) => toast.error(err.message || "Failed to submit invoice"),
  });

  const isLoading = mutation.status === "pending";
  const onSubmit = (data: FormValues) => mutation.mutate(data);

  // -------------------- Excel Upload --------------------
  // -------------------- Excel Upload --------------------
const handleExcelButtonClick = () => {
  fileInputRef.current?.click();
};

const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return toast.error("No file selected");

  try {
    const dataBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(dataBuffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!jsonData.length) {
      return toast.error("Excel sheet is empty");
    }

    // Map Excel columns to backend fields
    const mappedData = jsonData.map(row => ({
      invoice: row.InvoiceNumber || row.invoice,
      amount: parseFloat(row.Amount || row.amount || 0),
      status: row.Status || row.status,
      method: row.Method || row.method,
    }));

    const response = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: mappedData }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to upload Excel");
    }

    if (result.createdInvoices?.length > 0) {
      toast.success(`✅ ${result.createdInvoices.length} invoices saved`);
    }

    if (result.skippedRows?.length > 0) {
  toast(`ℹ️ ${result.skippedRows.length} existing invoices were skipped (already in system)`);

  console.table(result.skippedRows);
}


    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    setOpen(false);
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "Failed to upload Excel");
  }
};

 async function fetchInvoices() {
  const res = await fetch("/api/invoices?page=1&pageSize=50");
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}

 function InvoicesTable() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
  });

  // ✅ Make sure invoices is always defined (empty array fallback)
  const invoices = data?.invoices ?? [];
 }
  
  // -------------------- Render --------------------
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Invoice +</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px] dark:bg-gray-900 dark:text-gray-100 bg-white transition-colors">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Invoice</DialogTitle>
            <DialogDescription>Fill in the details below or upload an Excel file.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Invoice */}
            <div className="grid gap-1">
              <Label htmlFor="invoice">Invoice No.</Label>
              <Input id="invoice" placeholder="INV-001" {...register("invoice", { required: "Invoice number is required" })} />
              {errors.invoice && <p className="text-sm text-red-500">{errors.invoice.message}</p>}
            </div>

            {/* Status */}
            <div className="grid gap-1">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: "Select a status" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
            </div>

            {/* Method */}
            <div className="grid gap-1">
              <Label>Payment Method</Label>
              <Controller
                name="method"
                control={control}
                rules={{ required: "Select a payment method" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.method && <p className="text-sm text-red-500">{errors.method.message}</p>}
            </div>

            {/* Amount */}
            <div className="grid gap-1">
              <Label>Amount</Label>
              <Input type="number" step="1" placeholder="0" {...register("amount", { required: "Amount required", valueAsNumber: true, min: 1 })} />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-4 mt-2">
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline" type="button" disabled={isLoading}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Add Invoice"}</Button>
            </div>

            <p className="text-center font-medium">OR</p>

            {/* Excel Upload */}
            <div className="flex flex-col gap-2">
              <Button onClick={handleExcelButtonClick}>Upload Excel</Button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="hidden" />
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
