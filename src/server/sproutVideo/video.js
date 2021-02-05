'use strict';

const FormData = require('form-data');

const TOKEN_TTL = 300; // time to live in seconds --> 5 minutes

class Videos {
  constructor(request) {
    this._request = request;
  }

  get(id) {
    return this._request.get(`v1/videos/${id}`);
  }

  async edit(id, { customPosterFrame: content, ...payload }) {
    if (!content) return this._request.put(`v1/videos/${id}`, payload);
    const base64Pattern = /^data:image\/(\w+);base64,/;
    const buffer = Buffer.from(content.replace(base64Pattern, ''), 'base64');
    const formData = new FormData();
    formData.append('custom_poster_frame', buffer);
    const contentLength = await getContentLength(formData);
    const headers = {
      ...formData.getHeaders(),
      'Content-Length': contentLength
    };
    return this._request.put(`v1/videos/${id}`, formData, { headers });
  }

  getDelegatedToken() {
    return this._request.post('v1/upload_tokens', { seconds_valid: TOKEN_TTL });
  }

  getUploadUrl() {
    const baseUrl = this._request.prefixUrl;
    const url = new URL('v1/videos', baseUrl);
    return url.href;
  }
}

function getContentLength(formData) {
  return new Promise((resolve, reject) => {
    formData.getLength((err, length) => err ? reject(err) : resolve(length));
  });
}

module.exports = Videos;
