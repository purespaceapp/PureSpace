export async function getCleanerList() {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "cleaner-list",
    }),
  });

  if (!response.ok) {
    return [];
  }

  const result = await response.json();

  return result.data ?? [];
}

export async function loginCleaner(
  employeeId: number,
  pin: string
) {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "cleaner-login",
      employeeId,
      pin,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const result = await response.json();

  return result.employee ?? null;
}
