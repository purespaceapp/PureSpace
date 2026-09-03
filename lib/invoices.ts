export type InvoiceItem = {
  id?: number;
  invoice_id?: number;
  item_type: string;
  schedule_id?: number | null;
  receipt_id?: number | null;
  item_date?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

export type Invoice = {
  id: number;
  invoice_number: string;

  owner_id: number;
  property_id: number;

  period_start: string;
  period_end: string;

  property_name: string;
  property_address?: string | null;

   total_cleaning: number;
  total_expenses: number;
  total_due: number;
  hst_enabled: boolean;

  status: string;
  created_at: string;

  properties?: any;
  owners?: any;

  items?: InvoiceItem[];
};

async function invoiceRequest(
  action: string,
  body: Record<string, any> = {}
) {
  const response = await fetch("/api/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      ...body,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.error || "Invoice request failed"
    );
  }

  return result.data;
}

// ==========================================
// OWNER
// ==========================================

export async function getOwnerInvoices(
  ownerId: number
): Promise<Invoice[]> {
  return (
    (await invoiceRequest("list-owner", {
      ownerId,
    })) ?? []
  );
}

// ==========================================
// SINGLE INVOICE
// ==========================================

export async function getInvoice(
  invoiceId: number
): Promise<Invoice | null> {
  return await invoiceRequest("get", {
    invoiceId,
  });
}

// ==========================================
// OFFICE
// ==========================================

export async function getOfficeInvoices() {
  return (
    (await invoiceRequest("list-office")) ?? []
  );
}

// ==========================================
// CREATE
// ==========================================

export async function createInvoice(
  invoice: Omit<
    Invoice,
    | "id"
    | "invoice_number"
    | "created_at"
    | "items"
  >,
  items: InvoiceItem[] = []
) {
  return await invoiceRequest("create", {
    invoice,
    items,
  });
}