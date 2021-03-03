'use strict';

const TOKEN_TTL = 300; // time to live in seconds --> 5 minutes

class Video {
  constructor(request) {
    this._request = request;
  }

  get(id) {
    return this._request.get(`videos/${id}`);
  }

  getDelegatedToken() {
    return this._request.post('upload_tokens', { seconds_valid: TOKEN_TTL });
  }

  getUploadUrl() {
    const baseUrl = this._request.prefixUrl;
    const url = new URL('v1/videos', baseUrl);
    return url.href;
  }
}

module.exports = Video;
