import jsPDF from "jspdf";

async function getLogo() {
  const response = await fetch("/images/logo.jpg");
  const blob = await response.blob();

  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

type HistoricalOwnerInvoice = {
  invoice_number: string;
  property_name: string;
  property_address?: string | null;
  owner_name?: string | null;
  period_start: string;
  period_end: string;
  total_cleaning: number;
  total_expenses: number;
  total_due: number;
  hst_enabled: boolean;
};

const formatMoney = (amount: unknown) => {
  const value = Number(amount ?? 0);
  return Number.isFinite(value) ? `$${value.toFixed(2)}` : "$0.00";
};

const formatDate = (date: string) => {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const cleanText = (value: unknown) => String(value ?? "").trim();

export async function downloadHistoricalOwnerInvoice(
  invoice: HistoricalOwnerInvoice
) {
  const logo = await getLogo();
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 17;
  const contentWidth = pageWidth - margin * 2;

  // PureSpace logo palette
  const blue = [45, 149, 213] as const;
  const teal = [43, 169, 165] as const;
  const navy = [24, 52, 77] as const;
  const darkText = [34, 48, 61] as const;
  const grayText = [102, 116, 129] as const;
  const softBlue = [244, 249, 253] as const;
  const softTeal = [241, 250, 249] as const;
  const border = [218, 227, 233] as const;
  const white = [255, 255, 255] as const;

  const setFont = (
    size: number,
    color: readonly [number, number, number] = darkText,
    style: "normal" | "bold" = "normal"
  ) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const roundedBox = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill: readonly [number, number, number],
    radius = 3
  ) => {
    doc.setFillColor(...fill);
    doc.roundedRect(x, y, width, height, radius, radius, "F");
  };

  const outlinedBox = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill: readonly [number, number, number] = white
  ) => {
    doc.setFillColor(...fill);
    doc.setDrawColor(...border);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, y, width, height, 3, 3, "FD");
  };

  const drawAccent = () => {
    doc.setFillColor(...blue);
    doc.rect(0, 0, pageWidth * 0.72, 2.2, "F");

    doc.setFillColor(...teal);
    doc.rect(pageWidth * 0.72, 0, pageWidth * 0.28, 2.2, "F");
  };

  const drawFooter = () => {
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

    setFont(7.5, grayText);
    doc.text("PureSpace Cleaning", margin, pageHeight - 10);

    doc.text(
      "cleaningpurespace26@gmail.com",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    doc.text(
      "Thank you for choosing PureSpace Cleaning",
      pageWidth - margin,
      pageHeight - 10,
      { align: "right" }
    );

    setFont(7, grayText);
    doc.text(
      "Page 1 of 1",
      pageWidth / 2,
      pageHeight - 4.5,
      { align: "center" }
    );
  };

  // ─────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────

  drawAccent();

  try {
    doc.addImage(logo, "JPEG", margin, 9, 34, 27);
  } catch {
    // Fallback keeps the invoice functional if the logo cannot load.
    doc.setFillColor(...blue);
    doc.circle(margin + 10, 22, 8, "F");
    doc.setFillColor(...teal);
    doc.circle(margin + 20, 22, 8, "F");
  }

  setFont(10, navy, "bold");
  doc.text("PURESPACE CLEANING", margin + 40, 16);

  setFont(7.5, grayText);
  doc.text(
    "Professional Cleaning Services",
    margin + 40,
    21
  );

  setFont(18, navy, "bold");
  doc.text("CLEANING", pageWidth - margin, 15, {
    align: "right",
  });

  setFont(18, teal, "bold");
  doc.text("INVOICE", pageWidth - margin, 23, {
    align: "right",
  });

  setFont(7.5, grayText);
  doc.text(
    "Individual property invoice",
    pageWidth - margin,
    29,
    { align: "right" }
  );

  // ─────────────────────────────────────────────
  // CLIENT + BILLING INFORMATION
  // ─────────────────────────────────────────────

  const infoY = 43;
  const infoH = 44;

  outlinedBox(margin, infoY, contentWidth, infoH, white);

  setFont(7, blue, "bold");
  doc.text("BILL TO", margin + 7, infoY + 9);

  setFont(12.5, navy, "bold");
  doc.text(
    cleanText(invoice.owner_name) || "Client",
    margin + 7,
    infoY + 18
  );

  setFont(7, blue, "bold");
  doc.text(
    "BILLING PERIOD",
    pageWidth - margin - 7,
    infoY + 9,
    { align: "right" }
  );

  setFont(9.5, darkText, "bold");
  doc.text(
    `${formatDate(invoice.period_start)} – ${formatDate(invoice.period_end)}`,
    pageWidth - margin - 7,
    infoY + 18,
    { align: "right" }
  );

  doc.setDrawColor(...border);
  doc.setLineWidth(0.25);
  doc.line(
    margin + 7,
    infoY + 23,
    pageWidth - margin - 7,
    infoY + 23
  );

  setFont(7, blue, "bold");
  doc.text("INVOICE NUMBER", margin + 7, infoY + 31);

  setFont(8.5, navy, "bold");
  doc.text(
    cleanText(invoice.invoice_number) || "—",
    margin + 7,
    infoY + 37
  );

  setFont(7, grayText);
  doc.text(
    "Finalized property invoice",
    pageWidth - margin - 7,
    infoY + 36,
    { align: "right" }
  );

  // ─────────────────────────────────────────────
  // PROPERTY
  // ─────────────────────────────────────────────

  let y = 98;

  setFont(7, blue, "bold");
  doc.text("SERVICE PROPERTY", margin, y);

  y += 5;

  roundedBox(margin, y, contentWidth, 22, navy, 3);

  setFont(11, white, "bold");
  doc.text(
    cleanText(invoice.property_name) || "Property",
    margin + 7,
    y + 9
  );

  setFont(7.5, [204, 221, 234] as const);
  doc.text(
    cleanText(invoice.property_address) || "Property service address",
    margin + 7,
    y + 15
  );

  // ─────────────────────────────────────────────
  // CHARGES
  // ─────────────────────────────────────────────

  y += 30;

  setFont(7, blue, "bold");
  doc.text("CHARGES", margin, y);

  y += 5;

  const cleaning = Number(invoice.total_cleaning || 0);
  const expenses = Number(invoice.total_expenses || 0);
  const subtotal = cleaning + expenses;

  // The finalized invoice total is authoritative.
  // HST is the difference between total_due and subtotal,
  // but only displayed when hst_enabled is true.
  const hstEnabled = Boolean(invoice.hst_enabled);
  const totalDue = Number(invoice.total_due || 0);
  const hstAmount = hstEnabled
    ? Math.max(0, totalDue - subtotal)
    : 0;

  const rows = [
    {
      label: "Cleaning services",
      amount: cleaning,
    },
    ...(expenses > 0
      ? [
          {
            label: "Approved property expenses",
            amount: expenses,
          },
        ]
      : []),
  ];

  const tableHeight =
    18 +
    rows.length * 11 +
    (hstAmount > 0 ? 11 : 0) +
    17;

  outlinedBox(margin, y, contentWidth, tableHeight, white);

  // Table header
  doc.setFillColor(...softBlue);
  doc.roundedRect(
    margin + 0.5,
    y + 0.5,
    contentWidth - 1,
    12,
    2.5,
    2.5,
    "F"
  );

  setFont(7, grayText, "bold");
  doc.text("DESCRIPTION", margin + 7, y + 8);

  doc.text(
    "AMOUNT",
    pageWidth - margin - 7,
    y + 8,
    { align: "right" }
  );

  let rowY = y + 22;

  rows.forEach((row, index) => {
    setFont(9, darkText);
    doc.text(row.label, margin + 7, rowY);

    setFont(9, navy, "bold");
    doc.text(
      formatMoney(row.amount),
      pageWidth - margin - 7,
      rowY,
      { align: "right" }
    );

    if (index < rows.length - 1) {
      doc.setDrawColor(...border);
      doc.setLineWidth(0.25);
      doc.line(
        margin + 7,
        rowY + 5,
        pageWidth - margin - 7,
        rowY + 5
      );
    }

    rowY += 11;
  });

  if (hstAmount > 0) {
    doc.setDrawColor(...border);
    doc.setLineWidth(0.25);
    doc.line(
      margin + 7,
      rowY - 5,
      pageWidth - margin - 7,
      rowY - 5
    );

    setFont(8.5, grayText);
    doc.text("HST (13%)", margin + 7, rowY + 1);

    setFont(8.5, darkText, "bold");
    doc.text(
      formatMoney(hstAmount),
      pageWidth - margin - 7,
      rowY + 1,
      { align: "right" }
    );

    rowY += 11;
  }

  // Property total
  doc.setFillColor(...softTeal);
  doc.roundedRect(
    margin + 0.5,
    y + tableHeight - 17,
    contentWidth - 1,
    16.5,
    2.5,
    2.5,
    "F"
  );

  setFont(7, teal, "bold");
  doc.text(
    "TOTAL DUE",
    margin + 7,
    y + tableHeight - 7
  );

  setFont(14, navy, "bold");
  doc.text(
    formatMoney(totalDue),
    pageWidth - margin - 7,
    y + tableHeight - 7,
    { align: "right" }
  );

  // ─────────────────────────────────────────────
  // PAYMENT SUMMARY
  // ─────────────────────────────────────────────

  y += tableHeight + 12;

  setFont(7, blue, "bold");
  doc.text("INVOICE SUMMARY", margin, y);

  y += 5;

  roundedBox(margin, y, contentWidth, 50, navy, 4);

  setFont(9.5, white, "bold");
  doc.text(
    "Finalized amount",
    margin + 9,
    y + 11
  );

  setFont(20, white, "bold");
  doc.text(
    formatMoney(totalDue),
    pageWidth - margin - 9,
    y + 12,
    { align: "right" }
  );

  doc.setDrawColor(75, 105, 128);
  doc.setLineWidth(0.3);
  doc.line(
    margin + 9,
    y + 19,
    pageWidth - margin - 9,
    y + 19
  );

  const summaryRows = [
    ["Cleaning services", cleaning],
    ...(expenses > 0
      ? [["Approved property expenses", expenses]]
      : []),
    ...(hstAmount > 0 ? [["HST (13%)", hstAmount]] : []),
  ];

  let summaryY = y + 29;

  summaryRows.forEach(([label, amount], index) => {
    setFont(8, [218, 232, 242] as const);
    doc.text(String(label), margin + 9, summaryY);

    setFont(8, white, "bold");
    doc.text(
      formatMoney(amount),
      pageWidth - margin - 9,
      summaryY,
      { align: "right" }
    );

    if (index < summaryRows.length - 1) {
      doc.setDrawColor(68, 96, 119);
      doc.setLineWidth(0.25);
      doc.line(
        margin + 9,
        summaryY + 4,
        pageWidth - margin - 9,
        summaryY + 4
      );
    }

    summaryY += 9;
  });

  // ─────────────────────────────────────────────
  // CLOSING NOTE
  // ─────────────────────────────────────────────

  y += 60;

  roundedBox(margin, y, contentWidth, 29, softTeal, 3);

  setFont(9, teal, "bold");
  doc.text(
    "Thank you for choosing PureSpace Cleaning.",
    margin + 8,
    y + 10
  );

  setFont(7.6, grayText);
  const note = doc.splitTextToSize(
    "This invoice represents the finalized charges for the property and billing period shown above. Please retain this document for your records.",
    contentWidth - 16
  );

  doc.text(note, margin + 8, y + 18);

  drawFooter();

  const safePropertyName =
    cleanText(invoice.property_name)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "Property";

  const fileName =
    `PureSpace-Invoice-${safePropertyName}-${invoice.period_start}-${invoice.period_end}.pdf`;

  doc.save(fileName);
}
