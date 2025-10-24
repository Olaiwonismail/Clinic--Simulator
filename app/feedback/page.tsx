"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import FeedbackDebrief from "@/components/feedback-debrief"

export default function FeedbackPage() {
  const router = useRouter()
  const [simulationData, setSimulationData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const data = sessionStorage.getItem("simulationData")
    if (data) {
      setSimulationData(JSON.parse(data))
      setIsLoading(false)
    } else {
      router.push("/")
    }
  }, [router])

  const handleBackToCases = () => {
    sessionStorage.removeItem("selectedCase")
    sessionStorage.removeItem("simulationData")
    router.push("/")
  }

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-background">
      {simulationData && <FeedbackDebrief data={simulationData} onBackToCases={handleBackToCases} />}
    </main>
  )
}
