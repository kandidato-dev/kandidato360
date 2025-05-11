import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { candidateA, candidateB } = await request.json();

    if (!candidateA || !candidateB) {
      return NextResponse.json(
        { error: 'Both candidate names are required' },
        { status: 400 }
      );
    }

    const prompt = `
    You are a political data analyst assistant. Compare the following two Philippine senatorial candidates using structured JSON. The comparison should include four major categories:
    If limited public data exists, summarize known political affiliations, party platform (if available), and provide a short generic bio template including possible motivations for candidacy.
    Do not hallucinate unsupported accomplishments or legislative history. If sources are unavailable, say "no verifiable record found" rather than "source not found".



    
    1. Background
    2. Stances on social/political issues
    3. Laws and bills authored, co-authored, or sponsored
    4. Policy focus
    
    Please include the senator bio link if available fromm the https://web.senate.gov.ph/senators/sen_bio/
    📌 IMPORTANT INSTRUCTIONS:
    
    - For the **laws and bills** section, provide **at least 5–10 publicly recorded items per candidate**. These must include **enacted laws and pending or filed bills** from Senate records or reliable news sources.
    - Be as **exhaustive as possible**. If more than 10 entries are known and verifiable, include them all.
    - For each law/bill, include: full title, short summary, role (author/co-author/sponsor), current status (enacted, pending, filed), and citation sources **with real, valid URLs only**. If uncertain, write "Source not found"
    - If a real URL can't be confirmed, use "source URL not found" — never guess.
    
    🗳️ Social Issues for Stances:
    You must include the candidate's known or reported stance on the following:
    - Same-sex Marriage
    - Death Penalty
    - Legalization of Abortion
    - Divorce
    - Banning of Political Dynasty
    - Legalization of Medical Marijuana
    - Federalism
    - War on Drugs
    - SOGIE Bill
    
    💡 For each issue, return:
    - "issue": topic name
    - "position": Support / Oppose / Neutral
    - "justification": brief explanation of the candidate's reasoning
    - "sources": array of { "name": "Source Name", "url": "https://..." }
    - Prioritize sources from: https://web.senate.gov.ph/lis/leg_sys.aspx, https://web.senate.gov.ph, Congress.gov.ph,



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






    Only list laws and bills the candidate is explicitly known to have authored, co-authored, or sponsored. If uncertain or unverified, do not include the item.
    If the source = "source URL not found", flag or discard the law
    📦 Return the response in this JSON format:
    
    {
      "candidates": [
        {
          "id": "slugified-name",
          "fullName": "Full Candidate Name",
          "party": "Most recent known political affiliation",
         "senatorBioLink": "https://web.senate.gov.ph/senators/sen_bio/{senatorName}.asp",
          "age": "Age in years",
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
              "position": "Support/Oppose/Neutral",
              "justification": "...",
              "sources": [
                { "name": "Source Name", "url": "https://..." }
              ]
            }
          ],
          "laws": [
            {
              "title": "Law Title",
              "role": "Principal author / Co-author",
              "summary": "...",
              "status": "Enacted / Pending / Filed",
              "sources": [
                { "name": "Source Name", "url": "https://..." }
              ]
            }
            // at least 5 per candidate
          ],
          "policyFocus": [
            "Key policy 1",
            "Key policy 2",
            "Key policy 3"
          ]
        },
        {
          "id": "second-candidate-id"
          // same structure
        }
      ]
    }
    The candidate is a Philippine senatorial candidate for the 2025 elections.
    Candidate A: ${candidateA}
    Candidate B: ${candidateB}
    
    📌 Constraints:
    - All URLs must be real and publicly accessible.
    - No fake citations. If uncertain, return "source URL not found".
    - Return only valid JSON. No commentary, markdown, or formatting.
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