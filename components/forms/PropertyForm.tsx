"use client";

import { useEffect, useState } from "react";

import {
  saveProperty,
  updateProperty,
} from "@/lib/properties";

import { getOwners } from "@/lib/owners";

type PropertyFormProps = {
  onClose: () => void;
  onSaved: () => Promise<void>;
  property?: any;
};

export default function PropertyForm({
  onClose,
  onSaved,
  property,
}: PropertyFormProps) {

  const [name, setName] = useState(property?.name || "");

const [owner, setOwner] = useState(property?.owner || "");
const [ownerId, setOwnerId] = useState(
  property?.owner_id?.toString() || ""
);

const [owners, setOwners] = useState<any[]>([]);

const [address, setAddress] = useState(property?.address || "");

const [email, setEmail] = useState(property?.email || "");

const [phone, setPhone] = useState(property?.phone || "");

const [cleanerPrice, setCleanerPrice] = useState(
  property?.cleaner_price?.toString() || ""
);

const [companyPrice, setCompanyPrice] = useState(
  property?.company_price?.toString() || ""
);


const [doorCode, setDoorCode] = useState(
  property?.door_code || ""
);

const [wifiName, setWifiName] = useState(
  property?.wifi_name || ""
);

const [wifiPassword, setWifiPassword] = useState(
  property?.wifi_password || ""
);

const [whatsappGroup, setWhatsappGroup] = useState(
  property?.whatsapp_group || ""
);

const [inventoryForm, setInventoryForm] = useState(
  property?.inventory_form || ""
);

const [notes, setNotes] = useState(
  property?.notes || ""
);
const [loading, setLoading] = useState(false);
useEffect(() => {

  async function loadOwners() {

    const data = await getOwners();

    setOwners(data);

  }

  loadOwners();

}, []);
async function handleSave() {

  try {

    setLoading(true);

   const selectedOwner =
  owners.find(
    (o) => o.id === Number(ownerId)
  );

const propertyData = {

  name,

  owner:
    selectedOwner?.name || "",

  owner_id:
    Number(ownerId),

  address,

  email,

  phone,

  door_code: doorCode,

  wifi_name: wifiName,

  wifi_password: wifiPassword,

  cleaner_price: Number(cleanerPrice),

  company_price: Number(companyPrice),

  whatsapp_group: whatsappGroup,

  inventory_form: inventoryForm,

  notes,

};

if (property) {
  await updateProperty(property.id, propertyData);
} else {
  await saveProperty(propertyData);
}

    await onSaved();

    onClose();

  } catch (error) {

    console.error(error);

    alert("Error saving property.");

  } finally {

    setLoading(false);

  }

}
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">

      <h2 className="text-2xl font-bold text-[#2E7BBE] mb-6">
        Add New Property
      </h2>

      <div className="grid grid-cols-2 gap-5">

        <select
  value={ownerId}
  onChange={(e) =>
    setOwnerId(e.target.value)
  }
  className="border rounded-xl p-3"
>

  <option value="">

    Select Owner

  </option>

  {owners.map((owner) => (

    <option
      key={owner.id}
      value={owner.id}
    >

      {owner.name}

    </option>

  ))}

</select>

        <input
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          placeholder="Owner Name"
          className="border rounded-xl p-3"
        />

        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="border rounded-xl p-3 col-span-2"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Owner Email"
          className="border rounded-xl p-3"
        />

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Owner Phone"
          className="border rounded-xl p-3"
        />

        <input
          type="number"
          value={cleanerPrice}
          onChange={(e) => setCleanerPrice(e.target.value)}
          placeholder="Cleaner Price ($)"
          className="border rounded-xl p-3"
        />

        <input
          type="number"
          value={companyPrice}
          onChange={(e) => setCompanyPrice(e.target.value)}
          placeholder="Company Charge ($)"
          className="border rounded-xl p-3"
        />


        <input
          value={doorCode}
          onChange={(e) => setDoorCode(e.target.value)}
          placeholder="Door Code"
          className="border rounded-xl p-3"
        />

        <input
          value={wifiName}
          onChange={(e) => setWifiName(e.target.value)}
          placeholder="WiFi Name"
          className="border rounded-xl p-3"
        />

        <input
          value={wifiPassword}
          onChange={(e) => setWifiPassword(e.target.value)}
          placeholder="WiFi Password"
          className="border rounded-xl p-3"
        />

        <input
          value={whatsappGroup}
          onChange={(e) => setWhatsappGroup(e.target.value)}
          placeholder="WhatsApp Group Link"
          className="border rounded-xl p-3 col-span-2"
        />

        

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes..."
          className="border rounded-xl p-3 col-span-2 h-32"
        />

      </div>

      <button
  onClick={handleSave}
  disabled={loading}
  className="mt-6 w-full bg-[#2E7BBE] hover:bg-[#23649D] disabled:bg-gray-400 text-white font-semibold py-4 rounded-2xl transition-all duration-300"
>

  {loading ? "Saving..." : "Save Property"}

</button>

    </div>
  );
}