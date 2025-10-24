import { NextResponse } from "next/server";

const caseData = `caseData:
Station 14: Telephone consultation

Patient’s name: Ciaran O’Sullivan

Age: 4-years, 2 months-old male

Past medical history:
Born through normal vagina delivery
Otitis media 9 months ago, treated with PO amoxicillin

Drug history:
No known drug allergy
Not on any current medication

Recent notes/ consultation:
9 months ago – seen by Nurse Kate Wilton (Nurse Access role):
Second dose of MMR vaccine given
Advised to book a separate appointment for 4-in-1 pre-school booster

Caller: Mother – Siohban Donnelly
Reason for Appointment: Booked to discuss ongoing concerns regarding Ciaran

Patient’s story (Role Player’s Brief):
You are the mother of Ciaran and are calling to discuss ongoing sleep difficulties.
Ciaran has been struggling with sleep for the past 4–5 weeks. He has trouble falling
asleep and, even when he does, he often wakes up during the night and comes into
your room. This disturbs your sleep as well, which is now becoming a problem.

ONLY SAY BELOW IF ASKED:
Previously, Ciaran had a consistent bedtime of 7pm, but now he doesn’t go to bed
until 10 or even 11pm. He often uses his tablet late at night to watch animations. He
also enjoys fizzy drinks, which he sometimes has in the evening.
You recently received a promotion at work, which means longer and more
demanding hours. Your mum helps look after Ciaran — she picks him up from
nursery, and you collect him from her place on your way home from work. Ciaran
has just started nursery.
The only major change recently is your increased work commitment, with early starts
and late finishes. You’re a single parent and are trying hard to build a better future for
Ciaran.

Social history:
You live at home with Ciaran (no one else in the household)

Pregnancy, Birth, Immunisation, nutrition and development:
Born at term, no complications. Immunisations up to date (except pending pre-school booster). Eating and developing well

Respond “NO” to any other symptom enquiries

Idea:
You think Ciaran has insomnia

Concerns:
You are worried because his sleep is affecting your own rest and functioning

Expectations:
You would like Ciaran to be prescribed sleeping tablets.
If asked directly about your own wellbeing, mention that you feel stressed, anxious, and low in mood

Questions for the doctor:
If the doctor refuses to prescribe sleeping tablets, you ask:
"Can I try Piriton? My friend’s child was given it for eczema, and it helped them sleep."
`;
const prompt = `
you are to roleplay patient.
You are an AI assistant that uses an  reference caseData as your primary guideline when answering.
When the caseData provides relevant information, your answers must align with it.
If the caseData does not contain enough information, you may use your own knowledge — but always stay consistent with the caseData’s style, logic, and intent.

Every response must be formatted in the following structure:

{
  "text": "your answer here",
  "tone": "automatically inferred from the style of the reference caseData"
}

The AI must analyze the caseData to detect the tone and use that tone in its reply.
Do not include any extra text, markdown, or commentary — only return in this exact format

{
  "text": "your answer here",
  "tone": "automatically inferred from the style of the reference caseData"
}

`;


export async function POST(request: Request) {
  try {
    const { text } = await request.json();
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
                text: `${caseData}${prompt}${text}`
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
