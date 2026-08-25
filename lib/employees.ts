export async function getEmployees() {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "list",
    }),
  });

  if (!response.ok) {
    return [];
  }

  const result = await response.json();

  return result.data ?? [];
}

export async function saveEmployee(employee: {
  name: string;
  phone: string;
  email: string;
  pin: string;
  status: string;
  notes: string;
}) {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "create",
      employee,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to create employee");
  }

  const result = await response.json();

  return result.data;
}

export async function updateEmployee(
  id: number,
  employee: {
    name: string;
    phone: string;
    email: string;
    pin: string;
    status: string;
    notes: string;
  }
) {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "update",
      id,
      employee,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to update employee");
  }

  const result = await response.json();

  return result.data;
}

export async function deleteEmployee(id: number) {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "delete",
      id,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to delete employee");
  }
}
