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

type OfficeInvoiceItem = {
  item_type?: string | null;
  item_date?: string | null;
  description?: string | null;
  quantity?: number | null;
  unit_price?: number | null;
  amount?: number | null;
};

type OfficeInvoiceProperty = {
  property_name: string;
  property_address?: string | null;
  invoice_number: string;
  total_cleaning: number;
  total_expenses: number;
  total_due: number;
  hst_enabled?: boolean;
  items?: OfficeInvoiceItem[];
};

type OfficeInvoiceData = {
  ownerName: string;
  periodStart: string;
  periodEnd: string;
  invoices: OfficeInvoiceProperty[];
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

const formatShortDate = (date?: string | null) => {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const cleanText = (value: unknown) => String(value ?? "").trim();

export async function downloadOfficeInvoice(invoice: OfficeInvoiceData) {
  const logo = await getLogo();
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  const navy = [31, 48, 71] as const;
  const lightBlue = [239, 244, 248] as const;
  const softGray = [246, 247, 249] as const;
  const border = [220, 225, 230] as const;
  const darkText = [38, 43, 48] as const;
  const grayText = [105, 112, 120] as const;
  const white = [255, 255, 255] as const;
  const green = [48, 122, 82] as const;

  const setFont = (
    size: number,
    color: readonly [number, number, number] = darkText,
    style: "normal" | "bold" = "normal"
  ) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const drawRoundedBox = (
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

  const drawBorderedBox = (
    x: number,
    y: number,
    width: number,
    height: number,
    fill: readonly [number, number, number] = white
  ) => {
    doc.setFillColor(...fill);
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, width, height, 3, 3, "FD");
  };

  const drawPageTop = () => {
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageWidth, 3, "F");
  };

  const drawFooter = () => {
    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

    setFont(8, grayText);
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
  };

  const ensureSpace = (requiredHeight: number, currentY: number) => {
    if (currentY + requiredHeight > pageHeight - 24) {
      drawFooter();
      doc.addPage();
      drawPageTop();
      return 25;
    }

    return currentY;
  };

  const invoices = Array.isArray(invoice.invoices)
    ? invoice.invoices
    : [];

  const totalCleaning = invoices.reduce(
    (sum, property) => sum + Number(property.total_cleaning || 0),
    0
  );

  const totalExpenses = invoices.reduce(
    (sum, property) => sum + Number(property.total_expenses || 0),
    0
  );

  /*
   * IMPORTANT:
   * Use the finalized property invoice totals.
   * Extras are displayed as invoice detail when available,
   * but are never added again here.
   */
  const grandTotal = invoices.reduce(
    (sum, property) => sum + Number(property.total_due || 0),
    0
  );

  const hstAmount = invoices.reduce((sum, property) => {
    if (!property.hst_enabled) {
      return sum;
    }

    const propertySubtotal =
      Number(property.total_cleaning || 0) +
      Number(property.total_expenses || 0);

    const propertyTotal = Number(property.total_due || 0);

    return sum + Math.max(0, propertyTotal - propertySubtotal);
  }, 0);

  drawPageTop();

  let y = 14;

  try {
    doc.addImage(logo, "JPEG", margin, y, 30, 18);
  } catch {
    // Continue without logo if it cannot be loaded.
  }

  setFont(15, navy, "bold");
  doc.text("PURESPACE CLEANING", margin + 36, y + 8);

  setFont(8.5, grayText);
  doc.text(
    "Professional Cleaning Services",
    margin + 36,
    y + 14
  );

  setFont(19, navy, "bold");
  doc.text(
    "CONSOLIDATED INVOICE",
    pageWidth - margin,
    y + 7,
    { align: "right" }
  );

  setFont(8.5, grayText);
  doc.text(
    `${invoices.length} ${invoices.length === 1 ? "property" : "properties"}`,
    pageWidth - margin,
    y + 14,
    { align: "right" }
  );

  y = 42;

  drawBorderedBox(margin, y, contentWidth, 34, white);

  setFont(7.5, grayText, "bold");
  doc.text("BILL TO", margin + 7, y + 8);

  setFont(13, darkText, "bold");
  doc.text(
    cleanText(invoice.ownerName) || "Client",
    margin + 7,
    y + 16
  );

  const rightX = pageWidth - margin - 7;

  setFont(7.5, grayText, "bold");
  doc.text("BILLING PERIOD", rightX, y + 8, { align: "right" });

  setFont(10.5, darkText, "bold");
  doc.text(
    `${formatDate(invoice.periodStart)} – ${formatDate(invoice.periodEnd)}`,
    rightX,
    y + 16,
    { align: "right" }
  );

  setFont(8, grayText);
  doc.text(
    "Consolidated statement for all properties",
    rightX,
    y + 24,
    { align: "right" }
  );

  y += 44;

  invoices.forEach((property, propertyIndex) => {
    const propertyItems = Array.isArray(property.items)
      ? property.items
      : [];

    const estimatedHeight =
      54 + Math.min(propertyItems.length, 6) * 7 + 28;

    y = ensureSpace(estimatedHeight, y);

    drawRoundedBox(margin, y, contentWidth, 13, navy, 3);

    setFont(9.5, white, "bold");
    doc.text(
      cleanText(property.property_name) ||
        `Property ${propertyIndex + 1}`,
      margin + 7,
      y + 8.5
    );

    setFont(8, white);
    doc.text(
      `Invoice #${property.invoice_number}`,
      pageWidth - margin - 7,
      y + 8.5,
      { align: "right" }
    );

    y += 17;

    setFont(8.5, grayText);
    doc.text(
      cleanText(property.property_address) || "Address not provided",
      margin + 2,
      y + 3
    );

    y += 10;

    const tableX = margin;
    const tableWidth = contentWidth;
    const colDescription = tableX + 7;
    const colAmount = tableX + tableWidth - 7;

    doc.setFillColor(...softGray);
    doc.roundedRect(
      tableX,
      y,
      tableWidth,
      9,
      2,
      2,
      "F"
    );

    setFont(7.5, grayText, "bold");
    doc.text("DESCRIPTION", colDescription, y + 6);
    doc.text("AMOUNT", colAmount, y + 6, { align: "right" });

    y += 9;

    setFont(9, darkText);
    doc.text("Cleaning Services", colDescription, y + 7);

    setFont(9, darkText, "bold");
    doc.text(
      formatMoney(property.total_cleaning),
      colAmount,
      y + 7,
      { align: "right" }
    );

    y += 12;

    const extras = propertyItems.filter(
      (item) => String(item.item_type).toLowerCase() === "extra"
    );

    const expenses = propertyItems.filter(
      (item) => String(item.item_type).toLowerCase() === "expense"
    );

    if (extras.length > 0) {
      extras.forEach((item) => {
        y = ensureSpace(9, y);

        const quantity = Number(item.quantity ?? 1);
        const description =
          cleanText(item.description) || "Extra Service";

        const label =
          quantity > 1
            ? `${description} × ${quantity}`
            : description;

        setFont(8.5, grayText);
        doc.text(
          `Extra · ${label}`,
          colDescription + 4,
          y + 5
        );

        doc.text(
          formatMoney(item.amount),
          colAmount,
          y + 5,
          { align: "right" }
        );

        y += 9;
      });
    }

    if (expenses.length > 0) {
      expenses.forEach((item) => {
        y = ensureSpace(9, y);

        const description =
          cleanText(item.description) || "Property Expense";

        const date = formatShortDate(item.item_date);

        const label = date
          ? `Expense · ${description} · ${date}`
          : `Expense · ${description}`;

        setFont(8.5, grayText);
        doc.text(
          label,
          colDescription + 4,
          y + 5
        );

        doc.text(
          formatMoney(item.amount),
          colAmount,
          y + 5,
          { align: "right" }
        );

        y += 9;
      });
    }

    if (
      expenses.length === 0 &&
      Number(property.total_expenses || 0) > 0
    ) {
      setFont(8.5, grayText);

      doc.text(
        "Property Expenses",
        colDescription,
        y + 7
      );

      doc.text(
        formatMoney(property.total_expenses),
        colAmount,
        y + 7,
        { align: "right" }
      );

      y += 12;
    }

    doc.setDrawColor(...border);
    doc.setLineWidth(0.3);
    doc.line(
      tableX,
      y + 1,
      tableX + tableWidth,
      y + 1
    );

    y += 7;

    drawRoundedBox(
      tableX,
      y,
      tableWidth,
      15,
      lightBlue,
      3
    );

    setFont(8, grayText, "bold");
    doc.text("PROPERTY TOTAL", colDescription, y + 9);

    setFont(12, navy, "bold");
    doc.text(
      formatMoney(property.total_due),
      colAmount,
      y + 9,
      { align: "right" }
    );

    y += 23;

    if (property.hst_enabled) {
      setFont(7.5, green, "bold");
      doc.text(
        "HST applied to this property invoice",
        colDescription,
        y
      );
      y += 7;
    }

    y += 7;
  });

  y = ensureSpace(82, y);

  setFont(11, navy, "bold");
  doc.text("CONSOLIDATED SUMMARY", margin, y);

  y += 7;

  drawBorderedBox(margin, y, contentWidth, 57, white);

  let summaryY = y + 11;

  setFont(9, grayText);
  doc.text("Cleaning Services", margin + 8, summaryY);

  setFont(9, darkText, "bold");
  doc.text(
    formatMoney(totalCleaning),
    pageWidth - margin - 8,
    summaryY,
    { align: "right" }
  );

  summaryY += 11;

  setFont(9, grayText);
  doc.text("Property Expenses", margin + 8, summaryY);

  setFont(9, darkText, "bold");
  doc.text(
    formatMoney(totalExpenses),
    pageWidth - margin - 8,
    summaryY,
    { align: "right" }
  );

  summaryY += 11;

  if (hstAmount > 0) {
    setFont(9, grayText);
    doc.text("HST", margin + 8, summaryY);

    setFont(9, darkText, "bold");
    doc.text(
      formatMoney(hstAmount),
      pageWidth - margin - 8,
      summaryY,
      { align: "right" }
    );

    summaryY += 11;
  }

  doc.setDrawColor(...border);
  doc.setLineWidth(0.4);
  doc.line(
    margin + 8,
    summaryY - 4,
    pageWidth - margin - 8,
    summaryY - 4
  );

  setFont(8.5, grayText, "bold");
  doc.text("TOTAL DUE", margin + 8, summaryY + 7);

  setFont(17, navy, "bold");
  doc.text(
    formatMoney(grandTotal),
    pageWidth - margin - 8,
    summaryY + 8,
    { align: "right" }
  );

  y += 65;

  y = ensureSpace(28, y);

  drawRoundedBox(
    margin,
    y,
    contentWidth,
    23,
    softGray,
    3
  );

  setFont(8, navy, "bold");
  doc.text(
    "INVOICE INFORMATION",
    margin + 7,
    y + 8
  );

  setFont(7.5, grayText);

  const note =
    "This consolidated invoice combines the finalized property invoices for the billing period shown above.";

  const noteLines = doc.splitTextToSize(
    note,
    contentWidth - 14
  );

  doc.text(noteLines, margin + 7, y + 15);

  drawFooter();

  const safeOwnerName =
    cleanText(invoice.ownerName)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "Owner";

  const fileName =
    `PureSpace-Consolidated-Invoice-${safeOwnerName}-${invoice.periodStart}-${invoice.periodEnd}.pdf`;

  doc.save(fileName);
}
