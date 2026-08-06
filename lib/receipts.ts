import { supabase } from "./supabase";

export async function getReceipts(employeeId?: number) {

  let query = supabase
    .from("receipts")
    .select("*")
    .order("purchase_date", { ascending: false });

  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function uploadReceiptPhoto(file: File) {

  const fileName =
    `${Date.now()}-${file.name}`;

  const { error } =
    await supabase.storage
      .from("receipts")
      .upload(fileName, file);

  if (error) {
    console.error(error);
    throw error;
  }

  const { data } =
    supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);

  return data.publicUrl;

}

export async function saveReceipt(receipt: {

  employee_id: number;

  property_id: number;

  schedule_id: number;

  amount: number;

  receipt_photo: string;

  purchase_date: string;

  status: string;

}){

  const { data, error } = await supabase
    .from("receipts")
    .insert([receipt])
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;

}

export async function updateReceiptStatus(
  id: number,
  status: string
) {

  const { data, error } = await supabase
    .from("receipts")
    .update({
      status: status
    })
    .eq("id", id)
    .select();

  console.log("ID:", id);
  console.log("STATUS:", status);
  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) {
    throw error;
  }

  return data;

}

export async function getReceiptsByProperty(
  propertyId: number
) {

  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("property_id", propertyId)
    .eq("status", "Approved")
    .order("purchase_date", {
      ascending: false,
    });

  if (error) {

    console.error(error);

    return [];

  }

  return data;

}
export async function getApprovedCleanerReceipts(
  employeeId: number
) {

  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("status", "Approved")
    .order("purchase_date", {
      ascending: false,
    });

  if (error) {

    console.error(error);

    return [];

  }

  return data;

}