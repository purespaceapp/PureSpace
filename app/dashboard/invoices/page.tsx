
"use client";

import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FileText,
  Search,
  ChevronRight,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  getOfficeInvoices,
  setInvoiceHst,
  setInvoicePaymentStatus,
  Invoice,
} from "@/lib/invoices";

type OfficeInvoiceGroup = {
  owner_id: number;
  owner_name: string;
  owner_email?: string | null;
  period_start: string;
  period_end: string;
  status?: string;
  invoices: Invoice[];
};

type InvoiceOwner = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type ManualInvoiceItem = {
  property_id: number;
  property_name: string;
  property_address?: string | null;
  item_type: "cleaning" | "expense";
  item_date: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

type ManualInvoicePreview = {
  owner: InvoiceOwner;
  period_start: string;
  period_end: string;
  hst_enabled: boolean;
  total_cleaning: number;
  total_expenses: number;
  subtotal: number;
  hst_amount: number;
  total_due: number;
  items: ManualInvoiceItem[];
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(Number(value || 0));
}

function getSubtotal(invoice: Invoice) {
  return (
    Number(invoice.total_cleaning || 0) +
    Number(invoice.total_expenses || 0)
  );
}

function getHstAmount(invoice: Invoice) {
  return invoice.hst_enabled ? getSubtotal(invoice) * 0.13 : 0;
}

export default function OfficeInvoicesPage() {
  const router = useRouter();

  const [owners, setOwners] = useState<InvoiceOwner[]>([]);
  const [manualOwnerId, setManualOwnerId] = useState("");
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [manualHstEnabled, setManualHstEnabled] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualPreview, setManualPreview] =
    useState<ManualInvoicePreview | null>(null);

  const [groups, setGroups] = useState<OfficeInvoiceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [expandedMonths, setExpandedMonths] =
    useState<Record<string, boolean>>({});
  const [savingInvoiceId, setSavingInvoiceId] = useState<number | null>(
    null
  );

  useEffect(() => {
    void loadInvoices();
    void loadOwners();
    void loadGlobalHstSetting();
  }, []);

  async function loadOwners() {
    try {
      const response = await fetch("/api/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.error || "Unable to load clients.");
      }

      setOwners(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Failed to load invoice clients:", error);
    }
  }

  async function loadGlobalHstSetting() {
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get-hst" }),
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        setManualHstEnabled(Boolean(result.data));
      }
    } catch (error) {
      console.error("Failed to load HST setting:", error);
    }
  }

  async function loadInvoices() {
    try {
      setLoading(true);
      const data = await getOfficeInvoices();
      setGroups((data || []) as OfficeInvoiceGroup[]);
    } catch (error) {
      console.error("Failed to load office invoices:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePreviewManualInvoice() {
    if (!manualOwnerId || !manualStart || !manualEnd) {
      alert("Please select a client and both dates.");
      return;
    }

    if (manualStart > manualEnd) {
      alert("The start date cannot be after the end date.");
      return;
    }

    if (manualLoading) return;

    try {
      setManualLoading(true);
      setManualPreview(null);

      const response = await fetch("/api/invoices/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: Number(manualOwnerId),
          start: manualStart,
          end: manualEnd,
          hstEnabled: manualHstEnabled,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.error || "Could not prepare the manual invoice."
        );
      }

      setManualPreview(result.data as ManualInvoicePreview);

      if (!result.data?.items?.length) {
        alert(
          "No completed cleanings or approved expenses were found for this client and date range."
        );
      }
    } catch (error) {
      console.error("Failed to preview manual invoice:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Could not prepare the manual invoice."
      );
    } finally {
      setManualLoading(false);
    }
  }


  async function handleDownloadManualInvoice() {
    if (!manualPreview) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 42;
    const contentWidth = pageWidth - margin * 2;
    const navy: [number, number, number] = [31, 78, 121];
    const blue: [number, number, number] = [46, 123, 190];
    const muted: [number, number, number] = [100, 116, 139];
    const pale: [number, number, number] = [242, 247, 251];
    const money = (value: number) => formatMoney(value);

    // Brand logo
    try {
      const response = await fetch("/images/logo.jpg");
      if (response.ok) {
        const blob = await response.blob();

        const logoData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        doc.addImage(logoData, "JPEG", margin, 28, 86, 58);
      }
    } catch (error) {
      console.warn("Could not load PureSpace logo:", error);
    }

    // Company header
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(19);
    doc.text("PureSpace Cleaning", margin + 100, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text("Professional Cleaning Services", margin + 100, 64);
    doc.text("cleaningpurespace26@gmail.com", margin + 100, 78);

    doc.setDrawColor(...blue);
    doc.setLineWidth(2);
    doc.line(margin, 101, pageWidth - margin, 101);

    // Finance title
    doc.setTextColor(...navy);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("INVOICE", margin, 132);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    doc.text("FINANCE DEPARTMENT", pageWidth - margin, 126, {
      align: "right",
    });
    doc.text("BILLING STATEMENT", pageWidth - margin, 140, {
      align: "right",
    });

    // Client and billing period panel
    doc.setFillColor(...pale);
    doc.roundedRect(margin, 155, contentWidth, 84, 7, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("BILLED TO", margin + 14, 174);
    doc.text("BILLING PERIOD", pageWidth / 2 + 10, 174);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...navy);
    doc.text(String(manualPreview.owner.name || "Client"), margin + 14, 193);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);

    if (manualPreview.owner.email) {
      doc.text(String(manualPreview.owner.email), margin + 14, 209);
    }

    if (manualPreview.owner.phone) {
      doc.text(String(manualPreview.owner.phone), margin + 14, 223);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...navy);
    doc.text(
      `${formatDate(manualPreview.period_start)} - ${formatDate(manualPreview.period_end)}`,
      pageWidth / 2 + 10,
      196
    );

    // Invoice line items
    const tableRows = manualPreview.items.map((item) => [
      formatDate(item.item_date),
      item.property_name,
      item.description,
      String(item.quantity),
      money(item.unit_price),
      money(item.amount),
    ]);

    autoTable(doc, {
      startY: 258,
      head: [[
        "Date",
        "Property",
        "Description",
        "Qty",
        "Unit price",
        "Amount",
      ]],
      body: tableRows.length
        ? tableRows
        : [["—", "—", "No billable items", "—", "—", money(0)]],
      margin: { left: margin, right: margin, bottom: 130 },
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 6,
        overflow: "linebreak",
        textColor: [55, 65, 81],
        lineColor: [226, 232, 240],
        lineWidth: 0.35,
      },
      headStyles: {
        fillColor: navy,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 59 },
        1: { cellWidth: 90 },
        2: { cellWidth: "auto" },
        3: { cellWidth: 27, halign: "right" },
        4: { cellWidth: 61, halign: "right" },
        5: { cellWidth: 61, halign: "right" },
      },
    });

    let y =
      (
        doc as jsPDF & {
          lastAutoTable?: { finalY: number };
        }
      ).lastAutoTable?.finalY ?? 270;

    y += 26;

    const cleaning = Number(manualPreview.total_cleaning || 0);
    const expenses = Number(manualPreview.total_expenses || 0);
    const subtotal = Number(manualPreview.subtotal || cleaning + expenses);
    const hst = Number(manualPreview.hst_amount || 0);
    const total = Number(manualPreview.total_due || subtotal + hst);

    // Keep the summary together on a new page if needed
    if (y + 112 > pageHeight - 70) {
      doc.addPage();
      y = 65;
    }

    const labelX = pageWidth - margin - 190;
    const valueX = pageWidth - margin;

    const drawTotalRow = (
      label: string,
      value: number,
      bold = false
    ) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(bold ? 11 : 9);
      doc.setTextColor(...(bold ? navy : muted));
      doc.text(label, labelX, y);
      doc.text(money(value), valueX, y, { align: "right" });
      y += bold ? 25 : 19;
    };

    drawTotalRow("Cleaning services", cleaning);
    drawTotalRow("Approved expenses", expenses);
    drawTotalRow("Subtotal", subtotal);

    drawTotalRow(
      `HST (${manualPreview.hst_enabled ? "13%" : "not applied"})`,
      hst
    );

    doc.setDrawColor(...blue);
    doc.setLineWidth(1);
    doc.line(labelX, y - 7, valueX, y - 7);
    y += 7;

    doc.setFillColor(...navy);
    doc.roundedRect(labelX - 10, y - 8, valueX - labelX + 20, 39, 5, 5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL DUE", labelX, y + 16);
    doc.setFontSize(15);
    doc.text(money(total), valueX, y + 16, { align: "right" });

    // Footer on every page
    const pageCount = doc.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 43, pageWidth - margin, pageHeight - 43);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text(
        "PureSpace Cleaning | Finance Department",
        margin,
        pageHeight - 27
      );
      doc.text(
        "Thank you for choosing PureSpace Cleaning.",
        pageWidth - margin,
        pageHeight - 27,
        { align: "right" }
      );
    }

    const safeName = String(manualPreview.owner.name || "Client")
      .replace(/[^a-z0-9-_]/gi, "_");

    doc.save(`PureSpace-Invoice-${safeName}.pdf`);
  }

  async function handleToggleHst(invoice: Invoice) {
    if (savingInvoiceId !== null) return;

    const nextEnabled = !Boolean(invoice.hst_enabled);

    try {
      setSavingInvoiceId(invoice.id);

      const updated = await setInvoiceHst(invoice.id, nextEnabled);

      setGroups((currentGroups) =>
        currentGroups.map((group) => ({
          ...group,
          invoices: group.invoices.map((currentInvoice) =>
            currentInvoice.id === updated.id
              ? { ...currentInvoice, ...updated }
              : currentInvoice
          ),
        }))
      );
    } catch (error) {
      console.error("Failed to update invoice HST:", error);
      alert("Could not update HST for this invoice.");
    } finally {
      setSavingInvoiceId(null);
    }
  }

  async function handlePaymentStatusChange(
    invoice: Invoice,
    paymentStatus: "Paid" | "Pending" | "Unpaid"
  ) {
    if (savingInvoiceId !== null) return;

    try {
      setSavingInvoiceId(invoice.id);

      const updated = await setInvoicePaymentStatus(
        invoice.id,
        paymentStatus
      );

      setGroups((currentGroups) =>
        currentGroups.map((group) => ({
          ...group,
          invoices: group.invoices.map((currentInvoice) =>
            currentInvoice.id === updated.id
              ? { ...currentInvoice, ...updated }
              : currentInvoice
          ),
        }))
      );
    } catch (error) {
      console.error("Failed to update payment status:", error);
      alert("Could not update payment status. Please try again.");
    } finally {
      setSavingInvoiceId(null);
    }
  }

  const availableMonths = useMemo(() => {
    const months = new Set<string>();

    groups.forEach((group) => {
      group.invoices.forEach((invoice) => {
        if (invoice.period_end) {
          months.add(invoice.period_end.slice(0, 7));
        }
      });
    });

    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();

    return groups
      .map((group) => {
        const matchingInvoices = group.invoices.filter((invoice) => {
          const invoiceMonth = invoice.period_end?.slice(0, 7) || "";

          const matchesMonth =
            selectedMonth === "all" || invoiceMonth === selectedMonth;

          const matchesSearch =
            !term ||
            group.owner_name?.toLowerCase().includes(term) ||
            group.owner_email?.toLowerCase().includes(term) ||
            invoice.property_name?.toLowerCase().includes(term) ||
            invoice.invoice_number?.toLowerCase().includes(term);

          return matchesMonth && matchesSearch;
        });

        return { ...group, invoices: matchingInvoices };
      })
      .filter((group) => group.invoices.length > 0)
      .sort((a, b) => {
        const periodCompare = b.period_end.localeCompare(a.period_end);
        if (periodCompare !== 0) return periodCompare;

        return (a.owner_name || "").localeCompare(b.owner_name || "");
      });
  }, [groups, search, selectedMonth]);

  const propertyInvoiceCount = filteredGroups.reduce(
    (sum, group) => sum + group.invoices.length,
    0
  );

  const totalBilled = filteredGroups.reduce(
    (sum, group) =>
      sum +
      group.invoices.reduce(
        (invoiceSum, invoice) =>
          invoiceSum + Number(invoice.total_due || 0),
        0
      ),
    0
  );

  const filteredMonths = useMemo(
    () =>
      Array.from(
        new Set(
          filteredGroups.flatMap((group) =>
            group.invoices
              .map((invoice) => invoice.period_end?.slice(0, 7) || "")
              .filter(Boolean)
          )
        )
      ).sort((a, b) => b.localeCompare(a)),
    [filteredGroups]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F7FB]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#2E7BBE]" />
          <p className="mt-4 text-slate-500">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <div className="mx-auto max-w-[1700px] space-y-8 px-8 py-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#2E7BBE]">
              Finance
            </p>
            <h1 className="mt-2 text-4xl font-black text-[#1F4E79]">
              Invoices
            </h1>
            <p className="mt-2 text-slate-500">
              Historical owner invoices and billing periods.
            </p>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              HST is managed individually for each property invoice. Payment
              status can be updated for each invoice.
            </p>
          </div>

          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-100 bg-white shadow-md">
            <FileText className="h-8 w-8 text-[#2E7BBE]" />
          </div>
        </div>

        <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-md">
          <h2 className="text-xl font-bold text-[#1F4E79]">Manual Invoice</h2>
          <p className="mt-2 text-sm text-slate-500">
            Select a client and date range to combine completed cleanings and
            approved property expenses across all their properties. This is a
            temporary invoice and will not be saved to invoice history.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label
                htmlFor="manual-invoice-client"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Client
              </label>
              <select
                id="manual-invoice-client"
                value={manualOwnerId}
                onChange={(event) => {
                  setManualOwnerId(event.target.value);
                  setManualPreview(null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none focus:border-[#2E7BBE]"
              >
                <option value="">Select a client</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="manual-invoice-start"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Start date
              </label>
              <input
                id="manual-invoice-start"
                type="date"
                value={manualStart}
                onChange={(event) => {
                  setManualStart(event.target.value);
                  setManualPreview(null);
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-[#2E7BBE]"
              />
            </div>

            <div>
              <label
                htmlFor="manual-invoice-end"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                End date
              </label>
              <input
                id="manual-invoice-end"
                type="date"
                min={manualStart || undefined}
                value={manualEnd}
                onChange={(event) => {
                  setManualEnd(event.target.value);
                  setManualPreview(null);
                }}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-700 outline-none focus:border-[#2E7BBE]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handlePreviewManualInvoice}
                disabled={
                  manualLoading ||
                  !manualOwnerId ||
                  !manualStart ||
                  !manualEnd ||
                  manualStart > manualEnd
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2E7BBE] px-5 py-3 font-semibold text-white transition hover:bg-[#1F4E79] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {manualLoading && (
                  <Loader2 className="h-5 w-5 animate-spin" />
                )}
                {manualLoading ? "Preparing..." : "Preview Invoice"}
              </button>
            </div>
          </div>

          <label className="mt-5 inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={manualHstEnabled}
              onChange={(event) => {
                setManualHstEnabled(event.target.checked);
                setManualPreview(null);
              }}
              className="h-4 w-4 rounded border-slate-300 text-[#2E7BBE] focus:ring-[#2E7BBE]"
            />
            Apply HST (13%) to this manual invoice
          </label>

          {manualPreview && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1F4E79]">
                    {manualPreview.owner.name}
                  </h3>
                  {manualPreview.owner.email && (
                    <p className="text-sm text-slate-500">
                      {manualPreview.owner.email}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(manualPreview.period_start)} —{" "}
                    {formatDate(manualPreview.period_end)}
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    Temporary preview; not saved to invoice history.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadManualInvoice}
                  disabled={manualPreview.items.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1F4E79] px-5 py-3 font-semibold text-white hover:bg-[#173b5c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileText className="h-5 w-5" />
                  Download PDF
                </button>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-3 py-3">Date</th>
                      <th className="px-3 py-3">Property</th>
                      <th className="px-3 py-3">Description</th>
                      <th className="px-3 py-3 text-right">Qty</th>
                      <th className="px-3 py-3 text-right">Unit price</th>
                      <th className="px-3 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {manualPreview.items.map((item, index) => (
                      <tr
                        key={`${item.property_id}-${item.item_type}-${item.item_date}-${index}`}
                      >
                        <td className="px-3 py-3 text-slate-600">
                          {formatDate(item.item_date)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-slate-700">
                            {item.property_name}
                          </div>
                          {item.property_address && (
                            <div className="text-xs text-slate-400">
                              {item.property_address}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-slate-600">
                          {item.description}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-600">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-600">
                          {formatMoney(item.unit_price)}
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-slate-700">
                          {formatMoney(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 ml-auto max-w-sm space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Cleaning</span>
                  <strong>{formatMoney(manualPreview.total_cleaning)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approved expenses</span>
                  <strong>{formatMoney(manualPreview.total_expenses)}</strong>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500">Subtotal</span>
                  <strong>{formatMoney(manualPreview.subtotal)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">
                    HST {manualPreview.hst_enabled ? "(13%)" : "(not applied)"}
                  </span>
                  <strong>{formatMoney(manualPreview.hst_amount)}</strong>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
                  <span className="font-bold text-[#1F4E79]">Total</span>
                  <strong className="text-[#2E7BBE]">
                    {formatMoney(manualPreview.total_due)}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Invoice Periods
            </p>
            <h2 className="mt-3 text-4xl font-black text-[#2E7BBE]">
              {filteredGroups.length}
            </h2>
            <p className="mt-2 text-slate-500">Historical billing periods</p>
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Property Invoices
            </p>
            <h2 className="mt-3 text-4xl font-black text-[#2E7BBE]">
              {propertyInvoiceCount}
            </h2>
            <p className="mt-2 text-slate-500">Individual property invoices</p>
          </div>

          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Total Billed
            </p>
            <h2 className="mt-3 text-4xl font-black text-[#1F4E79]">
              {formatMoney(totalBilled)}
            </h2>
            <p className="mt-2 text-slate-500">
              Based on individual invoice totals
            </p>
          </div>
        </div>

        <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-md">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search owner, property or invoice number..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 outline-none transition focus:border-[#2E7BBE] focus:bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="invoice-month"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Monthly History
              </label>
              <select
                id="invoice-month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-700 outline-none transition focus:border-[#2E7BBE] focus:bg-white"
              >
                <option value="all">All months</option>
                {availableMonths.map((month) => {
                  const [year, monthNumber] = month.split("-");
                  const label = new Date(
                    Number(year),
                    Number(monthNumber) - 1,
                    1
                  ).toLocaleDateString("en-CA", {
                    month: "long",
                    year: "numeric",
                  });

                  return (
                    <option key={month} value={month}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </section>

        {filteredGroups.length === 0 ? (
          <div className="rounded-[32px] border border-slate-100 bg-white p-16 text-center shadow-md">
            <FileText className="mx-auto h-14 w-14 text-slate-300" />
            <h2 className="mt-5 text-2xl font-bold text-[#1F4E79]">
              No invoices found
            </h2>
            <p className="mt-2 text-slate-500">
              Try another month or change your search.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredMonths.map((month) => {
              const monthGroups = filteredGroups
                .map((group) => ({
                  ...group,
                  invoices: group.invoices.filter(
                    (invoice) => invoice.period_end?.slice(0, 7) === month
                  ),
                }))
                .filter((group) => group.invoices.length > 0);

              const isExpanded =
                expandedMonths[month] ?? month === filteredMonths[0];

              const [year, monthNumber] = month.split("-");
              const monthLabel = new Date(
                Number(year),
                Number(monthNumber) - 1,
                1
              ).toLocaleDateString("en-CA", {
                month: "long",
                year: "numeric",
              });

              const monthTotal = monthGroups.reduce(
                (sum, group) =>
                  sum +
                  group.invoices.reduce(
                    (invoiceSum, invoice) =>
                      invoiceSum + Number(invoice.total_due || 0),
                    0
                  ),
                0
              );

              const invoiceCount = monthGroups.reduce(
                (sum, group) => sum + group.invoices.length,
                0
              );

              return (
                <section
                  key={month}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedMonths((current) => ({
                        ...current,
                        [month]: !isExpanded,
                      }))
                    }
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight
                        className={`h-5 w-5 shrink-0 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                      <div>
                        <h2 className="text-xl font-bold text-[#1F4E79]">
                          {monthLabel}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {invoiceCount}{" "}
                          {invoiceCount === 1 ? "invoice" : "invoices"}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[#2E7BBE]">
                      {formatMoney(monthTotal)}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="space-y-6 border-t border-slate-100 p-4 sm:p-6">
                      {monthGroups.map((group) => {
                        const groupTotal = group.invoices.reduce(
                          (sum, invoice) =>
                            sum + Number(invoice.total_due || 0),
                          0
                        );

                        return (
                          <div
                            key={`${group.owner_id}-${group.period_start}-${group.period_end}`}
                            className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-md"
                          >
                            <div className="border-b border-slate-100 bg-slate-50/70 px-7 py-6">
                              <div className="flex items-center justify-between gap-6">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                                    Billing Period
                                  </p>
                                  <h2 className="mt-2 text-2xl font-black text-[#1F4E79]">
                                    {group.owner_name ||
                                      `Owner #${group.owner_id}`}
                                  </h2>
                                  <p className="mt-1 text-slate-500">
                                    {formatDate(group.period_start)} —{" "}
                                    {formatDate(group.period_end)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs uppercase tracking-widest text-slate-400">
                                    Period Total
                                  </p>
                                  <p className="mt-1 text-3xl font-black text-[#2E7BBE]">
                                    {formatMoney(groupTotal)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="divide-y divide-slate-100">
                              {group.invoices.map((invoice) => {
                                const subtotal = getSubtotal(invoice);
                                const hst = getHstAmount(invoice);
                                const isSaving =
                                  savingInvoiceId === invoice.id;
                                const paymentStatus =
                                  invoice.payment_status || "Unpaid";

                                const paymentColor =
                                  paymentStatus === "Paid"
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : paymentStatus === "Pending"
                                      ? "border-amber-200 bg-amber-50 text-amber-700"
                                      : "border-red-200 bg-red-50 text-red-700";

                                return (
                                  <div
                                    key={invoice.id}
                                    className="px-7 py-6 transition hover:bg-slate-50"
                                  >
                                    <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-start gap-3">
                                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF4FB]">
                                            <FileText className="h-5 w-5 text-[#2E7BBE]" />
                                          </div>
                                          <div className="min-w-0">
                                            <h3 className="font-bold text-[#1F4E79]">
                                              {invoice.property_name}
                                            </h3>
                                            {invoice.property_address && (
                                              <p className="mt-1 text-sm text-slate-400">
                                                {invoice.property_address}
                                              </p>
                                            )}
                                            <p className="mt-1 text-sm text-slate-400">
                                              {invoice.invoice_number}
                                            </p>

                                            <div className="mt-4">
                                              <label
                                                htmlFor={`payment-status-${invoice.id}`}
                                                className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400"
                                              >
                                                Payment Status
                                              </label>
                                              <select
                                                id={`payment-status-${invoice.id}`}
                                                value={paymentStatus}
                                                disabled={isSaving}
                                                onChange={(event) =>
                                                  void handlePaymentStatusChange(
                                                    invoice,
                                                    event.target.value as
                                                      | "Paid"
                                                      | "Pending"
                                                      | "Unpaid"
                                                  )
                                                }
                                                className={`rounded-xl border px-4 py-2 text-sm font-semibold outline-none disabled:cursor-wait disabled:opacity-60 ${paymentColor}`}
                                              >
                                                <option value="Unpaid">
                                                  Unpaid
                                                </option>
                                                <option value="Pending">
                                                  Pending
                                                </option>
                                                <option value="Paid">
                                                  Paid
                                                </option>
                                              </select>
                                              {isSaving && (
                                                <p className="mt-1 text-xs text-slate-400">
                                                  Saving...
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                                        <div className="text-right">
                                          <p className="text-xs uppercase tracking-widest text-slate-400">
                                            Cleaning
                                          </p>
                                          <p className="mt-1 font-semibold text-slate-700">
                                            {formatMoney(
                                              Number(invoice.total_cleaning || 0)
                                            )}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs uppercase tracking-widest text-slate-400">
                                            Expenses
                                          </p>
                                          <p className="mt-1 font-semibold text-slate-700">
                                            {formatMoney(
                                              Number(invoice.total_expenses || 0)
                                            )}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs uppercase tracking-widest text-slate-400">
                                            HST
                                          </p>
                                          <p className="mt-1 font-semibold text-slate-700">
                                            {formatMoney(hst)}
                                          </p>
                                          <p
                                            className={`mt-1 text-xs font-semibold ${
                                              invoice.hst_enabled
                                                ? "text-green-600"
                                                : "text-slate-400"
                                            }`}
                                          >
                                            {invoice.hst_enabled
                                              ? "13% applied"
                                              : "Not applied"}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs uppercase tracking-widest text-slate-400">
                                            Total
                                          </p>
                                          <p className="mt-1 text-xl font-black text-[#2E7BBE]">
                                            {formatMoney(
                                              Number(invoice.total_due || 0)
                                            )}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-4">
                                        <button
                                          type="button"
                                          disabled={isSaving}
                                          onClick={() =>
                                            void handleToggleHst(invoice)
                                          }
                                          className={`relative flex h-11 w-[78px] items-center rounded-full p-1 transition ${
                                            invoice.hst_enabled
                                              ? "bg-green-500"
                                              : "bg-slate-300"
                                          } ${
                                            isSaving
                                              ? "cursor-wait opacity-60"
                                              : "cursor-pointer"
                                          }`}
                                          aria-label={
                                            invoice.hst_enabled
                                              ? "Disable HST"
                                              : "Enable HST"
                                          }
                                        >
                                          <span
                                            className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition ${
                                              invoice.hst_enabled
                                                ? "translate-x-[34px]"
                                                : "translate-x-0"
                                            }`}
                                          >
                                            {isSaving ? (
                                              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                                            ) : invoice.hst_enabled ? (
                                              <Check className="h-4 w-4 text-green-600" />
                                            ) : (
                                              <X className="h-4 w-4 text-slate-400" />
                                            )}
                                          </span>
                                        </button>
                                        <div className="min-w-[105px]">
                                          <p className="text-xs uppercase tracking-widest text-slate-400">
                                            HST
                                          </p>
                                          <p
                                            className={`text-sm font-bold ${
                                              invoice.hst_enabled
                                                ? "text-green-600"
                                                : "text-slate-500"
                                            }`}
                                          >
                                            {isSaving
                                              ? "Saving..."
                                              : invoice.hst_enabled
                                                ? "Enabled · 13%"
                                                : "Disabled"}
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          router.push(
                                            `/dashboard/invoices/${group.owner_id}/${group.period_start}/${group.period_end}`
                                          )
                                        }
                                        className="flex items-center justify-center gap-2 rounded-2xl bg-[#2E7BBE] px-5 py-3 font-semibold text-white transition hover:bg-[#1F4E79]"
                                      >
                                        View
                                        <ChevronRight className="h-4 w-4" />
                                      </button>
                                    </div>

                                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                                      <span>
                                        Subtotal:{" "}
                                        <strong className="text-slate-600">
                                          {formatMoney(subtotal)}
                                        </strong>
                                      </span>
                                      <span>
                                        HST:{" "}
                                        <strong className="text-slate-600">
                                          {formatMoney(hst)}
                                        </strong>
                                      </span>
                                      <span>
                                        Final amount:{" "}
                                        <strong className="text-[#2E7BBE]">
                                          {formatMoney(
                                            Number(invoice.total_due || 0)
                                          )}
                                        </strong>
                                      </span>
                                      <span
                                        className={
                                          invoice.hst_enabled
                                            ? "font-semibold text-green-600"
                                            : "font-semibold text-slate-400"
                                        }
                                      >
                                        {invoice.hst_enabled
                                          ? "HST included in total"
                                          : "HST not applied"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
