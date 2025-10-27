import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function ExpenseTab({ currentTrip, setCurrentTrip, trips, setTrips }) {
  const [payer, setPayer] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [splitOption, setSplitOption] = useState("split_equally"); // new dropdown state
  const [error, setError] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);


  const handlePayerChange = (e) => {
    const selectedPayer = e.target.value;
    setPayer(selectedPayer);

    // Automatically select the payer as part of selected members
    if (selectedPayer && !selectedMembers.includes(selectedPayer)) {
      setSelectedMembers([...selectedMembers, selectedPayer]);
    }
  };

  const handleMemberSelection = (member) => {
    // Prevent removing the payer from the members
    if (member === payer) return;
    if (selectedMembers.includes(member)) {
      setSelectedMembers(selectedMembers.filter((m) => m !== member));
    } else {
      setSelectedMembers([...selectedMembers, member]);
    }
  };

  const addExpense = () => {
    if (!payer || !amount || selectedMembers.length === 0) {
      setError("Please fill all fields and select members involved.");
      return;
    }

    const expense = {
      id: Date.now(),
      payer,
      amount: parseFloat(amount),
      description,
      members: selectedMembers,
      perHead: parseFloat((amount / selectedMembers.length).toFixed(2)),
      splitOption, 
      date: expenseDate,
    };

    const updatedTrip = {
      ...currentTrip,
      expenses: [...(currentTrip.expenses || []), expense],
    };
    setExpenseDate(new Date().toISOString().split('T')[0]);

    setCurrentTrip(updatedTrip);
    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));

    // Reset inputs
    setPayer("");
    setAmount("");
    setDescription("");
    setSelectedMembers([]);
    setSplitOption("split_equally");
    setError("");
  };

  const deleteExpense = (id) => {
    const updatedTrip = {
      ...currentTrip,
      expenses: (currentTrip.expenses || []).filter((e) => e.id !== id),
    };
    setCurrentTrip(updatedTrip);
    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-800">💸 Group Expenses</h3>

      {/* Add Expense */}
      <div className="space-y-4 border-b border-gray-300 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            value={payer}
            onChange={handlePayerChange}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select who paid</option>
            {currentTrip.members.map((member, idx) => (
              <option key={idx} value={member}>
                {member}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount paid"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
          <input
  type="date"
  value={expenseDate}
  onChange={(e) => setExpenseDate(e.target.value)}
  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
/>
        </div>

        <input
          type="text"
          placeholder="Description (e.g., Dinner at cafe)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />

        {payer && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              How should this be split?
            </label>
            <select
              value={splitOption}
              onChange={(e) => setSplitOption(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="split_equally">Split Equally</option>
              <option value="they_owe_you">{`${payer} paid — others owe them`}</option>
              <option value="you_owe_them">{`You owe ${payer}`}</option>
            </select>
          </div>
        )}

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Select Members Involved:
          </p>
          <div className="flex flex-wrap gap-2">
            {currentTrip.members.map((member, idx) => (
              <button
                key={idx}
                onClick={() => handleMemberSelection(member)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  selectedMembers.includes(member)
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                } ${
                  member === payer
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {member}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={addExpense}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>

      {/* Expenses List */}
      <div>
        <h4 className="text-xl font-semibold text-gray-800 mb-4">Expense History</h4>
        {(currentTrip.expenses || []).length === 0 ? (
          <p className="text-gray-600">No expenses added yet.</p>
        ) : (
          <div className="space-y-3">
            {currentTrip.expenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start"
              >
                <div>
                  <h5 className="font-bold text-gray-800">{exp.description}</h5>
                  <p className="text-sm text-gray-700">
                    Paid by <strong>{exp.payer}</strong> (${exp.amount})
                  </p>
                  <p className="text-sm text-gray-600">
                    Split among: {exp.members.join(", ")}
                  </p>
                  <p className="text-sm text-indigo-700 font-semibold">
                    Each owes: ${exp.perHead}
                  </p>
                  <p className="text-sm text-gray-600">
  Date: {new Date(exp.date).toLocaleDateString()}
</p>
                </div>
                <button
                  onClick={() => deleteExpense(exp.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
