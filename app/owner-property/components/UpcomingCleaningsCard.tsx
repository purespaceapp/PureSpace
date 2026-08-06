type Props = {
  schedules: any[];
  employees: any[];
};

export default function UpcomingCleaningsCard({
  schedules,
  employees,
}: Props) {

  const upcoming = schedules.filter(
    (s) => s.status !== "Completed"
  );

  return (

    <div className="bg-white rounded-3xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">

        🧹 Upcoming Cleanings

      </h2>

      {upcoming.length === 0 ? (

        <div className="text-center py-10 text-gray-500">

          No upcoming cleanings.

        </div>

      ) : (

        <div className="space-y-5">

          {upcoming.map((schedule) => {

            const employee =
              employees.find(
                (e) =>
                  e.id === schedule.employee_id
              );

            return (

              <div
                key={schedule.id}
                className="border-l-4 border-yellow-400 pl-5 py-2"
              >

                <div className="flex justify-between">

                  <div>

                    <h3 className="font-bold text-lg">

                      📅 {schedule.cleaning_date}

                    </h3>

                    <p className="text-gray-500">

                      👤 {employee?.name}

                    </p>

                  </div>

                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">

                    {schedule.status}

                  </span>

                </div>

              </div>

            );

          })}

        </div>

      )}

    </div>

  );

}