'use strict';

const Caption = require('./caption');
const Request = require('./request');
const Video = require('./video');

const SPROUT_API_URL = 'https://api.sproutvideo.com/v1';

function createClient({ apiKey }) {
  if (!apiKey) throw new Error('Sprout Api Key is required');
  const request = new Request({ apiKey, baseUrl: SPROUT_API_URL });
  return {
    videos: new Video(request),
    captions: new Caption(request)
  };
}

module.exports = { createClient };
