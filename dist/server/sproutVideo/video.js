'use strict';

const TOKEN_TTL = 300; // time to live in seconds --> 5 minutes

class Videos {
  constructor(request) {
    this._request = request;
  }

  get(id) {
    return this._request.get(`v1/videos/${id}`);
  }

  edit(id, { customPosterFrame, ...payload }) {
    return this._request.put(`v1/videos/${id}`, payload);
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

module.exports = Videos;
