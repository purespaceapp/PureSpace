import { supabase } from "./supabase";

export async function getIntegration(ownerId: number) {

  const { data, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("provider", "Guesty")
    .maybeSingle();

  if (error) {

    console.error(error);

    return null;

  }

  return data;

}

export async function saveIntegration(integration: {
  owner_id: number;
  provider: string;
  connected: boolean;
  api_key: string;
  account_id: string;
  organization_id: string;
}) {

  const { data, error } = await supabase
    .from("integrations")
    .upsert([integration])
    .select()
    .single();

  if (error) {

    console.error(error);

    throw error;

  }

  return data;

}