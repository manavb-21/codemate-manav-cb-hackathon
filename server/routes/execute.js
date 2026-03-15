const router = require('express').Router();
const axios = require('axios');

const LANGUAGE_IDS = { python: 71, cpp: 54, java: 62, javascript: 63 };

router.post('/', async (req, res) => {
  const { code, language } = req.body;
  try {
    const { data: submission } = await axios.post(
      `${process.env.JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
      { source_code: code, language_id: LANGUAGE_IDS[language] || 71 },
      { headers: { 'X-RapidAPI-Key': process.env.JUDGE0_KEY, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' } }
    );
    res.json({ stdout: submission.stdout, stderr: submission.stderr, status: submission.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;