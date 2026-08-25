async function extrasRequest(
  action: string,
  body: Record<string, any> = {}
) {
  const response = await fetch("/api/extras", {
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
    throw new Error("Extras request failed");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.error || "Extras request failed"
    );
  }

  return result.data;
}

export async function getExtras() {
  return (await extrasRequest("list")) ?? [];
}

export async function saveScheduleExtras(
  scheduleId: number,
  extras: {
    id: number;
    quantity: number;
  }[]
) {
  if (extras.length === 0) return;

  return await extrasRequest(
    "save-schedule-extras",
    {
      scheduleId,
      extras,
    }
  );
}

export async function getScheduleExtras(
  scheduleId: number
) {
  return (
    (await extrasRequest(
      "schedule-extras",
      { scheduleId }
    )) ?? []
  );
}

export async function deleteScheduleExtras(
  scheduleId: number
) {
  await extrasRequest(
    "delete-schedule-extras",
    { scheduleId }
  );
}
