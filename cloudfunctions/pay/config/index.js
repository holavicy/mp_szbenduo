const fs = require('fs');
const path = require('path');
const CERT_PATH = path.join(__dirname, './apiclient_cert.p12')

module.exports = {
  ENV: 'benduo-zv240', // TCB环境ID
  MCHID: '1584585131',//商户id
  KEY: 'li116416#',
  CERT_FILE_CONTENT: fs.existsSync(CERT_PATH) ? fs.readFileSync(CERT_PATH) : null,
  TIMEOUT: 10000 // 毫秒
};

