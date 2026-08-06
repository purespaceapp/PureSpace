import { supabase } from "./supabase";

export async function getCleanerSchedule(
  employeeId: number
) {

  const { data, error } = await supabase
    .from("schedule")
    .select("*")
    .eq("employee_id", employeeId)
    .order("cleaning_date");

  if (error) {
    console.error(error);
    return [];
  }

  return data;

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

  const { data, error } = await supabase
    .from("schedule")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("cleaning_date", today)
    .order("checkout_time");

  if (error) {
    console.error(error);
    return [];
  }

  return data;

}