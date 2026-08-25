async function receiptRequest(
  action: string,
  body: Record<string, any> = {}
) {
  const response = await fetch("/api/receipts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
      ...body,
    }),
  });

  if (!response.ok) {
    throw new Error("Receipt request failed");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Receipt request failed");
  }

  return result.data;
}

export async function getReceipts(employeeId?: number) {
  return (
    (await receiptRequest("list", {
      employeeId,
    })) ?? []
  );
}

export async function uploadReceiptPhoto(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/receipts/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Receipt photo upload failed");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.error || "Receipt photo upload failed"
    );
  }

  return result.data.publicUrl;
}

export async function saveReceipt(receipt: {
  employee_id: number;
  property_id: number;
  schedule_id: number;
  amount: number;
  receipt_photo: string;
  purchase_date: string;
  status: string;
}) {
  return await receiptRequest("create", {
    receipt,
  });
}

export async function updateReceiptStatus(
  id: number,
  status: string
) {
  return (
    (await receiptRequest("update-status", {
      id,
      status,
    })) ?? []
  );
}

export async function getReceiptsByProperty(
  propertyId: number
) {
  return (
    (await receiptRequest("by-property", {
      propertyId,
    })) ?? []
  );
}

export async function getApprovedCleanerReceipts(
  employeeId: number
) {
  return (
    (await receiptRequest("approved-by-employee", {
      employeeId,
    })) ?? []
  );
}
