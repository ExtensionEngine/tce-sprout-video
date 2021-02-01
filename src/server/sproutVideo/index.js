'use strict';

const Request = require('./request');
const Videos = require('./video');

const SPROUT_API_URL = 'https://api.sproutvideo.com';

function createClient({ apiKey }) {
  const baseUrl = SPROUT_API_URL;
  if (!apiKey) throw new Error('Video Api Key is required');
  const request = new Request({ apiKey, baseUrl });
  return { videos: new Videos(request) };
}

module.exports = { createClient };
