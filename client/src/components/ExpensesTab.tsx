import { useState, FormEvent } from "react";
import type { IExpense, ISplit, IItinerary, ICollaborator } from "../types";
import { addExpense, updateExpense, deleteExpense } from "../services/itineraries";
import { useAuth } from "../context/AuthContext";

interface Props {
  itinerary: IItinerary;
  setItinerary: (it: IItinerary) => void;
}

export default function ExpensesTab({ itinerary, setItinerary }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    description: "",
    amount: 0,
    splits: itinerary.collaborators
      .filter(c => c.status === "accepted")
      .map(c => ({ user: c.user._id, share: 0 } as ISplit)),
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const updatedExpenses = await addExpense(itinerary._id, form);
      setItinerary({ ...itinerary, expenses: updatedExpenses });
      // reset
      setForm({
        description: "",
        amount: 0,
        splits: form.splits.map(s => ({ ...s, share: 0 })),
      });
    } catch (err: any) {
      alert(err.response?.data?.message || "Error adding expense");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    await deleteExpense(itinerary._id, id);
    setItinerary({
      ...itinerary,
      expenses: itinerary.expenses.filter(exp => exp._id !== id),
    });
  };

  // (You could add update functionality similarly with updateExpense)

  return (
    <div>
      <h2 className="text-2xl mb-4">Expenses</h2>

      {/* List */}
      <ul className="mb-6">
        {itinerary.expenses.map((exp: IExpense) => (
          <li key={exp._id} className="border p-3 mb-2 rounded">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{exp.description}</p>
                <p className="text-sm text-gray-600">
                  Paid by {exp.paidBy.name} on{" "}
                  {new Date(exp.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-1">Amount: ₹{exp.amount.toFixed(2)}</p>
                <ul className="mt-1">
                  {exp.splits.map(s => (
                    <li key={s.user}>
                      {itinerary.collaborators.find(c => c.user._id === s.user)?.user.name}
                      : ₹{s.share.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              {exp.paidBy._id === user!._id && (
                <button
                  onClick={() => handleDelete(exp._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="space-y-2 max-w-md">
        <h3 className="text-xl">Add New Expense</h3>
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) }))}
          className="w-full p-2 border rounded"
          required
        />

        <div>
          <p className="font-medium mb-1">Split Among:</p>
          {form.splits.map((s, idx) => (
            <div key={s.user} className="flex items-center mb-1">
              <label className="w-32">
                {
                  itinerary.collaborators.find(c => c.user._id === s.user)?.user.name
                }
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Share"
                value={s.share}
                onChange={e => {
                  const share = parseFloat(e.target.value);
                  setForm(f => {
                    const splits = [...f.splits];
                    splits[idx] = { ...splits[idx], share };
                    return { ...f, splits };
                  });
                }}
                className="flex-1 p-1 border rounded"
                required
              />
            </div>
          ))}
        </div>

        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
          Add Expense
        </button>
      </form>
    </div>
  );
}
