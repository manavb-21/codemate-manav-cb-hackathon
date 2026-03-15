const router = require('express').Router();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chat = async (prompt) => {
  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile', // free + very capable
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024
  });
  return res.choices[0].message.content;
};

// Code Summary
router.post('/summary', async (req, res) => {
  const { code, language } = req.body;
  try {
    const text = await chat(`Analyze this ${language} code and provide:
1. **What it does** (2-3 sentences)
2. **Key concepts used** (bullet points)
3. **Potential improvements** (bullet points)
4. **Complexity** (time/space if relevant)

Code:
\`\`\`${language}
${code}
\`\`\`
Keep it concise and beginner-friendly.`);
    res.json({ summary: text });
  } catch (e) {
    console.error('AI error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// AI Plagiarism detector
router.post('/detect-ai', async (req, res) => {
  const { code, language } = req.body;
  try {
    const text = await chat(`Analyze this ${language} code and determine if it was likely AI-generated or copy-pasted.

Look for:
- Overly perfect formatting
- Generic variable names  
- No personal coding style
- Patterns typical of AI-generated code

Code:
\`\`\`${language}
${code}
\`\`\`

Respond with JSON only, no extra text:
{
  "likelihood": "low|medium|high",
  "score": 0-100,
  "reasons": ["reason1", "reason2"],
  "verdict": "one sentence verdict"
}`);
    const json = JSON.parse(text.replace(/\`\`\`json|\`\`\`/g, '').trim());
    res.json(json);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Debug assistant
router.post('/debug', async (req, res) => {
  const { code, error, language } = req.body;
  try {
    const text = await chat(`I have this ${language} code with an error. Help me debug it.

Code:
\`\`\`${language}
${code}
\`\`\`

Error output:
${error || 'No error output, code just not working as expected'}

Provide:
1. **Root cause** of the error
2. **Fixed code**
3. **Explanation** of what was wrong`);
    res.json({ debug: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Progress evaluator (teacher feature)
router.post('/evaluate', async (req, res) => {
  const { code, language, studentName } = req.body;
  try {
    const text = await chat(`Evaluate this student's (${studentName}) ${language} code submission:

\`\`\`${language}
${code}
\`\`\`

Provide a teacher-friendly evaluation:
1. **Grade** (A/B/C/D/F with reason)
2. **Strengths** (what they did well)
3. **Weaknesses** (what needs improvement)
4. **Feedback** (encouraging, constructive)
5. **Next steps** (what to learn next)`);
    res.json({ evaluation: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;