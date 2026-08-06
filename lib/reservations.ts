import { supabase } from "./supabase";

export async function getReservations() {

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("check_in", {
      ascending: true,
    });

  if (error) throw error;

  return data ?? [];

}

export async function getReservationsByProperty(
  propertyId: string
) {

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("property_id", propertyId)
    .order("check_in");

  if (error) throw error;

  return data ?? [];

}
export async function createReservation(
  reservation: any
) {

  const { data, error } = await supabase
    .from("reservations")
    .insert(reservation)
    .select()
    .single();

  if (error) throw error;

  return data;

}
export async function updateReservation(
  id: string,
  reservation: any
) {

  const { data, error } = await supabase
    .from("reservations")
    .update({
      ...reservation,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;

}
export async function deleteReservation(
  id: string
) {

  const { error } = await supabase
    .from("reservations")
    .delete()
    .eq("id", id);

  if (error) throw error;

}
export async function completeCleaning(
  id: string
) {

  const { error } = await supabase
    .from("reservations")
    .update({
      cleaning_status: "Completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

}