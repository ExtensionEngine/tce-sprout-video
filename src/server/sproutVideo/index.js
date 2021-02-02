'use strict';

const Captions = require('./caption');
const Request = require('./request');
const Videos = require('./video');

const SPROUT_API_URL = 'https://api.sproutvideo.com';

function createClient({ apiKey }) {
  if (!apiKey) throw new Error('Sprout Api Key is required');
  const request = new Request({ apiKey, baseUrl: SPROUT_API_URL });
  return {
    videos: new Videos(request),
    captions: new Captions(request)
  };
}

module.exports = { createClient };
