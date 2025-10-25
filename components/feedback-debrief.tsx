"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Lightbulb, ArrowLeft } from "lucide-react"
import jsPDF from "jspdf"

interface FeedbackDebriefProps {
  data: any
  onBackToCases: () => void
}

export default function FeedbackDebrief({ data, onBackToCases }: FeedbackDebriefProps) {
  const handleDownload = () => {
    const doc = new jsPDF()
    let y = 20

    doc.setFont("helvetica", "bold")
    doc.setFontSize(18)
    doc.text("Feedback Report", 20, y)
    y += 10

    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)

    if (data.score) {
      doc.text(`Overall Performance: ${data.score}%`, 20, y)
      y += 8
      if (data.summary) {
        doc.text(data.summary, 20, y, { maxWidth: 170 })
        y += 12
      }
    }

    const addSection = (title: string, items: string[] | any[]) => {
      if (!items || items.length === 0) return
      doc.setFont("helvetica", "bold")
      doc.text(title, 20, y)
      y += 8
      doc.setFont("helvetica", "normal")
      items.forEach((item: any, idx: number) => {
        if (typeof item === "string") {
          doc.text(`${idx + 1}. ${item}`, 25, y, { maxWidth: 170 })
        } else if (item.title) {
          doc.text(`${idx + 1}. ${item.title}`, 25, y)
          y += 6
          doc.text(item.description || "", 30, y, { maxWidth: 165 })
        }
        y += 8
        if (y > 270) {
          doc.addPage()
          y = 20
        }
      })
      y += 6
    }

    addSection("What You Did Well", data.goodPoints)
    addSection("Areas for Improvement", data.improvementPoints)
    addSection("Key Learning Points", data.learningPoints)
    addSection("Suggested Next Steps", data.nextSteps)

    doc.save("feedback_report.pdf")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#d2e3fc] to-[#fad2ce] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBackToCases} variant="ghost" className="mb-6 text-primary hover:bg-primary/10">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cases
        </Button>

        {/* Score Card */}
        {data.score && (
          <Card className="mb-8 overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-primary to-secondary p-8 text-center">
              <p className="text-primary-foreground/80 text-sm font-semibold mb-2">OVERALL PERFORMANCE</p>
              <div className="text-6xl font-bold text-primary-foreground mb-2">{data.score}%</div>
              <p className="text-primary-foreground/80">{data.summary}</p>
            </div>
          </Card>
        )}

        {/* Feedback Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {data.goodPoints && (
            <Card className="p-6 border-l-4 border-l-green-500 border-0 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-bold text-foreground">What You Did Well</h2>
              </div>
              <ul className="space-y-3">
                {data.goodPoints.map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-foreground">
                    <span className="text-green-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {data.improvementPoints && (
            <Card className="p-6 border-l-4 border-l-amber-500 border-0 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl font-bold text-foreground">Areas for Improvement</h2>
              </div>
              <ul className="space-y-3">
                {data.improvementPoints.map((item: string, idx: number) => (
                  <li key={idx} className="flex gap-3 text-sm text-foreground">
                    <span className="text-amber-500 font-bold">!</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {data.learningPoints && (
          <Card className="p-6 mb-8 bg-accent/10 border-accent border-0 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-secondary" />
              <h2 className="text-xl font-bold text-foreground">Key Learning Points</h2>
            </div>
            <div className="space-y-4">
              {data.learningPoints.map(
                (point: { title: string; description: string }, idx: number) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-foreground mb-2">
                      {idx + 1}. {point.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                )
              )}
            </div>
          </Card>
        )}

        {data.nextSteps && (
          <Card className="p-6 mb-8 border-0 shadow-md">
            <h2 className="text-xl font-bold text-foreground mb-4">Suggested Next Steps</h2>
            <ul className="space-y-2">
              {data.nextSteps.map((item: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-sm text-foreground">
                  <span className="text-primary font-bold">{idx + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="flex gap-4">
          <Button
            onClick={onBackToCases}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Try Another Case
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
          >
            Download Report
          </Button>
        </div>
      </div>
    </div>
  )
}
