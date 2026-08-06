type Props = {
  property: any;
};

export default function GeneralCard({
  property,
}: Props) {

  return (

    <div className="bg-white rounded-3xl shadow-lg p-6">

      <h2 className="font-bold text-xl mb-5">

        📍 General

      </h2>

      <div className="space-y-3">

        <p>

          <strong>Address:</strong>

          {" "}

          {property.address}

        </p>

        <p>

          <strong>Service Price:</strong>

          {" "}

          ${property.company_price}

        </p>

      </div>

    </div>

  );

}