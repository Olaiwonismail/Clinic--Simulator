import { NextResponse } from "next/server";
import wav from "wav";
import { Writable } from "stream";

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
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
            },
          },
          model: "gemini-2.5-flash-preview-tts",
        }),
      }
    );

    const data = await res.json();
    const base64Audio = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data");

    const pcmBuffer = Buffer.from(base64Audio, "base64");

    // Convert PCM to WAV using 'wav' writer
    const chunks: Buffer[] = [];
    const writer = new wav.Writer({
      channels: 1,
      sampleRate: 24000,
      bitDepth: 16,
    });
    const writable = new Writable({
      write(chunk, _enc, next) {
        chunks.push(chunk);
        next();
      },
    });
    writer.pipe(writable);
    writer.write(pcmBuffer);
    writer.end();

    await new Promise((r) => writable.on("finish", r));
    const wavBuffer = Buffer.concat(chunks);

    return new NextResponse(wavBuffer, {
      headers: { "Content-Type": "audio/wav" },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 });
  }
}
