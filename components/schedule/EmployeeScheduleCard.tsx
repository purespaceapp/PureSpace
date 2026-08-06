import CleaningCard from "./CleaningCard";

type Cleaning = {
  property: string;
  checkout: string;
  checkin: string;
  status: string;
};

type EmployeeScheduleCardProps = {
  employee: string;
  earnings: number;
  cleanings: Cleaning[];
};

export default function EmployeeScheduleCard({
  employee,
  earnings,
  cleanings,
}: EmployeeScheduleCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-2xl font-bold">
            👩 {employee}
          </h2>

          <p className="text-gray-500">
            {cleanings.length} Properties
          </p>

        </div>

        <div className="text-right">

          <p className="text-gray-500">
            Today's Earnings
          </p>

          <h2 className="text-3xl font-bold text-green-600">
            ${earnings}
          </h2>

        </div>

      </div>

      <div className="space-y-4">

        {cleanings.map((cleaning, index) => (
          <CleaningCard
            key={index}
            property={cleaning.property}
            checkout={cleaning.checkout}
            checkin={cleaning.checkin}
            status={cleaning.status}
          />
        ))}

      </div>

      <div className="flex gap-3 mt-6">

        <button className="flex-1 bg-[#2E7BBE] text-white rounded-xl py-3">
          📲 Send WhatsApp
        </button>

        <button className="flex-1 bg-gray-200 rounded-xl py-3">
          ✏ Edit Schedule
        </button>

      </div>

    </div>
  );
}