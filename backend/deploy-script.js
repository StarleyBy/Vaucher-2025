const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function deployScript() {
  console.log('Starting deployment...');
  console.log('Script ID:', process.env.SCRIPT_ID);
  
  if (!process.env.SCRIPT_ID) {
    console.error('SCRIPT_ID environment variable is not set!');
    process.exit(1);
  }

  // Аутентификация с сервисным аккаунтом
  const auth = new google.auth.GoogleAuth({
    keyFile: 'service-account.json',
    scopes: [
      'https://www.googleapis.com/auth/script.projects',
      'https://www.googleapis.com/auth/script.deployments'
    ]
  });

  const authClient = await auth.getClient();
  const script = google.script({ version: 'v1', auth: authClient });

  // Читаем только нужные файлы (исключаем deploy-script.js)
  const files = [];
  const sourceFiles = fs.readdirSync('./');
  
  for (const file of sourceFiles) {
    // Исключаем файлы деплоя и node_modules
    if (file === 'deploy-script.js' || 
        file === 'service-account.json' || 
        file.startsWith('node_modules') ||
        file === 'package.json' ||
        file === 'package-lock.json') {
      continue;
    }
    
    if (file.endsWith('.gs') || file.endsWith('.js') || file.endsWith('.html') || file === 'appsscript.json') {
      const content = fs.readFileSync(file, 'utf8');
      let type;
      let name;
      
      if (file.endsWith('.html')) {
        type = 'HTML';
        name = file.replace('.html', '');
      } else if (file === 'appsscript.json') {
        type = 'JSON';
        name = 'appsscript';
      } else {
        type = 'SERVER_JS';
        name = file.replace(/\.(gs|js)$/, '');
      }
      
      files.push({
        name: name,
        type: type,
        source: content
      });
      
      console.log(`Added file: ${file} as ${name} (${type})`);
    }
  }

  console.log(`Total files to deploy: ${files.length}`);

  // Деплой
  try {
    const response = await script.projects.updateContent({
      scriptId: process.env.SCRIPT_ID,
      requestBody: { files }
    });
    console.log('Successfully deployed!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('Deploy failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

deployScript();