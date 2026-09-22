"use client";

type InventoryShareCardProps = {
  property: string;
  cleaner: string;
  date: string;
  inventory: Record<string, number>;
  notes: string;
};

const sections = [
  {
    title: "Kitchen",
    icon: "🍴",
    accent: "#2E7BBE",
    background: "#F1F7FD",
    items: [
      "Paper Towels",
      "Garbage Bags",
      "Dish Soap Gallons",
      "Dishwasher Pods",
      "Coffee Pods",
      "Ground Coffee",
      "Sponges",
      "Salt",
      "Pepper",
      "Cooking Oil",
    ],
  },
  {
    title: "Bathroom",
    icon: "🛁",
    accent: "#159A9C",
    background: "#F0FBFB",
    items: [
      "Toilet Paper",
      "Body Wash",
      "Shampoo",
      "Conditioner",
      "Hand Soap",
    ],
  },
  {
    title: "Laundry",
    icon: "🧺",
    accent: "#7C4DCC",
    background: "#F8F4FD",
    items: [
      "Laundry Pods",
      "Bleach",
      "All Purpose Cleaner",
      "Floor Cleaner",
      "Glass Cleaner",
    ],
  },
  {
    title: "Maintenance",
    icon: "🔧",
    accent: "#D97706",
    background: "#FFF8ED",
    items: [
      "Light Bulbs",
      "Batteries",
    ],
  },
];

export default function InventoryShareCard({
  property,
  cleaner,
  date,
  inventory,
  notes,
}: InventoryShareCardProps) {
  return (
    <div
      style={{
        width: "900px",
        background: "#FFFFFF",
        color: "#172033",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        padding: "34px",
        boxSizing: "border-box",
      }}
    >

      {/* =========================
          HEADER
      ========================== */}

      <div
        style={{
          background:
            "linear-gradient(135deg, #205A91 0%, #2E7BBE 55%, #3D94D4 100%)",
          borderRadius: "24px",
          padding: "30px 34px",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
        }}
      >

        <div
          style={{
            position: "absolute",
            right: "-45px",
            top: "-65px",
            width: "190px",
            height: "190px",
            borderRadius: "999px",
            background:
              "rgba(255,255,255,0.10)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "70px",
            bottom: "-85px",
            width: "150px",
            height: "150px",
            borderRadius: "999px",
            background:
              "rgba(255,255,255,0.06)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
          }}
        >

          <div
            style={{
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "1px",
              lineHeight: 1.1,
            }}
          >
            PURESPACE
          </div>

          <div
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "3px",
              marginTop: "5px",
              opacity: 0.9,
            }}
          >
            CLEANING
          </div>

          <div
            style={{
              marginTop: "18px",
              fontSize: "21px",
              fontWeight: 700,
            }}
          >
            Unit Inventory Report
          </div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "12px",
              opacity: 0.82,
            }}
          >
            Inventory verification & supply check
          </div>

        </div>
      </div>

      {/* =========================
          INFORMATION
      ========================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1.35fr 1fr 0.85fr",
          gap: "12px",
          marginTop: "18px",
        }}
      >

        <InfoCard
          label="PROPERTY"
          value={property || "Not specified"}
          accent="#2E7BBE"
          background="#F2F7FC"
        />

        <InfoCard
          label="CLEANER"
          value={cleaner || "Not specified"}
          accent="#159A9C"
          background="#F1FBF8"
        />

        <InfoCard
          label="DATE"
          value={date}
          accent="#7C4DCC"
          background="#F8F5FD"
        />

      </div>

      {/* =========================
          SUMMARY
      ========================== */}

      <div
        style={{
          marginTop: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#F8FAFC",
          border: "1px solid #E7EDF4",
          borderRadius: "16px",
          padding: "13px 18px",
        }}
      >

        <div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 800,
              color: "#718096",
              letterSpacing: "1.5px",
            }}
          >
            INVENTORY STATUS
          </div>

          <div
            style={{
              marginTop: "3px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#25324A",
            }}
          >
            Supply levels recorded at property
          </div>
        </div>

        <div
          style={{
            background: "#EAF8F0",
            color: "#16834A",
            padding: "7px 12px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 800,
          }}
        >
          ✓ COMPLETED
        </div>

      </div>

      {/* =========================
          INVENTORY GRID
      ========================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "14px",
          marginTop: "18px",
        }}
      >

        {sections.map((section) => (

          <InventorySection
            key={section.title}
            section={section}
            inventory={inventory}
          />

        ))}

      </div>

      {/* =========================
          NOTES
      ========================== */}

      <div
        style={{
          marginTop: "14px",
          background: "#FFFBEA",
          border: "1px solid #F2E7B7",
          borderRadius: "16px",
          padding: "16px 18px",
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#B77900",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "0.8px",
          }}
        >
          <span style={{ fontSize: "15px" }}>
            📝
          </span>

          NOTES
        </div>

        <div
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: notes
              ? "#334155"
              : "#94A3B8",
            lineHeight: 1.5,
          }}
        >
          {notes || "No notes recorded."}
        </div>

      </div>

      {/* =========================
          FOOTER
      ========================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "18px",
          paddingTop: "13px",
          borderTop: "1px solid #E7EDF4",
          color: "#94A3B8",
          fontSize: "9px",
        }}
      >

        <span>
          PURESPACE CLEANING
        </span>

        <span>
          Professional Property Management
        </span>

      </div>

    </div>
  );
}


/* =====================================
   INFO CARD
===================================== */

function InfoCard({
  label,
  value,
  accent,
  background,
}: {
  label: string;
  value: string;
  accent: string;
  background: string;
}) {
  return (
    <div
      style={{
        background,
        borderRadius: "16px",
        padding: "14px 16px",
        minHeight: "58px",
        border: "1px solid rgba(0,0,0,0.04)",
      }}
    >

      <div
        style={{
          fontSize: "9px",
          fontWeight: 800,
          color: accent,
          letterSpacing: "1.4px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "5px",
          fontSize: "13px",
          fontWeight: 700,
          color: "#1E293B",
          lineHeight: 1.25,
        }}
      >
        {value}
      </div>

    </div>
  );
}


/* =====================================
   INVENTORY SECTION
===================================== */

function InventorySection({
  section,
  inventory,
}: {
  section: {
    title: string;
    icon: string;
    accent: string;
    background: string;
    items: string[];
  };
  inventory: Record<string, number>;
}) {
  return (
    <div
      style={{
        background: section.background,
        borderRadius: "18px",
        padding: "15px",
        border: `1px solid ${section.accent}18`,
      }}
    >

      {/* Section Header */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          marginBottom: "10px",
        }}
      >

        <div
          style={{
            width: "29px",
            height: "29px",
            borderRadius: "9px",
            background: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            boxShadow:
              "0 2px 6px rgba(15,23,42,0.06)",
          }}
        >
          {section.icon}
        </div>

        <div
          style={{
            fontSize: "13px",
            fontWeight: 800,
            color: section.accent,
            letterSpacing: "0.4px",
          }}
        >
          {section.title.toUpperCase()}
        </div>

      </div>

      {/* Items */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            section.items.length > 5
              ? "1fr 1fr"
              : "1fr",
          gap: "6px",
        }}
      >

        {section.items.map((item) => {

          const quantity =
            inventory[item] ?? 0;

          return (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "7px",
                background: "#FFFFFF",
                borderRadius: "9px",
                padding: "7px 8px 7px 10px",
                minHeight: "27px",
                boxSizing: "border-box",
                border:
                  "1px solid rgba(226,232,240,0.8)",
              }}
            >

              <span
                style={{
                  fontSize: "9px",
                  color: "#475569",
                  lineHeight: 1.2,
                }}
              >
                {item}
              </span>

              <span
                style={{
                  flexShrink: 0,
                  minWidth: "23px",
                  height: "20px",
                  padding: "0 5px",
                  borderRadius: "7px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    quantity > 0
                      ? "#EAF8F0"
                      : "#FFF0F1",
                  color:
                    quantity > 0
                      ? "#16834A"
                      : "#DC3545",
                  fontSize: "9px",
                  fontWeight: 800,
                }}
              >
                {quantity}
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
}