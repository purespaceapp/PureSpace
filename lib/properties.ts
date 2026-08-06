import { supabase } from "./supabase";

export async function getProperties(ownerId?: number) {

  let query = supabase
    .from("properties")
    .select("*")
    .order("name");

  if (ownerId) {

    query = query.eq("owner_id", ownerId);

  }

  const { data, error } = await query;

  if (error) {

    console.error(error);

    return [];

  }

  return data;

}

export async function saveProperty(property: {
  name: string;
  owner: string;
  address: string;
  email: string;
  phone: string;
  door_code: string;
  wifi_name: string;
  wifi_password: string;
  cleaner_price: number;
  company_price: number;
  whatsapp_group: string;
  inventory_form: string;
  notes: string;
}) {

  const { data, error } = await supabase
    .from("properties")
    .insert([
      {
        ...property,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error saving property:", error);
    throw error;
  }

  return data;
}
export async function updateProperty(
  id: number,
  property: {
    name: string;
    owner: string;
    address: string;
    email: string;
    phone: string;
    door_code: string;
    wifi_name: string;
    wifi_password: string;
    cleaner_price: number;
    company_price: number;
    whatsapp_group: string;
    inventory_form: string;
    notes: string;
  }
  
) {
  
  const { data, error } = await supabase
    .from("properties")
    .update({
      ...property,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating property:", error);
    throw error;
  }

  return data;
}
export async function deleteProperty(id: number) {

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting property:", error);
    throw error;
  }

}
export async function updateAirbnbConnection(
  id: number,
  data: {
    airbnb_listing_url: string;
    airbnb_calendar_url: string;
    airbnb_connected: boolean;
  }
) {

  const { error } = await supabase
    .from("properties")
    .update({
      airbnb_listing_url: data.airbnb_listing_url,
      airbnb_calendar_url: data.airbnb_calendar_url,
      airbnb_connected: data.airbnb_connected,
      last_airbnb_sync: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {

    console.error(
      "Error updating Airbnb connection:",
      error
    );

    throw error;

  }

}