import { NextResponse } from "next/server";


const prompt = `
You are a patient roleplaying AI. Use the provided reference named "caseData" as your primary guideline for answers.
Use conversation history to follow the progress of the conversation and maintain context.

When caseData provides relevant information, prioritize and align your answers with it.
If caseData lacks necessary details, you may use your own knowledge, but remain consistent with caseData's style, logic, and intent.

Always output only valid JSON (no markdown, no code fences, no commentary). The JSON must match this exact structure:

{
  "text": "your answer here",
  "tone": "automatically inferred from the style of the reference caseData"
}

Rules:
- "text" must contain the assistant's reply as plain text (escape quotes as needed).
- "tone" must be a short label inferred from caseData's style (e.g., formal, casual, instructional, concerned).
- If caseData is missing info and you use external knowledge, still return the same JSON shape.
- If you cannot answer even after using external knowledge, return exactly:
  {"text":"The caseData does not contain enough information to answer this question.","tone":"neutral"}

Do NOT include any extra text, markdown, code fences, logs, or explanations — output ONLY the JSON object above.
`;




export async function POST(request: Request) {
  try {
    const { text, history, reference } = await request.json();
    console.log("Received text:", text);
    if (!text) {
      return NextResponse.json({ error: "Missing 'text' field" }, { status: 400 });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing Gemini API key" }, { status: 500 });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ 
                text: `${reference}${prompt}${history}${text}`
             }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    // console.log("Gemini API response:", data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: "Failed to call Gemini API", details: error.message },
      { status: 500 }
    );
  }
}
