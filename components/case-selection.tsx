"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Clock, Stethoscope, Plus, MoreVertical } from "lucide-react"

interface CaseSelectionProps {
  onSelectCase: (caseData: any) => void
}

  

export default function CaseSelection({ onSelectCase }: CaseSelectionProps) {
  const [cases, setCases] = useState([])
      const fetchCases = async () => {
      try {
        const res = await fetch("/api/cases");
        const data = await res.json();
        setCases(data);
      } catch (error) {
        console.error("Error fetching cases:", error);
      }
    };


  useEffect(() => {
    fetchCases();
  }, []);
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCase, setEditingCase] = useState<any>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    patient: "",
    age: "",
    gender: "",
    duration: "",
    difficulty: "Beginner",
    description: "",
    reference: "",
    color: "from-[#4185f3] to-[#5b9eff]",
  })

  const handleAddClick = () => {
    setEditingCase(null)
    setFormData({
      title: "",
      patient: "",
      age: "",
      gender: "",
      duration: "",
      difficulty: "Beginner",
      description: "",
      reference: "",
      color: "from-[#4185f3] to-[#5b9eff]",
    })
    setShowAddModal(true)
  }

  const handleEditClick = (caseItem: any) => {
    setEditingCase(caseItem)
    setFormData(caseItem)
    setShowAddModal(true)
    setOpenMenuId(null)
  }

  const handleDeleteClick = async (id: number) => {
  try {
    const res = await fetch(`/api/cases/${id}`, { method: "DELETE" });
    if (!res.ok) {throw new Error("Failed to delete case");}
     await fetchCases();
    setCases((prev) => prev.filter((c) => c.id !== id));
    setOpenMenuId(null);
  } catch (error) {
    console.error("Error deleting case:", error);
  }
};

  const handleSaveCase = async () => {
  try {
    const method = editingCase ? "PUT" : "POST";
    const id = editingCase?.id || editingCase?._id;
    const url = editingCase
      ? `/api/cases/${id}`
      : "/api/cases";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
  const errText = await res.text();
  throw new Error(`Failed to save case: ${res.status} ${errText}`);
}

    const updatedCase = await res.json();

    if (editingCase) {
      setCases((prev) =>
        prev.map((c) => (c.id === editingCase.id ? updatedCase : c))
      );
    } else {
      setCases((prev) => [...prev, updatedCase]);
    }
     await fetchCases();
    setShowAddModal(false);
    setEditingCase(null);
  } catch (error) {
    console.error("Error saving case:", error);
  }
};


  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Clinical Simulator</h1>
            </div>
            <p className="text-muted-foreground text-lg">Select a case to begin your clinical encounter training</p>
          </div>
          <Button
            onClick={handleAddClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            title="Add new case"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseItem) => (
            <div key={caseItem.id} className="relative">
              <Card
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group border-0"
                onClick={() => onSelectCase(caseItem)}
              >
                {/* Case Header with Gradient */}
                <div className={`h-24 bg-gradient-to-r ${caseItem.color} p-4 flex flex-col justify-end`}>
                  <h2 className="text-xl font-bold text-white">{caseItem.title}</h2>
                </div>

                {/* Case Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-muted-foreground">PATIENT</p>
                    <p className="text-lg font-semibold text-foreground">{caseItem.patient}</p>
                    <p className="text-sm text-muted-foreground">
                      {caseItem.age} years old • {caseItem.gender}
                    </p>
                  </div>

                  <p className="text-sm text-foreground mb-4 leading-relaxed">{caseItem.description}</p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{caseItem.duration}</span>
                    </div>
                    <div className="px-2 py-1 bg-accent/20 rounded text-xs font-medium text-accent-foreground">
                      {caseItem.difficulty}
                    </div>
                  </div>

                  {/* Button */}
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-md transition-all"
                    onClick={() => onSelectCase(caseItem)}
                  >
                    Start Case
                  </Button>
                </div>
              </Card>

              <div className="absolute top-4 right-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuId(openMenuId === caseItem.id ? null : caseItem.id)
                  }}
                  className="p-2 rounded-lg bg-white/90 hover:bg-white shadow-md transition-all"
                >
                  <MoreVertical className="w-4 h-4 text-foreground" />
                </button>

                {openMenuId === caseItem.id && (
                  <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border border-border z-10 min-w-32">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(caseItem)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors border-b border-border"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(caseItem._id)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto border-0">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">{editingCase ? "Edit Case" : "Add New Case"}</h2>

              <div className="space-y-4">
                

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-1">Case Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Chest Pain"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-1">Patient Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Mr. James Smith"
                    value={formData.patient}
                    onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1">Age</label>
                    <input
                      type="text"
                      placeholder="e.g., 58"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="e.g., 15 min"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-foreground block mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-foreground block mb-1">Description</label>
                  <textarea
                    placeholder="e.g., Acute onset chest pain with dyspnea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm h-20 resize-none bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

        {/* Reference field - shown only in add/edit */}
                <div>
                  <label className="text-sm font-semibold text-foreground block mb-1">Reference</label>
                  <textarea
                    // type="multi text"
                    placeholder="e.g., CHEST-001"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-input focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveCase}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {editingCase ? "Update Case" : "Add Case"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
