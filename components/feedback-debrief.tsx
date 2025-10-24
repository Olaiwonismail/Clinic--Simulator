"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Lightbulb, ArrowLeft } from "lucide-react"

interface FeedbackDebriefProps {
  data: any
  onBackToCases: () => void
}

export default function FeedbackDebrief({ data, onBackToCases }: FeedbackDebriefProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#d2e3fc] to-[#fad2ce] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Button onClick={onBackToCases} variant="ghost" className="mb-6 text-primary hover:bg-primary/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cases
        </Button>

        {/* Score Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-r from-primary to-secondary p-8 text-center">
            <p className="text-primary-foreground/80 text-sm font-semibold mb-2">OVERALL PERFORMANCE</p>
            <div className="text-6xl font-bold text-primary-foreground mb-2">{data.score}%</div>
            <p className="text-primary-foreground/80">Excellent work, Doctor. Well done on your consultation.</p>
          </div>
        </Card>

        {/* Feedback Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* What You Did Well */}
          <Card className="p-6 border-l-4 border-l-green-500 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-foreground">What You Did Well</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Systematic history-taking covering key characteristics",
                "Efficient identification of red flags",
                "Excellent rapport building with patient",
                "Clear communication and empathy",
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-foreground">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Areas for Improvement */}
          <Card className="p-6 border-l-4 border-l-amber-500 border-0 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold text-foreground">Areas for Improvement</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Did not ask about past medical history of migraines",
                "Missed opportunity to perform neurological exam",
                "Could have discussed stress management techniques",
                "Consider SNOOP mnemonic for red flag assessment",
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-foreground">
                  <span className="text-amber-500 font-bold">!</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Learning Points */}
        <Card className="p-6 mb-8 bg-accent/10 border-accent border-0 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-secondary" />
            <h2 className="text-xl font-bold text-foreground">Key Learning Points</h2>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1. Comprehensive History Taking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Always establish a baseline history for the presenting complaint. For headaches, ask about frequency,
                duration, and past episodes. This helps differentiate between primary and secondary headaches.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">2. Red Flag Recognition</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Remember the SNOOP mnemonic: Systemic symptoms, Neoplasm history, Onset (sudden), Older age, Pattern
                change, Positional, Papilledema, Progressive, Postural, Pathological. You did well identifying the
                absence of these in this case.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">3. Holistic Management</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For tension headaches with psychosocial triggers, management should include both pharmacological and
                non-pharmacological approaches. Stress management, lifestyle modifications, and patient education are
                crucial components.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Items */}
        <Card className="p-6 mb-8 border-0 shadow-md">
          <h2 className="text-xl font-bold text-foreground mb-4">Suggested Next Steps</h2>
          <ul className="space-y-2">
            {[
              "Review the SNOOP mnemonic for headache assessment",
              "Practice neurological examination techniques",
              "Study tension headache management guidelines",
              "Try another case to reinforce these learning points",
            ].map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-foreground">
                <span className="text-primary font-bold">{idx + 1}.</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button onClick={onBackToCases} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            Try Another Case
          </Button>
          <Button variant="outline" className="flex-1 border-border text-foreground hover:bg-muted bg-transparent">
            Download Report
          </Button>
        </div>
      </div>
    </div>
  )
}
