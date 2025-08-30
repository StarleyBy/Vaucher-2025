const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function deployScript() {
  // Аутентификация с сервисным аккаунтом
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: ['https://www.googleapis.com/auth/script.projects']
  });

  const script = google.script({ version: 'v1', auth });

  // Читаем файлы проекта
  const files = [];
  const sourceFiles = fs.readdirSync('./');
  
  for (const file of sourceFiles) {
    if (file.endsWith('.gs') || file.endsWith('.js') || file.endsWith('.html') || file === 'appsscript.json') {
      const content = fs.readFileSync(file, 'utf8');
      let type;
      if (file.endsWith('.html')) {
        type = 'HTML';
      } else if (file === 'appsscript.json') {
        type = 'JSON';
      } else {
        type = 'SERVER_JS';
      }
      files.push({
        name: file.replace(/\.(gs|js)$/, ''),
        type: type,
        source: content
      });
    }
  }

  // Деплой
  try {
    const response = await script.projects.updateContent({
      scriptId: process.env.SCRIPT_ID,
      requestBody: { files }
    });
    console.log('Successfully deployed!');
  } catch (error) {
    console.error('Deploy failed:', error);
    process.exit(1);
  }
}

deployScript();