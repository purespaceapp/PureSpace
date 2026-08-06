type Props = {
  receipts: any[];
};

export default function ReceiptsCard({
  receipts,
}: Props) {

  const approved =
    receipts.filter(
      (r) => r.status === "Approved"
    );

  return (

    <div className="bg-white rounded-3xl shadow-lg p-6">

      <h2 className="text-2xl font-bold mb-6">

        🧾 Approved Receipts

      </h2>

      {approved.length === 0 ? (

        <div className="text-center py-10 text-gray-500">

          No approved receipts.

        </div>

      ) : (

        <div className="space-y-4">

          {approved.map((receipt) => (

            <div
              key={receipt.id}
              className="border rounded-2xl p-4 flex justify-between items-center"
            >

              <div>

                <h3 className="font-semibold">

                  {receipt.purchase_date}

                </h3>

                <p className="text-gray-500">

                  ${receipt.amount}

                </p>

              </div>

              <a
                href={receipt.receipt_photo}
                target="_blank"
                className="bg-[#2E7BBE] text-white px-4 py-2 rounded-xl"
              >

                View Receipt

              </a>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}