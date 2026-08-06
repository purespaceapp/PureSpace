import { supabase } from "./supabase";

export async function getExtras() {
  

  const { data, error } = await supabase
    .from("extras")
    .select("*")
    .order("id");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}
export async function saveScheduleExtras(
  scheduleId: number,
  extras: {
    id: number;
    quantity: number;
  }[]
) {

  if (extras.length === 0) return;

  const rows = extras.map((extra) => ({
    schedule_id: scheduleId,
    extra_id: extra.id,
    quantity: extra.quantity,
  }));

  const { error } = await supabase
    .from("schedule_extras")
    .insert(rows);

  if (error) {
    console.error(error);
    throw error;
  }

}

export async function getScheduleExtras(
  scheduleId: number
) {

  const { data, error } = await supabase
    .from("schedule_extras")
    .select("*")
    .eq("schedule_id", scheduleId);

  if (error) {
    console.error(error);
    return [];
  }

  return data;

}

export async function deleteScheduleExtras(
  scheduleId: number
) {

  const { error } = await supabase
    .from("schedule_extras")
    .delete()
    .eq("schedule_id", scheduleId);

  if (error) {
    console.error(error);
    throw error;
  }

}