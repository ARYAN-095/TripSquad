import { useEffect, useState } from "react";
import { fetchItineraries } from "../services/itineraries";
import type { IItinerary } from "../types";
import { Link } from "react-router-dom";

export default function ItineraryList() {
  const [its, setIts] = useState<IItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItineraries()
      .then(setIts)
      .catch((err) => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading itineraries…</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (its.length === 0)
    return (
      <p>
        No itineraries yet. <Link to="/create">Create one</Link>.
      </p>
    );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl mb-4">Your Trips</h1>
      <ul>
        {its.map((it) => (
          <li key={it._id} className="border p-3 mb-2 rounded hover:bg-gray-50">
            <Link to={`/itineraries/${it._id}`} className="block">
              <h2 className="text-xl">{it.name}</h2>
              <p className="text-sm text-gray-600">
                Created on {new Date(it.createdAt).toLocaleDateString()}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
