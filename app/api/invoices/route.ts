import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// -------------------- GET: Fetch invoices --------------------
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "5", 10);
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status") || undefined;
    const method = url.searchParams.get("method") || undefined;

    const where: any = {};
    if (search) where.invoice = { contains: search, mode: "insensitive" };
    if (status) where.status = status;
    if (method) where.method = method;

    const total = await prisma.invoice.count({ where });
    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    console.log("🔍 /api/invoices GET called");

    return NextResponse.json({ invoices, total });
  } catch (error) {
    console.error("❌ DB error:", error);
    return NextResponse.json({ message: "Database error" }, { status: 500 });
  }
}

// -------------------- POST: Add new invoice(s) --------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("📥 Received POST data:", JSON.stringify(body, null, 2));

    // Normalize: single object -> array
    const invoicesData = Array.isArray(body.data) ? body.data : [body];

    console.log(`🗂 Processing ${invoicesData.length} invoices`);

    if (!invoicesData.length) {
      return NextResponse.json({ message: "No invoice data provided" }, { status: 400 });
    }

    const createdInvoices = [];
    const skippedRows: any[] = [];

    for (const row of invoicesData) {
      const invoiceNumber = row.InvoiceNumber || row.invoice;
      const status = row.Status || row.status;
      const method = row.Method || row.method;
      const amountRaw = row.Amount || row.amount;

      console.log("🔹 Processing row:", row);

      // Skip rows missing required fields
      if (!invoiceNumber || !status || !method || !amountRaw) {
        skippedRows.push({ row, reason: "Missing required fields" });
        console.log("⚠️ Skipped row due to missing fields:", row);
        continue;
      }

      const amount = parseFloat(amountRaw);
      if (isNaN(amount) || amount <= 0) {
        skippedRows.push({ row, reason: "Invalid amount" });
        console.log("⚠️ Skipped row due to invalid amount:", row);
        continue;
      }

      try {
        const newInvoice = await prisma.invoice.create({
          data: { invoice: invoiceNumber, status, method, amount },
        });

        console.log(`✅ Invoice saved: ${newInvoice.invoice}`);
        createdInvoices.push(newInvoice);
      } catch (err: any) {
        skippedRows.push({ row, reason: err.message });
        console.log("⚠️ Error saving row:", row, "Error:", err.message);
      }
    }

    console.log(`🎉 Upload complete: ${createdInvoices.length} saved, ${skippedRows.length} skipped`);

    return NextResponse.json(
      {
        message: `Upload complete: ${createdInvoices.length} saved, ${skippedRows.length} skipped.`,
        createdInvoices,
        skippedRows,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("❌ POST /api/invoices error:", error);
    return NextResponse.json(
      { message: error.message || "Server error while saving invoice(s)." },
      { status: 500 }
    );
  }
}
