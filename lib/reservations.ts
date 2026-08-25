async function reservationRequest(
  action: string,
  body: Record<string, any> = {}
) {
  const response = await fetch("/api/reservations", {
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
    throw new Error("Reservation request failed");
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.error || "Reservation request failed"
    );
  }

  return result.data;
}

export async function getReservations() {
  return (
    (await reservationRequest("list")) ?? []
  );
}

export async function getReservationsByProperty(
  propertyId: string
) {
  return (
    (await reservationRequest("by-property", {
      propertyId,
    })) ?? []
  );
}

export async function createReservation(
  reservation: any
) {
  return await reservationRequest("create", {
    reservation,
  });
}

export async function updateReservation(
  id: string,
  reservation: any
) {
  return await reservationRequest("update", {
    id,
    reservation,
  });
}

export async function deleteReservation(
  id: string
) {
  await reservationRequest("delete", {
    id,
  });
}

export async function completeCleaning(
  id: string
) {
  await reservationRequest("complete", {
    id,
  });
}
