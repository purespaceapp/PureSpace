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

const cleanText = (value: unknown) => String(value ?? "").trim();

export async function downloadOfficeInvoice(invoice: OfficeInvoiceData) {
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
  const muted = [235, 242, 247] as const;
  const softBlue = [244, 249, 253] as const;
  const softTeal = [241, 250, 249] as const;
  const border = [218, 227, 233] as const;
  const white = [255, 255, 255] as const;
  const green = [35, 139, 103] as const;

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
  };

  const drawHeader = () => {
    drawAccent();

    // Brand area
    try {
      doc.addImage(logo, "JPEG", margin, 9, 34, 27);
    } catch {
      // Keep the invoice functional even if the logo cannot be loaded.
      doc.setFillColor(...blue);
      doc.circle(margin + 10, 22, 8, "F");
      doc.setFillColor(...teal);
      doc.circle(margin + 20, 22, 8, "F");
    }

    setFont(10, navy, "bold");
    doc.text("PURESPACE CLEANING", margin + 40, 16);

    setFont(7.5, grayText);
    doc.text("Professional Cleaning Services", margin + 40, 21);

    // Invoice title
    setFont(18, navy, "bold");
    doc.text("CONSOLIDATED", pageWidth - margin, 15, {
      align: "right",
    });

    setFont(18, teal, "bold");
    doc.text("INVOICE", pageWidth - margin, 23, {
      align: "right",
    });

    setFont(7.5, grayText);
    doc.text(
      `${invoices.length} ${invoices.length === 1 ? "property" : "properties"}`,
      pageWidth - margin,
      29,
      { align: "right" }
    );
  };

  const drawBillingInformation = () => {
    const y = 43;
    const h = 39;

    outlinedBox(margin, y, contentWidth, h, white);

    // Small labels
    setFont(7, blue, "bold");
    doc.text("BILL TO", margin + 7, y + 9);
    doc.text(
      "BILLING PERIOD",
      pageWidth - margin - 7,
      y + 9,
      { align: "right" }
    );

    setFont(13, navy, "bold");
    doc.text(
      cleanText(invoice.ownerName) || "Client",
      margin + 7,
      y + 18
    );

    setFont(10, darkText, "bold");
    doc.text(
      `${formatDate(invoice.periodStart)} – ${formatDate(invoice.periodEnd)}`,
      pageWidth - margin - 7,
      y + 18,
      { align: "right" }
    );

    // Divider
    doc.setDrawColor(...border);
    doc.setLineWidth(0.25);
    doc.line(
      margin + 7,
      y + 23,
      pageWidth - margin - 7,
      y + 23
    );

    setFont(7.5, grayText);
    doc.text(
      "Consolidated statement covering all property invoices for this billing period.",
      margin + 7,
      y + 31
    );

    setFont(7.5, teal, "bold");
    doc.text(
      "Payment summary included below",
      pageWidth - margin - 7,
      y + 31,
      { align: "right" }
    );
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

  // IMPORTANT:
  // Use the already-finalized property invoice totals.
  // Never add extras again here.
  const grandTotal = invoices.reduce(
    (sum, property) => sum + Number(property.total_due || 0),
    0
  );

  const hstAmount = invoices.reduce((sum, property) => {
    if (!property.hst_enabled) {
      return sum;
    }

    const subtotal =
      Number(property.total_cleaning || 0) +
      Number(property.total_expenses || 0);

    const finalizedTotal = Number(property.total_due || 0);

    return sum + Math.max(0, finalizedTotal - subtotal);
  }, 0);

  const subtotal = totalCleaning + totalExpenses;

  const drawPropertySection = (
    property: OfficeInvoiceProperty,
    index: number,
    totalProperties: number
  ) => {
    const topY = index === 0 ? 94 : 34;

    if (index > 0) {
      doc.addPage();
      drawAccent();
      drawHeader();
    }

    let y = index === 0 ? 94 : 94;

    // Section number
    setFont(7, blue, "bold");
    doc.text(
      `PROPERTY ${index + 1} OF ${totalProperties}`,
      margin,
      y
    );

    y += 5;

    // Property header
    roundedBox(margin, y, contentWidth, 17, navy, 3);

    setFont(10.5, white, "bold");
    doc.text(
      cleanText(property.property_name) || "Property",
      margin + 7,
      y + 7
    );

    setFont(7.2, [196, 215, 229] as const);
    doc.text(
      `Invoice #${cleanText(property.invoice_number) || "—"}`,
      pageWidth - margin - 7,
      y + 7,
      { align: "right" }
    );

    setFont(7.5, [220, 235, 245] as const);
    const address = cleanText(property.property_address);

    if (address) {
      doc.text(address, margin + 7, y + 12.5);
    } else {
      doc.text("Property service address", margin + 7, y + 12.5);
    }

    y += 23;

    // Charges card
    const cleaning = Number(property.total_cleaning || 0);
    const expenses = Number(property.total_expenses || 0);
    const propertySubtotal = cleaning + expenses;
    const propertyTotal = Number(property.total_due || 0);
    const propertyHst = property.hst_enabled
      ? Math.max(0, propertyTotal - propertySubtotal)
      : 0;

    const chargeRows = [
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
      18 + chargeRows.length * 10 + (propertyHst > 0 ? 10 : 0) + 16;

    outlinedBox(margin, y, contentWidth, tableHeight, white);

    // Table heading
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

    let rowY = y + 21;

    chargeRows.forEach((row, rowIndex) => {
      setFont(9, darkText);
      doc.text(row.label, margin + 7, rowY);

      setFont(9, navy, "bold");
      doc.text(
        formatMoney(row.amount),
        pageWidth - margin - 7,
        rowY,
        { align: "right" }
      );

      if (rowIndex < chargeRows.length - 1) {
        doc.setDrawColor(...border);
        doc.setLineWidth(0.25);
        doc.line(
          margin + 7,
          rowY + 4,
          pageWidth - margin - 7,
          rowY + 4
        );
      }

      rowY += 10;
    });

    // HST line only when the finalized invoice actually contains HST.
    if (propertyHst > 0) {
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
        formatMoney(propertyHst),
        pageWidth - margin - 7,
        rowY + 1,
        { align: "right" }
      );

      rowY += 10;
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
      "PROPERTY TOTAL",
      margin + 7,
      y + tableHeight - 7
    );

    setFont(13, navy, "bold");
    doc.text(
      formatMoney(propertyTotal),
      pageWidth - margin - 7,
      y + tableHeight - 7,
      { align: "right" }
    );

    y += tableHeight + 9;

    // Small status note
    roundedBox(margin, y, contentWidth, 13, softBlue, 2.5);

    setFont(7.2, grayText);
    doc.text(
      "Finalized property invoice • Charges shown are already included in the property total.",
      margin + 7,
      y + 8
    );

    return y + 22;
  };

  const drawFinalSummary = () => {
    let y = 34;

    doc.addPage();
    drawAccent();
    drawHeader();

    y = 94;

    setFont(7, blue, "bold");
    doc.text("CONSOLIDATED PAYMENT SUMMARY", margin, y);

    y += 6;

    roundedBox(margin, y, contentWidth, 75, navy, 4);

    setFont(10, white, "bold");
    doc.text("Amount due for this billing period", margin + 9, y + 12);

    setFont(24, white, "bold");
    doc.text(
      formatMoney(grandTotal),
      pageWidth - margin - 9,
      y + 13,
      { align: "right" }
    );

    doc.setDrawColor(83, 112, 135);
    doc.setLineWidth(0.35);
    doc.line(
      margin + 9,
      y + 21,
      pageWidth - margin - 9,
      y + 21
    );

    const summaryRows = [
      ["Cleaning services", totalCleaning],
      ["Approved property expenses", totalExpenses],
      ...(hstAmount > 0 ? [["HST (13%)", hstAmount]] : []),
    ];

    let rowY = y + 32;

    summaryRows.forEach(([label, amount], index) => {
      setFont(8.5, [218, 232, 242] as const);
      doc.text(String(label), margin + 9, rowY);

      setFont(8.5, white, "bold");
      doc.text(
        formatMoney(amount),
        pageWidth - margin - 9,
        rowY,
        { align: "right" }
      );

      if (index < summaryRows.length - 1) {
        doc.setDrawColor(68, 96, 119);
        doc.setLineWidth(0.25);
        doc.line(
          margin + 9,
          rowY + 4,
          pageWidth - margin - 9,
          rowY + 4
        );
      }

      rowY += 10;
    });

    y += 88;

    // Property count / references
    outlinedBox(margin, y, contentWidth, 20, white);

    setFont(7, grayText, "bold");
    doc.text("INCLUDED PROPERTY INVOICES", margin + 7, y + 7);

    setFont(8.5, navy, "bold");
    doc.text(
      `${invoices.length} ${invoices.length === 1 ? "property invoice" : "property invoices"}`,
      margin + 7,
      y + 14
    );

    setFont(7.5, grayText);
    doc.text(
      invoices.map((item) => `#${item.invoice_number}`).join("   "),
      pageWidth - margin - 7,
      y + 12,
      { align: "right" }
    );

    y += 29;

    // Professional closing card
    roundedBox(margin, y, contentWidth, 37, softTeal, 3);

    setFont(9, teal, "bold");
    doc.text("Thank you for choosing PureSpace Cleaning.", margin + 8, y + 10);

    setFont(7.8, grayText);
    const closingLines = doc.splitTextToSize(
      "This consolidated invoice combines the finalized invoices for the properties listed above. Please retain this document for your records.",
      contentWidth - 16
    );

    doc.text(closingLines, margin + 8, y + 18);

    setFont(7.5, navy, "bold");
    doc.text(
      "cleaningpurespace26@gmail.com",
      margin + 8,
      y + 31
    );
  };

  // No invoices: still generate a clean, usable document.
  if (invoices.length === 0) {
    drawHeader();
    drawBillingInformation();

    roundedBox(
      margin,
      94,
      contentWidth,
      42,
      softBlue,
      4
    );

    setFont(11, navy, "bold");
    doc.text(
      "No finalized property invoices",
      pageWidth / 2,
      111,
      { align: "center" }
    );

    setFont(8.5, grayText);
    doc.text(
      "There are no finalized charges for this billing period.",
      pageWidth / 2,
      121,
      { align: "center" }
    );

    drawFooter();
  } else {
    // First page
    drawHeader();
    drawBillingInformation();

    // Each property gets a complete section on its own page.
    // This intentionally avoids splitting a property between pages.
    invoices.forEach((property, index) => {
      if (index === 0) {
        drawPropertySection(property, index, invoices.length);
      } else {
        drawPropertySection(property, index, invoices.length);
      }
    });

    // Summary gets its own clean final page.
    drawFinalSummary();

    // Footer every page
    const pageCount = doc.getNumberOfPages();

    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      drawFooter();

      setFont(7, grayText);
      doc.text(
        `Page ${page} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 4.5,
        { align: "center" }
      );
    }
  }

  const safeOwnerName =
    cleanText(invoice.ownerName)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "Owner";

  const fileName =
    `PureSpace-Consolidated-Invoice-${safeOwnerName}-${invoice.periodStart}-${invoice.periodEnd}.pdf`;

  doc.save(fileName);
}
