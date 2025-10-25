export async function generateGeminiResponse(prompt: string,messages:any) {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: prompt, history: messages }),
    });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();

    // Extract the raw text from Gemini's response
    let rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.text ||
      '{"text":"No response generated.","tone":"unknown"}';

    // Parse JSON safely
    
    rawText = rawText.replace(/`+/g, "").trim();

// Optional: remove a leading "json" if it exists
if (rawText.startsWith("json")) {
  rawText = rawText.slice(4).trim();
}

    let parsed: { text: string; tone: string };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { text: rawText, tone: "unknown" };
    }
    console.log("Parsed Gemini response:", parsed);
    return parsed;
  } catch (error) {
    console.error("Error fetching Gemini response:", error);
    return { text: "An error occurred while generating a response.", tone: "error" };
  }
}
