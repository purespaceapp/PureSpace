import { supabase } from "./supabase";
import { updateReservation } from "./reservations";

export async function getSchedules() {
  const { data, error } = await supabase
    .from("schedule")
    .select("*")
    .order("cleaning_date");

  if (error) {
    console.error(error);
    return [];
  }

  console.table(data);
return data;
}
export async function getSchedulesByProperty(
  propertyId: number
) {

  const { data, error } = await supabase
    .from("schedule")
    .select("*")
    .eq("property_id", propertyId)
    .order("cleaning_date", {
      ascending: true,
    });

  if (error) {

    console.error(error);

    return [];

  }

  return data;

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
  const { data, error } = await supabase
    .from("schedule")
    .insert([schedule])
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
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
  const { data, error } = await supabase
    .from("schedule")
    .update(schedule)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

export async function deleteSchedule(id: number) {
  const { error } = await supabase
    .from("schedule")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}
export async function completeSchedules(
  ids: number[]
) {

  // Obtener los schedules antes de actualizarlos
  const { data: schedules, error: readError } =
    await supabase
      .from("schedule")
      .select("*")
      .in("id", ids);

  if (readError) {
    console.error(readError);
    throw readError;
  }

  // Marcar schedules como Completed
  const { error } = await supabase
    .from("schedule")
    .update({
      status: "Completed",
    })
    .in("id", ids);

  if (error) {
    console.error(error);
    throw error;
  }

  // Actualizar la reserva correspondiente
  if (schedules) {

    for (const schedule of schedules) {

      const { data: reservation } =
        await supabase
          .from("reservations")
          .select("*")
          .eq("property_id", schedule.property_id)
          .eq("check_out", schedule.cleaning_date)
          .single();

      if (reservation) {

        await updateReservation(
          reservation.id,
          {
            cleaning_status: "Completed",
          }
        );

      }

    }

  }

}
export async function reassignSchedules(
  ids: number[],
  employeeId: number
) {

  const { error } = await supabase
    .from("schedule")
    .update({
      employee_id: employeeId,
    })
    .in("id", ids);

  if (error) {
    console.error(error);
    throw error;
  }

}
export async function getSchedulesByDate(
  date: string
) {

  const { data, error } = await supabase
    .from("schedule")
    .select("*")
    .eq("cleaning_date", date)
    .order("employee_id");

  if (error) {
    console.error(error);
    return [];
  }

  return data;


}
export async function getCompletedSchedulesByOwner(
  ownerId: number
) {

  const { data, error } = await supabase
    .from("schedule")
    .select(`
      *,
      properties!inner(
        id,
        name,
        address,
        company_price,
        owner_id
      )
    `)
    .eq("status", "Completed")
    .eq("properties.owner_id", ownerId)
    .order("cleaning_date", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data;

}
export async function getCompletedSchedulesByProperty(
  propertyId: number
) {
  const { data, error } = await supabase
    .from("schedule")
    .select("*")
    .eq("property_id", propertyId)
    .eq("status", "Completed")
    .order("cleaning_date", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}
export async function getScheduleExtras(
  scheduleId: number
) {
  const { data, error } = await supabase
    .from("schedule_extras")
    .select(`
      quantity,
      extras (
        id,
        name,
        owner_price
      )
    `)
    .eq("schedule_id", scheduleId);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}
export async function getScheduleByReservation(
  reservationId: string
) {
  const { data, error } = await supabase
    .from("schedule")
    .select(`
      *,
      employees(
        id,
        name
      )
    `)
    .eq("reservation_id", reservationId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}