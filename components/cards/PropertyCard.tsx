type PropertyCardProps = {
  
  id: number;
  name: string;
  owner: string;
  address: string;
  status: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};
export default function PropertyCard({
  id,
  name,
  owner,
  address,
  status,
  onView,
  onEdit,
  onDelete,
  
}: PropertyCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border">

      <div className="flex justify-between items-start">

        <div>
          <h2 className="text-2xl font-bold">
            {name}
          </h2>

          <p className="text-gray-500 mt-1">
            📍 {address}
          </p>
        </div>

        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
          {status}
        </span>

      </div>

      <div className="mt-6">

        <p>
          <strong>Owner:</strong> {owner}
        </p>

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
  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition"
>
  Edit
</button>
        <button
  onClick={onDelete}
  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
>
  Delete
</button>

      </div>

    </div>
  );
}