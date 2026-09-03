import jsPDF from "jspdf";

async function getLogo() {
  const response = await fetch("/images/logo.jpg");
  const blob = await response.blob();

  return await new Promise<string>((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
    };

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
};

type OfficeInvoiceData = {
  ownerName: string;
  periodStart: string;
  periodEnd: string;
  invoices: OfficeInvoiceProperty[];
};

export async function downloadOfficeInvoice(
  data: OfficeInvoiceData
) {
  const logo = await getLogo();

  const doc = new jsPDF("p", "mm", "a4");

  const formatMoney = (amount: number) =>
    `$${Number(amount || 0).toFixed(2)}`;

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  const totalCleaning = data.invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.total_cleaning || 0),
    0
  );

  const totalExpenses = data.invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.total_expenses || 0),
    0
  );

  const totalDue = data.invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.total_due || 0),
    0
  );
  const HST_RATE = 0.13;
  const hstAmount = totalDue * HST_RATE;
  const grandTotal = totalDue + hstAmount;
  // Background
  doc.setFillColor(250, 251, 253);
  doc.rect(0, 0, 210, 297, "F");

  // Header
  doc.setFillColor(46, 123, 190);
  doc.rect(0, 0, 210, 40, "F");

  doc.addImage(
    logo,
    "JPEG",
    160,
    6,
    34,
    28
  );

  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);

  doc.text(
    "PURESPACE CLEANING",
    20,
    18
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  doc.text(
    "Consolidated Invoice",
    20,
    28
  );

  // Owner / period information
  doc.setTextColor(40);
  doc.setDrawColor(220);

  doc.line(
    20,
    48,
    190,
    48
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.text(
    "OWNER",
    20,
    60
  );

  doc.text(
    "BILLING PERIOD",
    120,
    60
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  doc.text(
    data.ownerName,
    20,
    68
  );

  doc.text(
    `${formatDate(data.periodStart)} – ${formatDate(data.periodEnd)}`,
    120,
    68
  );

  doc.line(
    20,
    78,
    190,
    78
  );

  // Table header
  doc.setFillColor(235, 244, 255);

  doc.roundedRect(
    20,
    86,
    170,
    12,
    2,
    2,
    "F"
  );

  doc.setTextColor(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text(
    "PROPERTY",
    25,
    94
  );

  doc.text(
    "CLEANING",
    105,
    94
  );

  doc.text(
    "EXPENSES",
    140,
    94
  );

  doc.text(
    "TOTAL",
    174,
    94
  );

  let y = 109;

  // Property rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  data.invoices.forEach((invoice) => {
    const propertyName = invoice.property_name || "Property";

    doc.setTextColor(40);

    const propertyLines = doc.splitTextToSize(
      propertyName,
      72
    );

    doc.text(
      propertyLines,
      25,
      y
    );

    if (invoice.property_address) {
      doc.setTextColor(110);
      doc.setFontSize(7.5);

      const addressLines = doc.splitTextToSize(
        invoice.property_address,
        72
      );

      doc.text(
        addressLines,
        25,
        y + propertyLines.length * 4
      );
    }

    doc.setTextColor(40);
    doc.setFontSize(9);

    doc.text(
      formatMoney(invoice.total_cleaning),
      105,
      y
    );

    doc.text(
      formatMoney(invoice.total_expenses),
      140,
      y
    );

    doc.setFont("helvetica", "bold");

    doc.text(
      formatMoney(invoice.total_due),
      174,
      y
    );

    doc.setFont("helvetica", "normal");

    const rowHeight = Math.max(
      16,
      propertyLines.length * 4 + 10
    );

    doc.setDrawColor(225);

    doc.line(
      20,
      y + rowHeight - 5,
      190,
      y + rowHeight - 5
    );

    y += rowHeight;
  });

    // Summary
  y += 8;

  doc.setFillColor(46, 123, 190);

  doc.roundedRect(
    20,
    y,
    170,
    54,
    3,
    3,
    "F"
  );

  doc.setTextColor(255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(
    "Cleaning",
    30,
    y + 11
  );

  doc.text(
    "Expenses",
    30,
    y + 20
  );

  doc.text(
    "Subtotal",
    30,
    y + 29
  );

  doc.text(
    "HST (13%)",
    30,
    y + 38
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);

  doc.text(
    "TOTAL DUE",
    30,
    y + 48
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(
    formatMoney(totalCleaning),
    155,
    y + 11,
    { align: "right" }
  );

  doc.text(
    formatMoney(totalExpenses),
    155,
    y + 20,
    { align: "right" }
  );

  doc.text(
    formatMoney(totalDue),
    155,
    y + 29,
    { align: "right" }
  );

  doc.text(
    formatMoney(hstAmount),
    155,
    y + 38,
    { align: "right" }
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);

  doc.text(
    formatMoney(grandTotal),
    180,
    y + 48,
    { align: "right" }
  );
  // Footer
  doc.setDrawColor(220);

  doc.line(
    20,
    282,
    190,
    282
  );

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.setFont("helvetica", "normal");

  doc.text(
    "PURESPACE CLEANING",
    20,
    288
  );

  doc.text(
    "Toronto, Ontario",
    20,
    293
  );

  doc.text(
    "financepurespacecleaning@gmail.com",
    100,
    288
  );

  doc.text(
    "Thank you for choosing PureSpace Cleaning.",
    100,
    293
  );

  doc.save(
    `Invoice-${data.ownerName}-${data.periodStart}-${data.periodEnd}.pdf`
  );
}