import { NextResponse } from "next/server";
import { Writable } from "stream";
import wav from "wav";

// Fallback: pre-recorded "TTS unavailable" audio in base64 (1–2 seconds)
const FALLBACK_WAV_BASE64 = 
  "UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA="; 
// (This is just a tiny silent WAV placeholder; replace with actual message if needed)

async function pcmToWavBuffer(pcmBuffer: Buffer, sampleRate = 24000) {
  const chunks: Buffer[] = [];
  const writer = new wav.Writer({
    channels: 1,
    sampleRate,
    bitDepth: 16,
  });
  const writable = new Writable({
    write(chunk, _encoding, next) {
      chunks.push(chunk);
      next();
    },
  });
  writer.pipe(writable);
  writer.write(pcmBuffer);
  writer.end();

  await new Promise((resolve) => writable.on("finish", resolve));
  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": 
          process.env.GEMINI_API_KEY!,
          // "AIzaSyD9b0rX5Y1K3n1N4x5Y1K3n1N4x5Y1K3n1N4sswsx", // Temporary key for testing
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } },
          },
          model: "gemini-2.5-flash-preview-tts",
        }),
      }
    );

    const data = await res.json();
    console.log("TTS response:", data);

    const base64PCM = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    let wavBuffer: Buffer;
    if (base64PCM) {
      const pcmBuffer = Buffer.from(base64PCM, "base64");
      wavBuffer = await pcmToWavBuffer(pcmBuffer);
    } else {
      console.warn("TTS failed, using fallback audio");
      wavBuffer = Buffer.from(FALLBACK_WAV_BASE64, "base64");
    }

    return new NextResponse(wavBuffer, { headers: { "Content-Type": "audio/wav" } });
  } catch (err) {
    console.error("TTS error:", err);
    const fallbackBuffer = Buffer.from(FALLBACK_WAV_BASE64, "base64");
    return new NextResponse(fallbackBuffer, { headers: { "Content-Type": "audio/wav" } });
  }
}
