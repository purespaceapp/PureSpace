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
    throw new Error(result.error || "Schedule request failed");
  }

  return result.data;
}

export async function getSchedules() {
  return (
    (await scheduleRequest("list")) ?? []
  );
}

export async function getSchedulesByProperty(
  propertyId: number
) {
  return (
    (await scheduleRequest("by-property", {
      propertyId,
    })) ?? []
  );
}

export async function saveSchedule(schedule: {
  property_id: number;
  employee_id: number;
  cleaning_date: string;
  cleaner_pay: number;
  company_charge: number;
  status: string;
  notes: string;
  checkout_time: string;
  checkin_time: string;
}) {
  return await scheduleRequest("create", {
    schedule,
  });
}

export async function updateSchedule(
  id: number,
  schedule: {
    property_id: number;
    employee_id: number;
    cleaning_date: string;
    cleaner_pay: number;
    company_charge: number;
    status: string;
    notes: string;
    checkout_time: string;
    checkin_time: string;
  }
) {
  return await scheduleRequest("update", {
    id,
    schedule,
  });
}

export async function deleteSchedule(id: number) {
  await scheduleRequest("delete", {
    id,
  });
}

export async function completeSchedules(
  ids: number[]
) {
  await scheduleRequest("complete", {
    ids,
  });
}

export async function reassignSchedules(
  ids: number[],
  employeeId: number
) {
  await scheduleRequest("reassign", {
    ids,
    employeeId,
  });
}

export async function getSchedulesByDate(
  date: string
) {
  return (
    (await scheduleRequest("by-date", {
      date,
    })) ?? []
  );
}

export async function getCompletedSchedulesByOwner(
  ownerId: number
) {
  return (
    (await scheduleRequest("completed-by-owner", {
      ownerId,
    })) ?? []
  );
}

export async function getCompletedSchedulesByProperty(
  propertyId: number
) {
  return (
    (await scheduleRequest("completed-by-property", {
      propertyId,
    })) ?? []
  );
}

export async function getScheduleExtras(
  scheduleId: number
) {
  return (
    (await scheduleRequest("extras", {
      scheduleId,
    })) ?? []
  );
}

export async function getScheduleByReservation(
  reservationId: string
) {
  return await scheduleRequest("by-reservation", {
    reservationId,
  });
}
