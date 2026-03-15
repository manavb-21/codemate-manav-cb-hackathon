const router = require('express').Router();
const axios  = require('axios');

const JDOODLE_LANGS = {
  python:     { language: 'python3',     versionIndex: '3' },
  javascript: { language: 'nodejs',      versionIndex: '3' },
  cpp:        { language: 'cpp17',       versionIndex: '0' },
  java:       { language: 'java',        versionIndex: '3' }
};

router.post('/', async (req, res) => {
  const { code, language } = req.body;
  const lang = JDOODLE_LANGS[language] || JDOODLE_LANGS.python;
  console.log('Executing:', language, 'via JDoodle');
  try {
    const { data } = await axios.post('https://api.jdoodle.com/v1/execute', {
      clientId:     process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script:       code,
      language:     lang.language,
      versionIndex: lang.versionIndex
    });
    console.log('JDoodle response:', data);
    res.json({
      stdout:         data.output || '',
      stderr:         '',
      compile_output: '',
      status:         data.statusCode === 200 ? 'Accepted' : 'Error'
    });
  } catch (e) {
    console.error('Execution error:', e.response?.data || e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;