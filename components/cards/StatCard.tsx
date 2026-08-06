type StatCardProps = {
  title: string;
  value: string | number;
};

export default function StatCard({
  title,
  value,
}: StatCardProps) {

  const icon =
    title.includes("Properties")
      ? "🏠"
      : title.includes("Cleanings")
      ? "🧹"
      : title.includes("Employees")
      ? "👥"
      : "💰";

  return (

    <div className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 h-40">

      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-500 text-base font-medium">

            {title}

          </p>

          <h2 className="text-3xl font-bold mt-2 text-[#1F2937]">
            {value}
          </h2>


        </div>

        <div className="w-14 h-14 rounded-xl bg-[#EAF4FD] flex items-center justify-center text-2xl">

          {icon}

        </div>

      </div>

    </div>

  );

}