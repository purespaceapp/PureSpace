import { supabase } from "./supabase";

export async function getOwners() {

  const { data, error } = await supabase
    .from("owners")
    .select("*")
    .order("name");

  if (error) {

    console.error(error);

    return [];

  }

  return data;

}