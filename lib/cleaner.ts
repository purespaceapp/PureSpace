async function scheduleRequest(
  action: string,
  body: Record<string, any> = {}
) {
  const response = await fetch("/api/schedule", {
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
    throw new Error("Schedule request failed");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.error || "Schedule request failed"
    );
  }

  return result.data;
}

export async function getCleanerSchedule(
  employeeId: number
) {
  const data = await scheduleRequest("list");

  return (data ?? []).filter(
    (schedule: any) =>
      Number(schedule.employee_id) === Number(employeeId)
  );
}

export async function getTodayCleanerSchedule(
  employeeId: number
) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replace(/\//g, "-");

  const data = await scheduleRequest("by-date", {
    date: today,
  });

  return (data ?? [])
    .filter(
      (schedule: any) =>
        Number(schedule.employee_id) === Number(employeeId)
    )
    .sort((a: any, b: any) =>
      String(a.checkout_time ?? "").localeCompare(
        String(b.checkout_time ?? "")
      )
    );
}
