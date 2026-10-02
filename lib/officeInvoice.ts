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

type OfficeInvoiceProperty = {
  property_name: string;
  property_address?: string | null;
  invoice_number: string;
  total_cleaning: number;
  total_expenses: number;
  total_due: number;
  hst_enabled?: boolean;
};

type OfficeInvoiceData = {
  ownerName: string;
  periodStart: string;
  periodEnd: string;
  invoices: OfficeInvoiceProperty[];
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

function money(value: unknown) {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue)
    ? `$${numberValue.toFixed(2)}`
    : "$0.00";
}

function formatDate(date: string) {
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
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

export async function downloadOfficeInvoice(
  invoice: OfficeInvoiceData
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

    setFont(17, NAVY, "bold");
    doc.text("CONSOLIDATED", pageWidth - margin, 14, {
      align: "right",
    });

    setFont(17, TEAL, "bold");
    doc.text("INVOICE", pageWidth - margin, 21.5, {
      align: "right",
    });

    setFont(7.2, MUTED);
    doc.text(
      `${invoice.invoices.length} ${
        invoice.invoices.length === 1 ? "property" : "properties"
      }`,
      pageWidth - margin,
      28,
      { align: "right" }
    );
  };

  const drawClientBlock = (startY: number) => {
    const height = 32;

    outlinedBox(margin, startY, contentWidth, height);

    setFont(6.8, BLUE, "bold");
    doc.text("BILL TO", margin + 7, startY + 8);

    setFont(11.5, NAVY, "bold");
    doc.text(
      cleanText(invoice.ownerName) || "Client",
      margin + 7,
      startY + 16
    );

    setFont(6.8, BLUE, "bold");
    doc.text(
      "BILLING PERIOD",
      pageWidth - margin - 7,
      startY + 8,
      { align: "right" }
    );

    setFont(8.2, TEXT, "bold");
    doc.text(
      `${formatDate(invoice.periodStart)} – ${formatDate(
        invoice.periodEnd
      )}`,
      pageWidth - margin - 7,
      startY + 16,
      { align: "right" }
    );

    setFont(6.8, MUTED);
    doc.text(
      "One consolidated statement for all property invoices",
      pageWidth - margin - 7,
      startY + 25,
      { align: "right" }
    );

    return startY + height;
  };

  const propertyCardHeight = (property: OfficeInvoiceProperty) => {
    const expenses = Number(property.total_expenses || 0);
    return expenses > 0 ? 54 : 45;
  };

  const drawPropertyCard = (
    property: OfficeInvoiceProperty,
    startY: number,
    index: number
  ) => {
    const cleaning = Number(property.total_cleaning || 0);
    const expenses = Number(property.total_expenses || 0);
    const totalDue = Number(property.total_due || 0);
    const subtotal = cleaning + expenses;
    const hstAmount = property.hst_enabled
      ? Math.max(0, totalDue - subtotal)
      : 0;

    const height = propertyCardHeight(property);

    outlinedBox(margin, startY, contentWidth, height);

    // Property heading
    roundedBox(
      margin + 0.8,
      startY + 0.8,
      contentWidth - 1.6,
      15,
      NAVY,
      2.5
    );

    setFont(8.8, WHITE, "bold");
    doc.text(
      `${index + 1}. ${cleanText(property.property_name) || "Property"}`,
      margin + 7,
      startY + 7
    );

    setFont(6.8, [207, 222, 234] as const);
    doc.text(
      `Invoice #${cleanText(property.invoice_number) || "—"}`,
      pageWidth - margin - 7,
      startY + 7,
      { align: "right" }
    );

    const address = cleanText(property.property_address);

    setFont(6.9, MUTED);
    doc.text(
      address || "Property service address",
      margin + 7,
      startY + 21
    );

    // Compact charge rows
    let rowY = startY + 30;

    setFont(7.7, TEXT);
    doc.text("Cleaning services", margin + 7, rowY);

    setFont(7.7, NAVY, "bold");
    doc.text(
      money(cleaning),
      pageWidth - margin - 7,
      rowY,
      { align: "right" }
    );

    rowY += 8;

    if (expenses > 0) {
      setFont(7.7, TEXT);
      doc.text(
        "Approved property expenses",
        margin + 7,
        rowY
      );

      setFont(7.7, NAVY, "bold");
      doc.text(
        money(expenses),
        pageWidth - margin - 7,
        rowY,
        { align: "right" }
      );

      rowY += 8;
    }

    if (hstAmount > 0) {
      setFont(7.7, MUTED);
      doc.text("HST (13%)", margin + 7, rowY);

      setFont(7.7, TEXT, "bold");
      doc.text(
        money(hstAmount),
        pageWidth - margin - 7,
        rowY,
        { align: "right" }
      );

      rowY += 8;
    }

    // Total strip
    const totalStripY = startY + height - 13;

    doc.setFillColor(...SOFT_TEAL);
    doc.roundedRect(
      margin + 0.8,
      totalStripY,
      contentWidth - 1.6,
      12,
      2.5,
      2.5,
      "F"
    );

    setFont(6.8, TEAL, "bold");
    doc.text(
      "PROPERTY TOTAL",
      margin + 7,
      totalStripY + 7.5
    );

    setFont(10.5, NAVY, "bold");
    doc.text(
      money(totalDue),
      pageWidth - margin - 7,
      totalStripY + 7.5,
      { align: "right" }
    );

    return startY + height;
  };

  const totals = invoice.invoices.reduce(
    (sum, property) => {
      sum.cleaning += Number(property.total_cleaning || 0);
      sum.expenses += Number(property.total_expenses || 0);
      sum.due += Number(property.total_due || 0);
      return sum;
    },
    { cleaning: 0, expenses: 0, due: 0 }
  );

  const allSubtotal = totals.cleaning + totals.expenses;
  const allHst = Math.max(0, totals.due - allSubtotal);

  // Build page content into pages while avoiding forced blank space.
  const propertyGroups: OfficeInvoiceProperty[][] = [];
  let currentGroup: OfficeInvoiceProperty[] = [];
  let currentHeight = 0;

  const maxPropertiesArea = 188;

  for (const property of invoice.invoices) {
    const cardHeight = propertyCardHeight(property);

    if (
      currentGroup.length > 0 &&
      currentHeight + cardHeight + 5 > maxPropertiesArea
    ) {
      propertyGroups.push(currentGroup);
      currentGroup = [];
      currentHeight = 0;
    }

    currentGroup.push(property);
    currentHeight += cardHeight + 5;
  }

  if (currentGroup.length > 0) {
    propertyGroups.push(currentGroup);
  }

  if (propertyGroups.length === 0) {
    propertyGroups.push([]);
  }

  // We reserve one final summary page only when the properties cannot
  // reasonably share space with the summary.
  const totalPages = propertyGroups.length;

  propertyGroups.forEach((group, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage();
    }

    drawHeader();

    let y = 35;

    if (pageIndex === 0) {
      y = drawClientBlock(y) + 10;
    }

    setFont(6.8, BLUE, "bold");
    doc.text(
      pageIndex === 0
        ? "PROPERTY INVOICES"
        : "PROPERTY INVOICES — CONTINUED",
      margin,
      y
    );

    y += 4;

    group.forEach((property, index) => {
      const globalIndex =
        propertyGroups
          .slice(0, pageIndex)
          .reduce((sum, items) => sum + items.length, 0) +
        index;

      y = drawPropertyCard(property, y, globalIndex) + 5;
    });

    // On the last page, place the consolidated summary directly below
    // the property cards when there is room. Otherwise it gets its own page.
    if (pageIndex === propertyGroups.length - 1) {
      const summaryHeight = 48;

      if (y + summaryHeight <= footerY - 10) {
        y += 2;

        setFont(6.8, BLUE, "bold");
        doc.text(
          "CONSOLIDATED PAYMENT SUMMARY",
          margin,
          y
        );

        y += 4;

        roundedBox(
          margin,
          y,
          contentWidth,
          summaryHeight,
          NAVY,
          4
        );

        setFont(7.5, [209, 225, 237] as const);
        doc.text(
          "Amount due for this billing period",
          margin + 8,
          y + 10
        );

        setFont(17, WHITE, "bold");
        doc.text(
          money(totals.due),
          pageWidth - margin - 8,
          y + 11,
          { align: "right" }
        );

        doc.setDrawColor(72, 100, 123);
        doc.setLineWidth(0.25);
        doc.line(
          margin + 8,
          y + 17,
          pageWidth - margin - 8,
          y + 17
        );

        const summaryRows: Array<[string, number]> = [
          ["Cleaning services", totals.cleaning],
          ["Approved property expenses", totals.expenses],
        ];

        if (allHst > 0) {
          summaryRows.push(["HST (13%)", allHst]);
        }

        let summaryY = y + 26;

        summaryRows.forEach(([label, amount], rowIndex) => {
          setFont(7.4, [218, 232, 242] as const);
          doc.text(label, margin + 8, summaryY);

          setFont(7.4, WHITE, "bold");
          doc.text(
            money(amount),
            pageWidth - margin - 8,
            summaryY,
            { align: "right" }
          );

          if (rowIndex < summaryRows.length - 1) {
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
      } else {
        // Rare case: move summary to a new page rather than leaving
        // an awkward oversized gap.
        doc.addPage();
        drawHeader();

        let summaryY = 42;

        setFont(6.8, BLUE, "bold");
        doc.text(
          "CONSOLIDATED PAYMENT SUMMARY",
          margin,
          summaryY
        );

        summaryY += 5;

        roundedBox(
          margin,
          summaryY,
          contentWidth,
          65,
          NAVY,
          4
        );

        setFont(7.5, [209, 225, 237] as const);
        doc.text(
          "Amount due for this billing period",
          margin + 8,
          summaryY + 12
        );

        setFont(20, WHITE, "bold");
        doc.text(
          money(totals.due),
          pageWidth - margin - 8,
          summaryY + 13,
          { align: "right" }
        );

        doc.setDrawColor(72, 100, 123);
        doc.line(
          margin + 8,
          summaryY + 21,
          pageWidth - margin - 8,
          summaryY + 21
        );

        const rows: Array<[string, number]> = [
          ["Cleaning services", totals.cleaning],
          ["Approved property expenses", totals.expenses],
        ];

        if (allHst > 0) {
          rows.push(["HST (13%)", allHst]);
        }

        let rowY = summaryY + 32;

        rows.forEach(([label, amount]) => {
          setFont(8, [218, 232, 242] as const);
          doc.text(label, margin + 8, rowY);

          setFont(8, WHITE, "bold");
          doc.text(
            money(amount),
            pageWidth - margin - 8,
            rowY,
            { align: "right" }
          );

          rowY += 10;
        });

        summaryY += 76;

        roundedBox(
          margin,
          summaryY,
          contentWidth,
          27,
          SOFT_TEAL,
          3
        );

        setFont(8.5, TEAL, "bold");
        doc.text(
          "Thank you for choosing PureSpace Cleaning.",
          margin + 8,
          summaryY + 10
        );

        setFont(7.2, MUTED);
        doc.text(
          "This statement combines the finalized invoices for the properties listed above.",
          margin + 8,
          summaryY + 18
        );
      }
    }

    drawFooter(
      pageIndex + 1,
      totalPages
    );
  });

  // jsPDF cannot know the final page count until all pages exist.
  // Update footer page counts now that the document is complete.
  const finalPageCount = doc.getNumberOfPages();

  for (let page = 1; page <= finalPageCount; page++) {
    doc.setPage(page);

    // Cover the previous page-count text only.
    doc.setFillColor(...WHITE);
    doc.rect(
      pageWidth / 2 - 12,
      footerY + 3,
      24,
      7,
      "F"
    );

    setFont(6.8, MUTED);
    doc.text(
      `Page ${page} of ${finalPageCount}`,
      pageWidth / 2,
      footerY + 7,
      { align: "center" }
    );
  }

  const safeOwnerName =
    cleanText(invoice.ownerName)
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "Owner";

  const fileName =
    `PureSpace-Consolidated-Invoice-${safeOwnerName}-${invoice.periodStart}-${invoice.periodEnd}.pdf`;

  doc.save(fileName);
}
