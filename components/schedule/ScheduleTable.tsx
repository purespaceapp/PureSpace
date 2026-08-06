export default function ScheduleTable() {

  const cleanings = [

    {
      property: "Downtown Condo",
      employee: "Emily",
      checkout: "11:00 AM",
      before: "3:00 PM",
      status: "Assigned",
    },

    {
      property: "Lake Airbnb",
      employee: "Jessica",
      checkout: "10:00 AM",
      before: "2:00 PM",
      status: "Assigned",
    },

  ];

  return (

    <div className="bg-white rounded-2xl shadow p-6">

      <table className="w-full">

        <thead>

          <tr className="border-b text-left">

            <th className="pb-4">Property</th>

            <th>Employee</th>

            <th>Check-out</th>

            <th>Clean Before</th>

            <th>Status</th>

            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {cleanings.map((cleaning,index)=>(

            <tr key={index} className="border-b">

              <td className="py-5">

                {cleaning.property}

              </td>

              <td>

                {cleaning.employee}

              </td>

              <td>

                {cleaning.checkout}

              </td>

              <td>

                {cleaning.before}

              </td>

              <td>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl">

                  {cleaning.status}

                </span>

              </td>

              <td>

                <button className="text-blue-600 hover:underline">

                  Edit

                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}