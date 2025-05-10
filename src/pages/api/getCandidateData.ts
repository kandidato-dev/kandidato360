// pages/api/gpt-response.ts

import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!, 
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { candidateName } = req.body;

  if (!candidateName) {
    return res.status(400).json({ message: 'Candidate name is required.' });
  }

  const prompt = `
You are a political data assistant. Provide a structured JSON response containing comprehensive information about the following senatorial candidate, I also want you to include the sources of the information and it's URL links:
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
I want you to be very specific and detailed in your response. 
Candidate Name: ${candidateName}

Group the information into these sections:

{
  "id": "slugified-name",
  "fullName": "Full Candidate Name",
  "party": "Political Party",
  "age": Number,
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
      "justification": "Short explanation",
      sources": [
        { "name": "Source Name 1", "url": "https://..." },
         { "name": "Source Name 2", "url": "https://..." }
      ]
    }
  ],
  "laws": [
    {
      "number": "Housebill No. / Senate Bill No",
      "title": "Law Title/Bill Title",
      "role": "Principal author/co-author",
      "summary": "What the law does",
      "link": "https://ldr.senate.gov.ph/...",
      sources": [
         { "name": "Source Name 1", "url": "https://..." },
         { "name": "Source Name 2", "url": "https://..." }
      ]
    }
  ],
  "policyFocus": [
    "Key area 1",
    "Key area 2",
    "..."
  ]
}
 Be exhaustive in the laws section. Include **all publicly known and recorded laws and bills** authored, co-authored, or sponsored by the candidate in congress and senate. Focus on verified sources such as:
- Philippine Senate official site
- Inquirer, Rappler, GMA News, ABS-CBN, CNN Philippines, BBC News, Vlogs Blogs, Verified Sources, house of representatives official site
- Official press releases or law journals
Only include source URLs that:
- Exist publicly and match actual pages from reputable sources
- Are copied from known media (e.g., Philippine Senate, GMA News, Rappler, Inquirer, ABS-CBN, CNN Philippines, Congress of the Philippines)
- Do NOT make up fake links — if a real URL cannot be verified, write: "source URL not found"
Return only valid JSON, no commentary, no markdown.
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

    // Try to parse the returned content into JSON
    const parsed = JSON.parse(content || '{}');
    res.status(200).json(parsed);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to fetch response from OpenAI.' });
  }
}
