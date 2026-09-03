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
};

export async function downloadHistoricalOwnerInvoice(
  invoice: HistoricalOwnerInvoice
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
    const subtotal =
  Number(invoice.total_cleaning || 0) +
  Number(invoice.total_expenses || 0);

const hstAmount = subtotal * 0.13;
const grandTotal = subtotal + hstAmount;

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
    "Cleaning Invoice",
    20,
    28
  );

  // Invoice information
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
    "PROPERTY",
    20,
    60
  );

  doc.text(
    "INVOICE",
    120,
    60
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  doc.text(
    invoice.property_name,
    20,
    68
  );

  if (invoice.property_address) {
    const addressLines = doc.splitTextToSize(
      invoice.property_address,
      80
    );

    doc.text(
      addressLines,
      20,
      76
    );
  }

  doc.text(
    `Invoice # ${invoice.invoice_number}`,
    120,
    68
  );

  doc.text(
    `${formatDate(invoice.period_start)} – ${formatDate(
      invoice.period_end
    )}`,
    120,
    76
  );

  doc.line(
    20,
    88,
    190,
    88
  );

  // Billing period
  doc.setFillColor(235, 244, 255);

  doc.roundedRect(
    20,
    94,
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
    "BILLING PERIOD",
    25,
    102
  );

  doc.setFont("helvetica", "normal");

  doc.text(
    `${formatDate(invoice.period_start)} – ${formatDate(
      invoice.period_end
    )}`,
    115,
    102
  );

   
  // Charges
  let y = 122;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.text(
    "DESCRIPTION",
    25,
    y
  );

  doc.text(
    "AMOUNT",
    165,
    y
  );

  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(
    "Cleaning Services",
    25,
    y
  );

  doc.text(
    formatMoney(invoice.total_cleaning),
    165,
    y
  );

  y += 10;

  doc.text(
    "Property Expenses",
    25,
    y
  );

  doc.text(
    formatMoney(invoice.total_expenses),
    165,
    y
  );

  y += 8;

  doc.setDrawColor(220);

  doc.line(
    20,
    y,
    190,
    y
  );

  y += 14;
 // Total
doc.setFillColor(46, 123, 190);

doc.roundedRect(
  20,
  y,
  170,
  48,
  3,
  3,
  "F"
);

doc.setTextColor(255);
doc.setFont("helvetica", "normal");
doc.setFontSize(10);

doc.text(
  "Subtotal",
  28,
  y + 11
);

doc.text(
  "HST (13%)",
  28,
  y + 21
);

doc.setFont("helvetica", "bold");
doc.setFontSize(16);

doc.text(
  "TOTAL DUE",
  28,
  y + 38
);

doc.setFont("helvetica", "normal");
doc.setFontSize(10);

doc.text(
  formatMoney(subtotal),
  180,
  y + 11,
  { align: "right" }
);

doc.text(
  formatMoney(hstAmount),
  180,
  y + 21,
  { align: "right" }
);

doc.setFont("helvetica", "bold");
doc.setFontSize(16);

doc.text(
  formatMoney(grandTotal),
  180,
  y + 38,
  { align: "right" }
);

  doc.text(
    formatMoney(invoice.total_expenses),
    155,
    y + 19,
    { align: "right" }
  );

  doc.text(
    formatMoney(subtotal),
    155,
    y + 28,
    { align: "right" }
  );

  doc.text(
    formatMoney(hstAmount),
    155,
    y + 37,
    { align: "right" }
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);

  doc.text(
    formatMoney(grandTotal),
    180,
    y + 44,
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

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);

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
    `Invoice-${invoice.property_name}-${invoice.period_start}-${invoice.period_end}.pdf`
  );
}