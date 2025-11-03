import React, { useState } from "react";
import { Plus, Trash2, DollarSign, Calendar, Users } from "lucide-react";

export default function ExpenseTab({ currentTrip, setCurrentTrip, trips, setTrips }) {
  const [payer, setPayer] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [splitOption, setSplitOption] = useState("split_equally");
  const [error, setError] = useState("");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const handlePayerChange = (e) => {
    const selectedPayer = e.target.value;
    setPayer(selectedPayer);
    if (selectedPayer && !selectedMembers.includes(selectedPayer)) {
      setSelectedMembers([...selectedMembers, selectedPayer]);
    }
  };

  const handleMemberSelection = (member) => {
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

  const totalExpenses = (currentTrip.expenses || []).reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="w-full">

        {/* Add Expense Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-indigo-100">
          <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Plus className="text-indigo-600" size={24} />
            Add New Expense
          </h4>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who Paid?
                </label>
                <select
                  value={payer}
                  onChange={handlePayerChange}
                  className="w-full p-3 pl-4 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white hover:border-indigo-300"
                >
                  <option value="">Select payer</option>
                  {currentTrip.members.map((member, idx) => (
                    <option key={idx} value={member}>
                      {member}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-indigo-300"
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-indigo-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g., Dinner at The Italian Place"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-indigo-300"
              />
            </div>

            {payer && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Split Method
                </label>
                <select
                  value={splitOption}
                  onChange={(e) => setSplitOption(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-white hover:border-indigo-300"
                >
                  <option value="split_equally">Split Equally</option>
                  <option value="they_owe_you">{`${payer} paid — others owe them`}</option>
                  <option value="you_owe_them">{`You owe ${payer}`}</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Users size={18} />
                Select Members Involved
              </label>
              <div className="flex flex-wrap gap-2">
                {currentTrip.members.map((member, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleMemberSelection(member)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                      selectedMembers.includes(member)
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } ${
                      member === payer
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={member === payer}
                  >
                    {member}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={addExpense}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add Expense
            </button>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          <h4 className="text-xl font-semibold text-gray-800 mb-6">Expense History</h4>
          {(currentTrip.expenses || []).length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="text-gray-400" size={40} />
              </div>
              <p className="text-gray-500 text-lg">No expenses added yet</p>
              <p className="text-gray-400 text-sm mt-2">Add your first expense to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentTrip.expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-6 border-2 border-gray-100 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all hover:border-indigo-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-bold text-gray-900 text-lg">{exp.description || "Untitled Expense"}</h5>
                        <span className="text-2xl font-bold text-indigo-600">${exp.amount.toFixed(2)}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                            Paid by {exp.payer}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <Users size={16} className="text-gray-400" />
                          <span>Split among:</span>
                          {exp.members.map((member, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                              {member}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                            ${exp.perHead} per person
                          </span>
                          <span className="text-gray-500 flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}