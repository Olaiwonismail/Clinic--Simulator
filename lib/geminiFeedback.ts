export async function generateGeminiFeedback( messages:any, reference:any) {
  reference = 'caseData = ' + reference;
  

  try {
    const res = await fetch("/api/gemini-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: messages, reference: reference }),
    });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();

    // Extract raw text safely
    let rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.text ||
      '{"score":0,"summary":"No response generated.","goodPoints":[],"improvementPoints":[],"learningPoints":[],"nextSteps":[]}';

    // Clean up unwanted characters (like Markdown fences)
    rawText = rawText.replace(/`+/g, "").trim();

    // Remove accidental "json" prefix
    if (rawText.toLowerCase().startsWith("json")) {
      rawText = rawText.slice(4).trim();
    }

    // Parse as JSON (fall back to safe default if parsing fails)
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        score: 0,
        summary: "Invalid JSON format received from Gemini.",
        goodPoints: [],
        improvementPoints: [],
        learningPoints: [],
        nextSteps: [],
      };
    }

    // Log and return
    console.log("Parsed Gemini response:", parsed);
    return parsed;
  } catch (error) {
    console.error("Error fetching Gemini response:", error);
    return {
      score: 0,
      summary: "An error occurred while generating a response.",
      goodPoints: [],
      improvementPoints: [],
      learningPoints: [],
      nextSteps: [],
    };
  }
}
