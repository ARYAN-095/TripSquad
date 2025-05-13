import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchItinerary,
  addItineraryItem,
  voteItineraryItem,
} from "../services/itineraries";
import type { IItinerary, IItineraryItem } from "../types";

export default function ItineraryDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [itinerary, setItinerary] = useState<IItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newItem, setNewItem] = useState({
    title: "",
    date: "",
    locationName: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Load itinerary
  useEffect(() => {
    if (!id) return;
    fetchItinerary(id)
      .then(setItinerary)
      .catch((err: Error) =>
        setError(
          err instanceof Error ? err.message : "Failed to load itinerary"
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  // Handle adding a new item
  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !newItem.title || !newItem.date) return;
    setSubmitting(true);
    try {
      const updatedItems = await addItineraryItem(id, newItem);
      setItinerary((it) => it && { ...it, items: updatedItems });
      setNewItem({ title: "", date: "", locationName: "" });
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not add item");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle vote toggle
  const handleVote = async (itemId: string) => {
    if (!id) return;
    try {
      const updated = await voteItineraryItem(id, itemId);
      setItinerary((it) =>
        it
          ? {
              ...it,
              items: it.items.map((itm) =>
                itm._id === updated._id ? updated : itm
              ),
            }
          : it
      );
    } catch {
      alert("Could not vote. Try again.");
    }
  };

  if (loading) return <p>Loading trip…</p>;
  if (error || !itinerary) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{itinerary.name}</h1>
      {itinerary.description && (
        <p className="text-gray-700 mb-4">{itinerary.description}</p>
      )}

      <section className="mb-8">
        <h2 className="text-2xl mb-2">Itinerary Items</h2>
        {itinerary.items.length === 0 && <p>No items yet.</p>}
        <ul>
          {itinerary.items.map((item) => {
            const hasVoted = item.votes.includes(user!._id);
            return (
              <li
                key={item._id}
                className="flex justify-between items-center border p-3 mb-2 rounded"
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(item.date).toLocaleDateString()}{" "}
                    {item.locationName && `— ${item.locationName}`}
                  </p>
                </div>
                <button
                  onClick={() => handleVote(item._id)}
                  className={`px-3 py-1 rounded ${
                    hasVoted ? "bg-green-500 text-white" : "bg-gray-200"
                  }`}
                >
                  👍 {item.votes.length}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl mb-2">Add New Item</h2>
        <form onSubmit={handleAddItem} className="space-y-2">
          <input
            type="text"
            placeholder="Title"
            value={newItem.title}
            onChange={(e) =>
              setNewItem((ni) => ({ ...ni, title: e.target.value }))
            }
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="date"
            value={newItem.date}
            onChange={(e) =>
              setNewItem((ni) => ({ ...ni, date: e.target.value }))
            }
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Location (optional)"
            value={newItem.locationName}
            onChange={(e) =>
              setNewItem((ni) => ({ ...ni, locationName: e.target.value }))
            }
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {submitting ? "Adding…" : "Add Item"}
          </button>
        </form>
      </section>
    </div>
  );
}
