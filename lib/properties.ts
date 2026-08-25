type PropertyData = {
  name: string;
  owner: string;
  owner_id?: number;
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
  property_images?: string[];
};

async function propertyApi(body: any) {
  const response = await fetch("/api/properties", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Property request failed");
  }

  return result.data;
}

export async function getProperties(ownerId?: number) {
  try {
    return await propertyApi({
      action: "list",
      ownerId: ownerId ?? null,
    });
  } catch (error) {
    console.error("Error loading properties:", error);
    return [];
  }
}

export async function saveProperty(property: PropertyData) {
  return await propertyApi({
    action: "create",
    property,
  });
}

export async function updateProperty(
  id: number,
  property: PropertyData
) {
  return await propertyApi({
    action: "update",
    id,
    property,
  });
}

export async function deleteProperty(id: number) {
  await propertyApi({
    action: "delete",
    id,
  });
}

export async function updateAirbnbConnection(
  id: number,
  data: {
    airbnb_listing_url: string;
    airbnb_calendar_url: string;
    airbnb_connected: boolean;
  }
) {
  await propertyApi({
    action: "airbnb",
    id,
    airbnb_listing_url: data.airbnb_listing_url,
    airbnb_calendar_url: data.airbnb_calendar_url,
    airbnb_connected: data.airbnb_connected,
  });
}
