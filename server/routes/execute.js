const router = require('express').Router();
const axios  = require('axios');

const LANGUAGE_IDS = { python: 71, javascript: 63, cpp: 54, java: 62 };

router.post('/', async (req, res) => {
  const { code, language } = req.body;
  try {
    const { data } = await axios.post(
      `${process.env.JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      { source_code: code, language_id: LANGUAGE_IDS[language] || 71 },
      { headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.JUDGE0_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }}
    );
    res.json({
      stdout: data.stdout || '',
      stderr: data.stderr || '',
      compile_output: data.compile_output || '',
      status: data.status?.description || 'Unknown'
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;