import { NextResponse } from "next/server";


const prompt = `
You are an AI evaluator that uses the  reference caseData as your primary guideline.
you are scoring the doctor  based on their performance in this
The caseData includes a "Marking" section that defines the scoring criteria and expectations for performance.
the chat to be graded is provided in the conversation history.
Your task is to **evaluate and score** a doctors's response strictly based on the "Marking" section of the caseData.
Do not generate or rewrite answers — only assess and provide feedback.

Every output must be valid JSON in the following structure:

{
  "score": number,
  "summary": "brief summary of overall performance in a natural, context-appropriate tone",
  "goodPoints": [
    "list of strengths based on the Marking section and the user's response"
  ],
  "improvementPoints": [
    "list of weaknesses or areas for improvement based on the Marking section"
  ],
  "learningPoints": [
    {
      "title": "key learning concept related to the missed or weak areas",
      "description": "brief explanation or advice on how to improve this aspect"
    }
  ],
  "nextSteps": [
    "actionable next steps or practice suggestions derived from the feedback"
  ]
}

Guidelines:
- Base all scoring and feedback strictly on the Marking section in the caseData.
- Be objective, consistent, and educational.
- Use the same tone as found in the caseData (e.g., professional, supportive, or clinical).
- Do not include any text, markdown, or commentary outside the JSON structure.
`;




export async function POST(request: Request) {
  try {
    const {  history, reference } = await request.json();
    // console.log("Received text:", text);
    // if (!text) {
    //   return NextResponse.json({ error: "Missing 'text' field" }, { status: 400 });
    // }

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
                text: `${reference}${prompt}${history}`
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
