import jsPDF from "jspdf";

async function getLogo() {
  const response = await fetch("/images/logo.jpg");
  const blob = await response.blob();

  return await new Promise<string>((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () =>
      resolve(reader.result as string);

    reader.readAsDataURL(blob);
  });
}

export async function downloadInventory(
  employee: any,
  property: any,
  inventory: Record<string, number>,
  notes: string
) {

  const logo = await getLogo();

  const doc = new jsPDF("p", "mm", "a4");

  //----------------------------------
  // COLORS
  //----------------------------------

 const BLUE = [46,123,190] as const;
const DARK = [45,45,45] as const;
const LIGHT = [242,246,250] as const;
const RED = [210,40,40] as const;
const ORANGE = [235,140,20] as const;
const GREEN = [30,150,60] as const;
  //----------------------------------
  // PAGE
  //----------------------------------

  doc.setFillColor(248,249,252);
  doc.rect(0,0,210,297,"F");

  //----------------------------------
  // HEADER
  //----------------------------------

  doc.setFillColor(...BLUE);

  doc.rect(
    0,
    0,
    210,
    35,
    "F"
  );

  doc.addImage(
    logo,
    "JPEG",
    160,
    4,
    35,
    27
  );

  doc.setTextColor(255);

  doc.setFontSize(22);
  doc.setFont("helvetica","bold");

  doc.text(
    "PURESPACE CLEANING",
    15,
    16
  );

  doc.setFontSize(12);
  doc.setFont("helvetica","normal");

  doc.text(
    "Unit Inventory Report",
    15,
    25
  );

  //----------------------------------
  // INFO
  //----------------------------------

 // White card
doc.setFillColor(255,255,255);
doc.roundedRect(15,42,180,30,5,5,"F");

// Title
doc.setFont("helvetica","bold");
doc.setFontSize(13);
doc.setTextColor(...BLUE);
doc.text("Property Information",20,50);

// Labels
doc.setTextColor(...DARK);
doc.setFontSize(10);

doc.setFont("helvetica","bold");
doc.text("Property",20,58);

doc.setFont("helvetica","normal");
doc.text(property?.name || "-",55,58);

doc.setFont("helvetica","bold");
doc.text("Cleaner",20,65);

doc.setFont("helvetica","normal");
doc.text(employee?.name || "-",55,65);

doc.setFont("helvetica","bold");
doc.text("Date",120,58);

doc.setFont("helvetica","normal");
doc.text(new Date().toLocaleDateString(),140,58);

doc.setFont("helvetica","bold");
doc.text("Report",120,65);

doc.setFont("helvetica","normal");
doc.text("Inventory",140,65);

  //----------------------------------
  // POSITION
  //----------------------------------

  let y = 85;
  //----------------------------------
// INVENTORY ITEMS
//----------------------------------

const kitchen = [
  "Paper Towels",
  "Garbage Bags",
  "Dish Soap",
  "Dishwasher Pods",
  "Coffee Pods",
  "Ground Coffee",
  "Sponges",
  "Salt",
  "Pepper",
  "Cooking Oil",
];

const bathroom = [
  "Toilet Paper",
  "Body Wash",
  "Shampoo",
  "Conditioner",
  "Hand Soap",
];

const laundry = [
  "Laundry Pods",
  "Bleach",
  "All Purpose Cleaner",
  "Floor Cleaner",
  "Glass Cleaner",
];

const maintenance = [
  "Light Bulbs",
  "Batteries",
];
function drawCategory(title: string, items: string[]) {
  const cardHeight = 12 + items.length * 8;

if (y + cardHeight > 265) {

    doc.addPage();

    doc.setFillColor(248,249,252);
    doc.rect(0,0,210,297,"F");

    y = 20;

}

  // Card
  doc.setFillColor(255,255,255);
  doc.roundedRect(15, y, 180, 12 + items.length * 8, 4, 4, "F");

  // Header
  doc.setFillColor(...BLUE);
  doc.roundedRect(15, y, 180, 10, 4, 4, "F");

  doc.setTextColor(255);
  doc.setFont("helvetica","bold");
  doc.setFontSize(11);

  doc.text(title,20,y+6.5);

  y += 16;

  items.forEach((item)=>{

      const qty = inventory[item] ?? 0;

      doc.setTextColor(...DARK);
      doc.setFont("helvetica","normal");
      doc.setFontSize(10);

      doc.text(item,22,y);

      let text = "";
      let color:any = DARK;

      if(qty===0){

          text = "OUT OF STOCK";
          color = RED;

      }else if(qty===1){

          text = "LOW STOCK";
          color = ORANGE;

      }else{

          text = `${qty} IN STOCK`;
          color = GREEN;

      }

     doc.setTextColor(color[0], color[1], color[2]);

      doc.text(text,145,y);

      y += 8;

  });

  y += 10;

}

drawCategory("Kitchen", kitchen);

drawCategory("Bathroom", bathroom);

drawCategory("Laundry", laundry);

drawCategory("Maintenance", maintenance);

doc.setDrawColor(220);
doc.line(15,285,195,285);

doc.setFontSize(8);
doc.setTextColor(120);

doc.text(
  "Generated automatically by PureSpace Cleaning Management System",
  20,
  291
);
//-------------------------------
// UNIT NOTES
//-------------------------------

if (y + 40 > 270) {

    doc.addPage();

    doc.setFillColor(248,249,252);
    doc.rect(0,0,210,297,"F");

    y = 20;

}

doc.setFillColor(255,255,255);
doc.roundedRect(15,y,180,40,4,4,"F");

doc.setFillColor(...BLUE);
doc.roundedRect(15,y,180,10,4,4,"F");

doc.setTextColor(255);
doc.setFont("helvetica","bold");
doc.setFontSize(11);

doc.text("Unit Notes",20,y+6);

y += 18;

doc.setTextColor(...DARK);
doc.setFont("helvetica","normal");
doc.setFontSize(10);

const unitNotes =
    notes?.trim() || "No notes reported.";

doc.text(
    unitNotes,
    20,
    y,
    {
        maxWidth:170
    }
);
doc.save("Inventory_Report.pdf");

}