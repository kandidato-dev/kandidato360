import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { candidateA, candidateB } = req.body;

  if (!candidateA || !candidateB) {
    return res.status(400).json({ error: 'Both candidate names are required' });
  }

  const prompt = `
You are a political data assistant. Compare the following two Philippine senatorial candidates using structured JSON. The comparison should focus on the following categories. I also want you to include the sources of the information and it's URL links:
Please display list of bills and laws that the candidate has sponsored or co-sponsored.
Please list all the laws and bills that the candidate has authored, co-authored, or sponsored based on publicly available records. Be exhaustive if possible and cite the official Senate records or reputable news sources for each.
Please display list of stances of the candidate on the issues, give the issue title and the position of the candidate. Please list down the sources of the information and it's URL links.
Here are the list of issues that you can use as reference:
-Same-sex Marriage
-Death Penalty
-Legalization of Abortion
-Divorse
-Banning of Political Dynasty
-Legalization of Medical Marijuana
-Federalism
-War on Drugs
-Abortion
-Sogie Bill

Return the response in the following JSON format:

{
  "candidates": [
    {
      "id": "slugified-name",
      "fullName": "Full Candidate Name",
      "party": "Latest Political Party the candidate belongs to",
      "background": {
        "educationalBackground": "...",
        "professionalExperience": "...",
        "governmentPositionsHeld": "...",
        "notableAccomplishments": "...",
        "criminalRecords": "..."
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
      ],
      "policyFocus": [
        "Key policy 1",
        "Key policy 2"
      ]
    },
    {
      "id": "second-candidate-id",
      "fullName": "...",
      // same structure as above
    }
  ]
}

Candidate A: ${candidateA}
Candidate B: ${candidateB}

Only include source URLs that:
- Exist publicly and match actual pages from reputable sources
- Are copied from known media (e.g., Philippine Senate, GMA News, Rappler, Inquirer, ABS-CBN)
- Do NOT make up fake links — if a real URL cannot be verified, write: "source URL not found"
Return only valid JSON. No markdown, no commentary.
`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a political data assistant returning JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
    });

    const content = chatCompletion.choices[0].message?.content;
    const parsed = JSON.parse(content || '{}');
    res.status(200).json(parsed);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to fetch response from OpenAI.' });
  }
} 