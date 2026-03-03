// src/utils/token.js
const crypto = require('crypto');

function generateToken(payload) {
  const data = JSON.stringify(payload);
  const token = crypto.randomBytes(32).toString('hex');
  return `${token}.${Buffer.from(data).toString('base64')}`;
}

function parseToken(token) {
  try {
    const [tokenPart, dataPart] = token.split('.');
    const data = JSON.parse(Buffer.from(dataPart, 'base64').toString());
    return data;
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateToken,
  parseToken,
};
