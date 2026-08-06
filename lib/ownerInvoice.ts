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

export async function downloadOwnerInvoice(

  property: any,

  schedule: any,

  extras: any[],

  total: number

) {

  const logo = await getLogo();

  const doc = new jsPDF("p","mm","a4");

  // Background

  doc.setFillColor(250,251,253);

  doc.rect(0,0,210,297,"F");

  // Header

  doc.setFillColor(46,123,190);

  doc.rect(0,0,210,40,"F");

  doc.addImage(

    logo,

    "JPEG",

    160,

    6,

    34,

    28

  );

  doc.setTextColor(255);

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

    "Cleaning Invoice",

    20,

    28

  );

  doc.setTextColor(40);

  doc.setDrawColor(220);

  doc.line(20,48,190,48);

  doc.setFont("helvetica","bold");

  doc.setFontSize(11);

  doc.text("PROPERTY",20,60);

  doc.text("INVOICE",120,60);

  doc.setFont("helvetica","normal");

  doc.text(

    property.name,

    20,

    68

  );

  doc.text(

    property.address,

    20,

    76

  );

  doc.text(

    `Invoice # PS-${Date.now()}`,

    120,

    68

  );

  doc.text(

    new Date().toLocaleDateString(),

    120,

    76

  );

  doc.line(20,84,190,84);

  doc.setFillColor(235,244,255);

  doc.roundedRect(

    20,

    90,

    170,

    10,

    2,

    2,

    "F"

  );

  doc.setFont("helvetica","bold");

  doc.text("Description",25,97);

  doc.text("Amount",170,97);

  let y = 112;

  doc.setFont("helvetica","normal");

  doc.text(

    "Cleaning Service",

    25,

    y

  );

  doc.text(

    `$${property.company_price}`,

    170,

    y

  );

  y += 10;
  extras.forEach((extra: any) => {

  const amount =
    Number(extra.price) * Number(extra.quantity);

  doc.setTextColor(110);

  doc.text(

    `${extra.name} x${extra.quantity}`,

    30,

    y

  );

  doc.setTextColor(0,160,70);

  doc.text(

    `+$${amount.toFixed(2)}`,

    170,

    y

  );

  y += 8;

});

y += 10;

doc.setFillColor(46,123,190);

doc.roundedRect(

  20,

  y,

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

  y + 13

);

doc.text(

  `$${total.toFixed(2)}`,

  160,

  y + 13

);
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

  `Invoice-${property.name}.pdf`

);

}