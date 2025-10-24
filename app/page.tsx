"use client"

import CaseSelection from "@/components/case-selection"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  const handleCaseSelect = (caseData: any) => {
    // Store case data in sessionStorage for the simulation page
    sessionStorage.setItem("selectedCase", JSON.stringify(caseData))
    router.push("/simulation")
  }

  return (
    <main className="min-h-screen bg-background">
      <CaseSelection onSelectCase={handleCaseSelect} />
    </main>
  )
}
