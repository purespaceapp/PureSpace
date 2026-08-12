import { supabase } from "./supabase";

export async function getMaintenanceIssues() {
  const { data, error } = await supabase
    .from("maintenance_issues")
    .select("*")
    .order("reported_at", { ascending: false });

  if (error) throw error;

  return data || [];
}

export async function createMaintenanceIssue(issue: any) {
  const { error } = await supabase
    .from("maintenance_issues")
    .insert(issue);

  if (error) throw error;
}

export async function resolveMaintenanceIssue(id: number) {

  const { error } = await supabase
    .from("maintenance_issues")
    .update({
      status: "Resolved",
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

}
export async function reopenMaintenanceIssue(id: number) {
  const { error } = await supabase
    .from("maintenance_issues")
    .update({
      status: "Open",
      resolved_at: null,
    })
    .eq("id", id);

  if (error) throw error;
}
export async function getMaintenanceByProperty(propertyId: number) {

  const { data, error } = await supabase
    .from("maintenance_issues")
    .select("*")
    .eq("property_id", propertyId)
    .order("reported_at", {
      ascending: false,
    });

  if (error) throw error;

  return data || [];

}