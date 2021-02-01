'use strict';

const apiVideo = require('@api.video/nodejs-sdk');

// const SANDBOX_URL = 'https://sandbox.api.video';
// const PRODUCTION_URL = 'https://ws.api.video';

function createClient({ apiKey, isSandBox }) {
  return isSandBox
    ? new apiVideo.ClientSandbox({ apiKey })
    : new apiVideo.Client({ apiKey });
}

async function getUploadUrl(client) {
  const baseUrl = client.baseUri;
  console.log('BaseUrl: ', baseUrl);
  const token = await client.tokens.generate();
  const url = new URL('upload', baseUrl);
  url.searchParams.set('token', token);
  return url.href;
}

module.exports = { createClient, getUploadUrl };
