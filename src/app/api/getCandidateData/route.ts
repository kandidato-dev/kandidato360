// pages/api/gpt-response.ts

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, 
});

export async function POST(request: Request) {
  try {
    const { candidateName } = await request.json();

    if (!candidateName) {
      return NextResponse.json(
        { error: 'Candidate name is required.' },
        { status: 400 }
      );
    }

    const prompt = `
You are a political data assistant. Provide a detailed and structured JSON response containing factual information about the following Philippine senatorial candidate.
Generate a structured, neutral profile for ${candidateName}, a Philippine senatorial candidate for the 2025 elections.
If limited public data exists, summarize known political affiliations, party platform (if available), and provide a short generic bio template including possible motivations for candidacy.
Do not hallucinate unsupported accomplishments or legislative history. If sources are unavailable, say "no verifiable record found" rather than "source not found".

🔍 Your response must include:

1. 📘 **Background Information**
2. 📊 **Stances on key social and political issues**
3. 📜 **Laws and bills authored, co-authored, or sponsored**
4. 🎯 **Policy focus areas**

Be specific, factual, and exhaustive. Cite official and reputable sources, and include working URL links only.

---

📌 Social Issues to Cover (in stances):
- Same-sex Marriage
- Death Penalty
- Legalization of Abortion
- Divorce
- Banning of Political Dynasty
- Legalization of Medical Marijuana
- Federalism
- War on Drugs
- SOGIE Bill
- 
---

📜 Laws & Bills:
- Fetch all publicly recorded items as possible
- Pull from both House and Senate sources.
- Include bills even if not enacted.
- Make sure that the law/bill is a public record and credible. Do not make the law/bill wrongly put in the candidate.
- Include title, role (author/co-author/sponsor), summary, bill/law number, current status, and link to official record or credible article.
- Prioritize sources from: https://web.senate.gov.ph/lis/leg_sys.aspx, https://web.senate.gov.ph, Congress.gov.ph
---

🔐 Source Validity Rules:
- Use real URLs only.
- If a real URL cannot be confirmed, write: "Source not found"
- Never invent links.
- Prioritize sources from: https://web.senate.gov.ph/lis/leg_sys.aspx, https://web.senate.gov.ph, Congress.gov.ph, Rappler, Inquirer, GMA News, ABS-CBN, CNN Philippines, official press releases or public documents.

---
Only list laws and bills the candidate is explicitly known to have authored, co-authored, or sponsored. If uncertain or unverified, do not include the item.
If the source = "source URL not found", flag or discard the law
Return the response in this exact JSON structure:

{
  "id": "slugified-name",
  "fullName": "Full Candidate Name",
  "party": "Most recent political party",
  "age": 0,
  "senatorBioLink": "https://web.senate.gov.ph/senators/sen_bio/{senatorName}.asp",
  "background": {
    "educationalBackground": "...",
    "professionalExperience": "...",
    "governmentPositionsHeld": "...",
    "notableAccomplishments": "...",
    "criminalRecords": "...",
    "numberOfLawsAndBillsAuthored": "#"
  },
  "stances": [
    {
      "issue": "Issue Title",
      "position": "Support / Oppose / Neutral",
      "justification": "Brief explanation of the stance",
      "sources": [
        { "name": "Source Name 1", "url": "https://..." },
        { "name": "Source Name 2", "url": "https://..." }
      ]
    }
  ],
  "laws": [
    {
      "number": "Senate Bill No. / House Bill No.",
      "title": "Law Title or Bill Title",
      "role": "Principal author / Co-author",
      "summary": "Short summary of what the bill or law does",
      "status": "Filed / Pending / Enacted",
      "link": "https://...",
      "sources": [
        { "name": "Source Name 1", "url": "https://..." },
        { "name": "Source Name 2", "url": "https://..." }
      ]
    }
  ],
  "policyFocus": [
    "Key area 1",
    "Key area 2",
    "Key area 3"
  ]
}


🛑 Return only valid JSON. No markdown. No commentary. No formatting outside the JSON object.
`;


    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a political data assistant returning JSON only. Do not hallucinate or make up information. If you are unsure, write "Source not found".' },
        { role: 'user', content: prompt }
      ],
      top_p: 1,
      temperature: 0,
    });

    let content = chatCompletion.choices[0].message?.content || '{}';
    content = content.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch response from OpenAI.' },
      { status: 500 }
    );
  }
}
