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
export async function downloadInvoice(
  employee: any,
  jobs: any[],
  properties: any[],
  grandTotal: number,
  approvedReceipts: any[],
  billingPeriod: {
    start: string;
    end: string;
    label: string;
  }
) {
  const logo = await getLogo();

  const doc = new jsPDF("p", "mm", "a4");

  // ===========================
  // Fondo
  // ===========================

  doc.setFillColor(250, 251, 253);
  doc.rect(0, 0, 210, 297, "F");

  // ===========================
  // Header Azul
  // ===========================

  doc.setFillColor(46,123,190);
  doc.rect(0,0,210,40,"F");

  // ===========================
  // Logo
  // ===========================

  doc.addImage(
  logo,
  "JPEG",
  160,
  6,
  34,
  28
);

  // ===========================
// Empresa
// ===========================

doc.setTextColor(255,255,255);

doc.setFont("helvetica","bold");
doc.setFontSize(22);

doc.text(
  "PURESPACE CLEANING",
  20,
  18
);

doc.setFont("helvetica","normal");
doc.setFontSize(12);

doc.text(
  "Payroll Statement",
  20,
  27
);

doc.setFontSize(9);

doc.text(
  "Professional Cleaning Services",
  20,
  34
);
  // ===========================
  // Información Invoice
  // ===========================
doc.setTextColor(40);

doc.setDrawColor(225);
doc.line(20,48,190,48);

doc.setFont("helvetica","bold");
doc.setFontSize(11);

doc.text("EMPLOYEE",20,58);
doc.text("PAYROLL",120,58);

doc.setFont("helvetica","normal");

doc.text(
  employee?.name || "Unknown Cleaner",
  20,
  66
);

doc.text("Period:",120,66);

doc.text(
billingPeriod.label,
145,
66
);

doc.text("Invoice:",120,74);
const invoiceNumber =
  `PS-${Date.now()}`;

doc.text(
  invoiceNumber,
  145,
  74
);

doc.text("Generated:",120,82);
doc.text(
  new Date().toLocaleDateString(),
  145,
  82
);

  // ===========================
  // Línea
  // ===========================

  doc.setDrawColor(220);

  doc.line(20,78,190,78);

  // ===========================
  // Encabezados Tabla
  // ===========================

  doc.setFillColor(235,244,255);

doc.roundedRect(
20,
85,
170,
10,
2,
2,
"F"
);
  doc.setFillColor(235,244,255);

  
  doc.setFont("helvetica","bold");

  doc.text("Date",25,92);

  doc.text("Property",60,92);

  doc.text("Amount",170,92);

  let y = 105;

doc.setFont("helvetica", "normal");
const PAGE_BOTTOM = 260;
jobs.forEach((job) => {
if (y > PAGE_BOTTOM) {

  doc.addPage();

  y = 25;

  doc.setFillColor(235,244,255);

  doc.roundedRect(
    20,
    20,
    170,
    10,
    2,
    2,
    "F"
  );

  doc.setFont("helvetica","bold");

  doc.setTextColor(40);

  doc.text("Date",25,27);
  doc.text("Property",60,27);
  doc.text("Amount",170,27);

  y = 40;

}
  doc.setTextColor(40);
doc.setTextColor(120);

doc.text(
  new Date(job.cleaning_date).toLocaleDateString(
    "en-CA",
    {
      month: "short",
      day: "numeric"
    }
  ),
  25,
  y
);

doc.setTextColor(40);

  doc.setFont("helvetica","bold");

const property = properties.find(
  (p: any) => p.id === job.property_id
);

doc.text(
  property?.name || "Unknown Property",
  60,
  y
);

doc.setFont("helvetica","normal");
  const basePay =
    Number(job.cleaner_pay) -
    job.extras.reduce(
      (sum: number, extra: any) => {

        const cleanerExtra =
          extra.extra_id === 1 ? 16 :
          extra.extra_id === 2 ? 18 :
          extra.extra_id === 3 ? 25 :
          extra.extra_id === 4 ? 10 :
          extra.extra_id === 5 ? 15 :
          extra.extra_id === 6 ? 15 :
          extra.extra_id === 7 ? 18 :
          extra.extra_id === 8 ? 18 :
          0;

        return sum + cleanerExtra * extra.quantity;

      },
      0
    );

 doc.setFont("helvetica","bold");

doc.text(
  `$${basePay.toFixed(2)}`,
  170,
  y
);

doc.setFont("helvetica","normal");

  y += 8;

  job.extras.forEach((extra:any)=>{

    const cleanerExtra =
      extra.extra_id === 1 ? 16 :
      extra.extra_id === 2 ? 18 :
      extra.extra_id === 3 ? 25 :
      extra.extra_id === 4 ? 10 :
      extra.extra_id === 5 ? 15 :
      extra.extra_id === 6 ? 15 :
      extra.extra_id === 7 ? 18 :
      extra.extra_id === 8 ? 18 :
      0;

    const name =
      extra.extra_id === 1 ? "Laundry" :
      extra.extra_id === 2 ? "Extra Hour" :
      extra.extra_id === 3 ? "Deep Clean" :
      extra.extra_id === 4 ? "Windows" :
      extra.extra_id === 5 ? "Pet Hair" :
      extra.extra_id === 6 ? "Extra Linen" :
      extra.extra_id === 7 ? "Biohazard" :
      extra.extra_id === 8 ? "Balcony" :
      "Extra";

    doc.setTextColor(110);

    doc.text(
      `${name} x${extra.quantity}`,
      65,
      y
    );

    doc.setTextColor(0,160,70);

    doc.text(
      `+$${cleanerExtra * extra.quantity}`,
      170,
      y
    );

    y += 8;

  });

  y += 6;
  const receiptsForProperty =
  approvedReceipts.filter(
    (receipt: any) =>
      receipt.schedule_id === job.id
  );

receiptsForProperty.forEach((receipt: any) => {

  doc.setTextColor(90);

  doc.setFont("helvetica", "italic");

  doc.text(
    `Receipt - ${new Date(
      receipt.purchase_date
    ).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
    })}`,
    65,
    y
  );

  doc.setTextColor(0, 120, 200);

  doc.text(
    `+$${Number(receipt.amount).toFixed(2)}`,
    170,
    y
  );

  y += 8;

});

y += 4;

});

const totalY = y + 18;

doc.setFillColor(46,123,190);

doc.roundedRect(
  20,
  totalY,
  170,
  20,
  3,
  3,
  "F"
);

  doc.setTextColor(255);

  doc.setFontSize(16);

  doc.setFont("helvetica","bold");

  doc.text(
  "TOTAL",
  28,
  totalY + 13
);

  doc.text(
  `$${grandTotal}`,
  165,
  totalY + 13
);
// ===========================
// Footer
// ===========================

doc.setDrawColor(220);

doc.line(
  20,
  282,
  190,
  282
);

doc.setFontSize(9);

doc.setTextColor(120);

doc.setFont("helvetica","normal");

doc.text(
  "PURESPACE CLEANING",
  20,
  288
);

doc.text(
  "Toronto, Ontario, Canada",
  20,
  293
);

doc.text(
  "financepurespacecleaning@gmail.com",
  100,
  288
);

doc.text(
  "Generated automatically by PureSpace Cleaning Management System",
  100,
  293
);  
doc.save("Payroll-Invoice.pdf");

}