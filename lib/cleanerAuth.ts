import { supabase } from "./supabase";

export async function loginCleaner(
  employeeId: number,
  pin: string
) {

  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .eq("pin", pin)
    .single();

  if (error) {

    return null;

  }

  return data;

}