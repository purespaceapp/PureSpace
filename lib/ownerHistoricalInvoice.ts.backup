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

const BLUE = [45, 149, 213] as const;
const TEAL = [43, 169, 165] as const;
const NAVY = [24, 52, 77] as const;
const TEXT = [42, 55, 68] as const;
const MUTED = [103, 117, 130] as const;
const BORDER = [220, 228, 234] as const;
const SOFT_BLUE = [246, 250, 253] as const;
const SOFT_TEAL = [242, 250, 249] as const;
const WHITE = [255, 255, 255] as const;

const money = (value: unknown) => {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue)
    ? `$${numberValue.toFixed(2)}`
    : "$0.00";
};

const formatDate = (date: string) => {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

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
  const footerY = pageHeight - 13;

  const setFont = (
    size: number,
    color: readonly [number, number, number] = TEXT,
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
    fill: readonly [number, number, number] = WHITE
  ) => {
    doc.setFillColor(...fill);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, y, width, height, 3, 3, "FD");
  };

  const drawTopAccent = () => {
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, pageWidth * 0.72, 2.2, "F");

    doc.setFillColor(...TEAL);
    doc.rect(pageWidth * 0.72, 0, pageWidth * 0.28, 2.2, "F");
  };

  const drawHeader = () => {
    drawTopAccent();

    try {
      doc.addImage(logo, "JPEG", margin, 8, 30, 25);
    } catch {
      doc.setFillColor(...BLUE);
      doc.circle(margin + 9, 20, 7, "F");
      doc.setFillColor(...TEAL);
      doc.circle(margin + 18, 20, 7, "F");
    }

    setFont(10.5, NAVY, "bold");
    doc.text("PURESPACE CLEANING", margin + 36, 14);

    setFont(7.2, MUTED);
    doc.text(
      "Professional Cleaning Services",
      margin + 36,
      19
    );

    setFont(18, NAVY, "bold");
    doc.text("CLEANING", pageWidth - margin, 14, {
      align: "right",
    });

    setFont(18, TEAL, "bold");
    doc.text("INVOICE", pageWidth - margin, 22, {
      align: "right",
    });

    setFont(7.2, MUTED);
    doc.text(
      "Individual property invoice",
      pageWidth - margin,
      29,
      { align: "right" }
    );
  };

  const drawFooter = (pageNumber: number, totalPages: number) => {
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    setFont(7.2, MUTED);
    doc.text("PureSpace Cleaning", margin, footerY + 1);

    doc.text(
      "cleaningpurespace26@gmail.com",
      pageWidth / 2,
      footerY + 1,
      { align: "center" }
    );

    doc.text(
      "Thank you for choosing PureSpace Cleaning",
      pageWidth - margin,
      footerY + 1,
      { align: "right" }
    );

    setFont(6.8, MUTED);
    doc.text(
      `Page ${pageNumber} of ${totalPages}`,
      pageWidth / 2,
      footerY + 7,
      { align: "center" }
    );
  };

  const cleaning = Number(invoice.total_cleaning || 0);
  const expenses = Number(invoice.total_expenses || 0);
  const subtotal = cleaning + expenses;
  const totalDue = Number(invoice.total_due || 0);

  // The finalized invoice total is authoritative.
  // HST is only displayed when this invoice has HST enabled.
  const hstEnabled = Boolean(invoice.hst_enabled);
  const hstAmount = hstEnabled
    ? Math.max(0, totalDue - subtotal)
    : 0;

  // ─────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────

  drawHeader();

  // ─────────────────────────────────────────────
  // CLIENT / BILLING BLOCK
  // ─────────────────────────────────────────────

  let y = 36;

  outlinedBox(margin, y, contentWidth, 32);

  setFont(6.8, BLUE, "bold");
  doc.text("BILL TO", margin + 7, y + 8);

  setFont(11.5, NAVY, "bold");
  doc.text(
    cleanText(invoice.owner_name) || "Client",
    margin + 7,
    y + 16
  );

  setFont(6.8, BLUE, "bold");
  doc.text(
    "BILLING PERIOD",
    pageWidth - margin - 7,
    y + 8,
    { align: "right" }
  );

  setFont(8.2, TEXT, "bold");
  doc.text(
    `${formatDate(invoice.period_start)} – ${formatDate(
      invoice.period_end
    )}`,
    pageWidth - margin - 7,
    y + 16,
    { align: "right" }
  );

  setFont(6.8, MUTED);
  doc.text(
    "Finalized invoice for this property",
    pageWidth - margin - 7,
    y + 25,
    { align: "right" }
  );

  y += 40;

  // ─────────────────────────────────────────────
  // PROPERTY + INVOICE NUMBER
  // ─────────────────────────────────────────────

  setFont(6.8, BLUE, "bold");
  doc.text("PROPERTY", margin, y);

  y += 4;

  roundedBox(margin, y, contentWidth, 30, NAVY, 3);

  setFont(11, WHITE, "bold");
  doc.text(
    cleanText(invoice.property_name) || "Property",
    margin + 7,
    y + 10
  );

  setFont(7.2, [207, 222, 234] as const);
  const address = cleanText(invoice.property_address);

  doc.text(
    address || "Property service address",
    margin + 7,
    y + 17
  );

  setFont(6.8, [178, 202, 218] as const);
  doc.text("INVOICE NUMBER", margin + 7, y + 25);

  setFont(8.3, WHITE, "bold");
  doc.text(
    cleanText(invoice.invoice_number) || "—",
    pageWidth - margin - 7,
    y + 25,
    { align: "right" }
  );

  y += 38;

  // ─────────────────────────────────────────────
  // CHARGES — COMPACT
  // ─────────────────────────────────────────────

  setFont(6.8, BLUE, "bold");
  doc.text("CHARGES", margin, y);

  y += 4;

  const chargeRows: Array<[string, number, boolean]> = [
    ["Cleaning services", cleaning, true],
  ];

  if (expenses > 0) {
    chargeRows.push([
      "Approved property expenses",
      expenses,
      true,
    ]);
  }

  if (hstAmount > 0) {
    chargeRows.push(["HST (13%)", hstAmount, false]);
  }

  // Compact table: 14mm header + 9mm per row + 16mm total.
  const tableHeight = 14 + chargeRows.length * 9 + 16;

  outlinedBox(margin, y, contentWidth, tableHeight);

  doc.setFillColor(...SOFT_BLUE);
  doc.roundedRect(
    margin + 0.6,
    y + 0.6,
    contentWidth - 1.2,
    12,
    2.5,
    2.5,
    "F"
  );

  setFont(6.8, MUTED, "bold");
  doc.text("DESCRIPTION", margin + 7, y + 8);

  doc.text(
    "AMOUNT",
    pageWidth - margin - 7,
    y + 8,
    { align: "right" }
  );

  let rowY = y + 20;

  chargeRows.forEach(([label, amount, primary], index) => {
    setFont(
      primary ? 8.1 : 7.8,
      primary ? TEXT : MUTED
    );

    doc.text(label, margin + 7, rowY);

    setFont(
      primary ? 8.1 : 7.8,
      primary ? NAVY : TEXT,
      "bold"
    );

    doc.text(
      money(amount),
      pageWidth - margin - 7,
      rowY,
      { align: "right" }
    );

    if (index < chargeRows.length - 1) {
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.25);
      doc.line(
        margin + 7,
        rowY + 4,
        pageWidth - margin - 7,
        rowY + 4
      );
    }

    rowY += 9;
  });

  const totalStripY = y + tableHeight - 15;

  doc.setFillColor(...SOFT_TEAL);
  doc.roundedRect(
    margin + 0.6,
    totalStripY,
    contentWidth - 1.2,
    14,
    2.5,
    2.5,
    "F"
  );

  setFont(6.8, TEAL, "bold");
  doc.text("TOTAL DUE", margin + 7, totalStripY + 9);

  setFont(12, NAVY, "bold");
  doc.text(
    money(totalDue),
    pageWidth - margin - 7,
    totalStripY + 9,
    { align: "right" }
  );

  y += tableHeight + 10;

  // ─────────────────────────────────────────────
  // PAYMENT SUMMARY — NO GIANT EMPTY AREA
  // ─────────────────────────────────────────────

  setFont(6.8, BLUE, "bold");
  doc.text("PAYMENT SUMMARY", margin, y);

  y += 4;

  roundedBox(margin, y, contentWidth, 43, NAVY, 4);

  setFont(7.2, [209, 225, 237] as const);
  doc.text(
    "Finalized amount for this billing period",
    margin + 8,
    y + 9
  );

  setFont(17, WHITE, "bold");
  doc.text(
    money(totalDue),
    pageWidth - margin - 8,
    y + 10,
    { align: "right" }
  );

  doc.setDrawColor(72, 100, 123);
  doc.setLineWidth(0.25);
  doc.line(
    margin + 8,
    y + 16,
    pageWidth - margin - 8,
    y + 16
  );

  const summaryRows: Array<[string, number]> = [
    ["Cleaning services", cleaning],
  ];

  if (expenses > 0) {
    summaryRows.push([
      "Approved property expenses",
      expenses,
    ]);
  }

  if (hstAmount > 0) {
    summaryRows.push(["HST (13%)", hstAmount]);
  }

  let summaryY = y + 25;

  summaryRows.forEach(([label, amount], index) => {
    setFont(7.2, [218, 232, 242] as const);
    doc.text(label, margin + 8, summaryY);

    setFont(7.2, WHITE, "bold");
    doc.text(
      money(amount),
      pageWidth - margin - 8,
      summaryY,
      { align: "right" }
    );

    if (index < summaryRows.length - 1) {
      doc.setDrawColor(68, 96, 119);
      doc.line(
        margin + 8,
        summaryY + 4,
        pageWidth - margin - 8,
        summaryY + 4
      );
    }

    summaryY += 7.5;
  });

  y += 51;

  // ─────────────────────────────────────────────
  // SMALL CLOSING NOTE
  // ─────────────────────────────────────────────

  if (y + 25 < footerY - 5) {
    roundedBox(margin, y, contentWidth, 23, SOFT_TEAL, 3);

    setFont(8, TEAL, "bold");
    doc.text(
      "Thank you for choosing PureSpace Cleaning.",
      margin + 8,
      y + 9
    );

    setFont(7, MUTED);
    doc.text(
      "This invoice reflects the finalized charges for the property and billing period shown above.",
      margin + 8,
      y + 16
    );
  }

  // This invoice is intentionally designed to fit on one page.
  // All sections are compact so there is no artificial blank page.
  drawFooter(1, 1);

  const safePropertyName =
    cleanText(invoice.property_name)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "Property";

  const fileName =
    `PureSpace-Invoice-${safePropertyName}-${invoice.period_start}-${invoice.period_end}.pdf`;

  doc.save(fileName);
}
