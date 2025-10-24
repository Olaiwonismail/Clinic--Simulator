"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LiveSimulation from "@/components/live-simulation"

export default function SimulationPage() {
  const router = useRouter()
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const caseData = sessionStorage.getItem("selectedCase")
    if (caseData) {
      setSelectedCase(JSON.parse(caseData))
      setIsLoading(false)
    } else {
      router.push("/")
    }
  }, [router])

  const handleSimulationComplete = (data: any) => {
    sessionStorage.setItem("simulationData", JSON.stringify(data))
    router.push("/feedback")
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-background">
      {selectedCase && <LiveSimulation caseData={selectedCase} onComplete={handleSimulationComplete} />}
    </main>
  )
}
