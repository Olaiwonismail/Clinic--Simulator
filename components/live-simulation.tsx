"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Clock, User, X, Mic, Volume2 } from "lucide-react"

import { generateGeminiResponse } from "@/lib/geminiClient";
interface LiveSimulationProps {
  caseData: any
  onComplete: (data: any) => void
}

interface Message {
  id: string
  role: "doctor" | "patient"
  content: string
  timestamp: Date
  audioUrl?: string
  tone?: string
}

const mockPatientResponses: Record<string, string> = {
  hello: "Hi Doctor, thanks for seeing me today. I'm really worried about what's going on.",
  "what brings you in":
    "I've been having this terrible chest pain for the last few hours. It started suddenly while I was at work.",
  "chest pain":
    "Yes, it's a sharp pain right here in the center of my chest. It comes and goes, but it's been pretty constant.",
  pain: "It's about 7 out of 10 in terms of severity. I've never felt anything like this before.",
  history: "I have high blood pressure, and I take medication for it. My father had a heart attack when he was 60.",
  medication: "I take lisinopril for my blood pressure. I don't take anything else regularly.",
  smoking: "I used to smoke, but I quit about 5 years ago. I have a desk job, so I'm not very active.",
  default: "Could you tell me more about that? I'm quite anxious about my symptoms.",
}

export default function LiveSimulation({ caseData, onComplete }: LiveSimulationProps) {
  async function getAudioFromText(text: string) {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error("Failed to fetch audio");

    const blob = await res.blob();
    const audio_url = URL.createObjectURL(blob)
    return audio_url
  }
    

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "patient",
      content: `Hello Doctor, I'm ${caseData.patient}. I'm not feeling well today.`,
      timestamp: new Date(),
      audioUrl: "#",
    },
  ])
  const [input, setInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(900)
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getPatientResponse = async (doctorMessage: string): Promise<any> => {
    const lowerMessage = doctorMessage.toLowerCase()
    const result = await generateGeminiResponse(doctorMessage);
    const patientAudio = await getAudioFromText(result.text);
    const audio = new Audio(patientAudio);
    audio.play();
    // console.log(result);
    return result;
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const doctorMessage: Message = {
      id: Date.now().toString(),
      role: "doctor",
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, doctorMessage])
    setInput("")
    setIsLoading(true)

    setTimeout(async () => {
  const patientResponse = await getPatientResponse(input);
  const patientMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: "patient",
    content: patientResponse.text,
    timestamp: new Date(),
    tone: patientResponse.tone,
    audioUrl: "#",
  };

  setMessages((prev) => [...prev, patientMessage]);
  setIsLoading(false);
}, 800);

  }

  const handleStartRecording = async () => {
  try {
    // Check for browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    // 1️⃣ Initialize mic and speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    let finalTranscript = "";

    // 2️⃣ Listen for speech recognition results
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      finalTranscript = transcript.trim();
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();
    mediaRecorder.start();
    setIsRecording(true);

    // 3️⃣ On stop → build message + use transcription
    mediaRecorder.onstop = () => {
  const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
  const audioUrl = URL.createObjectURL(audioBlob);

  recognition.stop(); // Stop recognition but wait for results

  recognition.onend = async () => {
    const transcript = finalTranscript.trim();
    const doctorContent = transcript.length > 0 ? transcript : "[Unrecognized speech]";

    const doctorMessage: Message = {
      id: Date.now().toString(),
      role: "doctor",
      content: doctorContent,
      tone: 'neutral',
      timestamp: new Date(),
      audioUrl,
    };

    setMessages((prev) => [...prev, doctorMessage]);
    setIsLoading(true);

    setTimeout(async () => {
      var patientResponse = await getPatientResponse(doctorContent || "[No speech detected]");
      const patientMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "patient",
        content: patientResponse.text,
        timestamp: new Date(),
        tone: patientResponse.tone,
        audioUrl: "#",
      };
      setMessages((prev) => [...prev, patientMessage]);
      setIsLoading(false);
    }, 800);

    stream.getTracks().forEach((track) => track.stop());
  };
};


    // Capture audio chunks for playback
    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };
  } catch (error) {
    console.error("Error accessing microphone:", error);
  }
};


  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // const handlePlayAudio = (audioUrl: string) => {
  //   if (audioUrl && audioUrl !== "#") {
  //     const audio = new Audio(audioUrl)
  //     audio.play()
  //   }
  // }

  const handleEndSession = () => {
    onComplete({
      caseId: caseData.id,
      messages,
      timeUsed: 900 - timeLeft,
      score: 78,
    })
  }

  const handlePlayAudio = async (message: Message) => {
  try {
    let audioUrl = message.audioUrl;

    // If patient, fetch TTS audio dynamically
    if (message.role === "patient") {
      audioUrl = await getAudioFromText(message.content);
    }

    if (audioUrl && audioUrl !== "#") {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  } catch (error) {
    console.error("Error playing audio:", error);
  }
};


  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{caseData.title}</h1>
              <p className="text-sm text-muted-foreground">
                {caseData.patient} • {caseData.age} years old
              </p>
            </div>
            <div className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-lg border border-accent/30">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-mono font-semibold text-foreground">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "doctor" ? "justify-end" : "justify-start"}`}>
              <div className="flex gap-2 items-end max-w-xs md:max-w-md lg:max-w-lg">
                <div
                  className={`flex-1 px-4 py-3 rounded-lg ${
                    message.role === "doctor"
                      ? "bg-primary text-primary-foreground rounded-br-none shadow-md"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.role === "doctor" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handlePlayAudio(message)}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                    message.role === "doctor"
                      ? "bg-primary/20 hover:bg-primary/30 text-primary"
                      : "bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground"
                  }`}
                  title="Play audio"
                >
                  <Volume2 className="w-4 h-4"  />
                </button>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted text-foreground px-4 py-3 rounded-lg rounded-bl-none">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
 
        {/* Input Area */}
        <div className="border-t border-border bg-card p-4 md:p-6">
          <div className="flex gap-2">
            <Input
              placeholder="Ask the patient a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleSendMessage()
                }
              }}
              disabled={isLoading || timeLeft === 0 || isRecording}
              className="flex-1"
            />
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                disabled={isLoading || timeLeft === 0}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                title="Record audio message"
              >
                <Mic className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleStopRecording}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse"
                title="Stop recording"
              >
                <Mic className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim() || timeLeft === 0 || isRecording}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar - Patient Info */}
      <div className="w-full md:w-80 bg-card border-t md:border-t-0 md:border-l border-border p-4 md:p-6 flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">PATIENT INFORMATION</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-semibold text-foreground">{caseData.patient}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Age</p>
              <p className="font-semibold text-foreground">{caseData.age}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gender</p>
              <p className="font-semibold text-foreground">{caseData.gender}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">ASSESSMENT CHECKLIST</h3>
          <div className="space-y-2">
            {[
              "History of Presenting Complaint",
              "Past Medical History",
              "Medications",
              "Allergies",
              "Social History",
              "Physical Examination",
              "Investigations",
              "Management Plan",
            ].map((item, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border" />
                <span className="text-sm text-foreground">{item}</span>
              </label>
            ))}
          </div>
        </div>

        <Button
          onClick={handleEndSession}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
        >
          <X className="w-4 h-4 mr-2" />
          End Session
        </Button>
      </div>
    </div>
  )
}
