import { supabase } from "./supabase";

export async function getEmployees() {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("name");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function saveEmployee(employee: {
  name: string;
  phone: string;
  email: string;
  pin: string;
  status: string;
  notes: string;
}) {
  const { data, error } = await supabase
    .from("employees")
    .insert([employee])
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

export async function updateEmployee(
  id: number,
  employee: {
    name: string;
    phone: string;
    email: string;
    pin: string;
    status: string;
    notes: string;
  }
) {
  const { data, error } = await supabase
    .from("employees")
    .update(employee)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
}

export async function deleteEmployee(id: number) {
  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}