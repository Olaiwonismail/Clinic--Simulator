export async function generateGeminiResponse(prompt: string) {
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: prompt }),
    });

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.json();

    // Extract raw response
    const rawText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.text ||
      '{"text":"No response generated.","tone":"unknown"}';

    // Try to parse the JSON string from Gemini
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { text: rawText, tone: "unknown" };
    }

    console.log("Parsed Gemini response:", parsed);
    return parsed;
  } catch (error) {
    console.error("Error fetching Gemini response:", error);
    return {
      text: "An error occurred while generating a response.",
      tone: "error",
    };
  }
}
