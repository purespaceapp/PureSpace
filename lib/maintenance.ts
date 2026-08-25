async function maintenanceRequest(
  action: string,
  body: Record<string, any> = {}
) {
  const response = await fetch("/api/maintenance", {
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
    throw new Error("Maintenance request failed");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.error || "Maintenance request failed"
    );
  }

  return result.data;
}

export async function getMaintenanceIssues() {
  return (
    (await maintenanceRequest("list")) ?? []
  );
}

export async function createMaintenanceIssue(
  issue: any
) {
  return await maintenanceRequest("create", {
    issue,
  });
}

export async function resolveMaintenanceIssue(
  id: number
) {
  return await maintenanceRequest("resolve", {
    id,
  });
}

export async function reopenMaintenanceIssue(
  id: number
) {
  return await maintenanceRequest("reopen", {
    id,
  });
}

export async function getMaintenanceByProperty(
  propertyId: number
) {
  return (
    (await maintenanceRequest("by-property", {
      propertyId,
    })) ?? []
  );
}
