type ScheduleCardProps = {
  property: string;
  cleaner: string;
  date: string;
  checkout?: string;
checkin?: string;
  cleanerPay: number;
  companyCharge: number;
  status: string;
  extras?: {
  name: string;
  quantity: number;
}[];

  selected: boolean;
  onSelect: () => void;

  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};
export default function ScheduleCard({
  property,
  cleaner,
  date,
  checkout,
  checkin,
  cleanerPay,
  companyCharge,
  status,
  extras,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: ScheduleCardProps) {
  return (
    <div
  className={`rounded-2xl shadow-md border p-6 transition cursor-pointer ${
    selected
      ? "bg-blue-50 border-blue-500"
      : "bg-white"
  }`}
>

      <div className="flex justify-between items-start">
<div className="mr-4 mt-1">

  <input
    type="checkbox"
    checked={selected}
    onChange={onSelect}
    className="w-5 h-5 cursor-pointer"
  />

</div>
        <div>

          <h2 className="text-xl font-bold">
            {property}
          </h2>

          <p className="text-gray-500">
  {date}
</p>

<p className="text-sm text-gray-500 mt-2">
  🚪 Checkout: {checkout || "--"}
</p>

<p className="text-sm text-gray-500">
  🛎️ Check-in: {checkin || "--"}
</p>

          <p className="mt-3">
            🧹 {cleaner}
          </p>

          <p>
            Cleaner Pay:
            <strong> ${cleanerPay}</strong>
          </p>

          <p>
            Company Charge:
            <strong> ${companyCharge}</strong>
          </p>
{extras && extras.length > 0 && (

  <div className="mt-3">

    <p className="font-semibold text-sm text-gray-700">
      Extras
    </p>

    <div className="flex flex-wrap gap-2 mt-2">

      {extras.map((extra) => (

        <span
          key={extra.name}
          className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full"
        >
          {extra.name} ×{extra.quantity}
        </span>

      ))}

    </div>

  </div>

)}
        </div>

        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full h-fit">
          {status === "Scheduled" ? "Assigned" : status}
        </span>

      </div>

      <div className="flex gap-3 mt-6">

        <button
          onClick={onView}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          View
        </button>

        <button
          onClick={onEdit}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Delete
        </button>

      </div>

    </div>
  );
}