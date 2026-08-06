type CleaningCardProps = {
  property: string;
  checkout: string;
  checkin: string;
  status: string;
};

export default function CleaningCard({
  property,
  checkout,
  checkin,
  status,
}: CleaningCardProps) {
  return (
    <div className="border rounded-xl p-4 bg-gray-50">

      <h3 className="font-semibold text-lg">
        🏠 {property}
      </h3>

      <div className="mt-3 space-y-1 text-gray-600">

        <p>
          🚪 Check-out: <strong>{checkout}</strong>
        </p>

        <p>
          🔑 Check-in: <strong>{checkin}</strong>
        </p>

      </div>

      <div className="mt-4 flex justify-between items-center">

        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
          {status}
        </span>

        <button className="text-[#2E7BBE] font-semibold hover:underline">
          Edit
        </button>

      </div>

    </div>
  );
}