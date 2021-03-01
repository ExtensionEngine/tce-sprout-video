'use strict';

const camelCaseKeys = require('camelcase-keys');
const FormData = require('form-data');

const TOKEN_TTL = 300; // time to live in seconds --> 5 minutes

class Video {
  constructor(request) {
    this._request = request;
  }

  get(id) {
    return this._request.get(`videos/${id}`)
      .then(res => camelCaseKeys(res, { deep: true }))
      .then(({ selectedPosterFrameNumber, ...rest }) => ({
        ...rest,
        selectedPosterFrameIndex: selectedPosterFrameNumber
      }));
  }

  async editPosterFrame(id, { customPosterFrame: content, posterFrameNumber }) {
    if (!content) {
      return this._request.put(
        `videos/${id}`,
        { posterframe_number: posterFrameNumber }
      );
    }
    const base64Pattern = /^data:image\/(\w+);base64,/;
    const buffer = Buffer.from(content.replace(base64Pattern, ''), 'base64');
    const formData = new FormData();
    formData.append('custom_poster_frame', buffer);
    const contentLength = await getContentLength(formData);
    const headers = {
      ...formData.getHeaders(),
      'Content-Length': contentLength
    };
    return this._request.put(`videos/${id}`, formData, { headers });
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

function getContentLength(formData) {
  return new Promise((resolve, reject) => {
    formData.getLength((err, length) => err ? reject(err) : resolve(length));
  });
}

module.exports = Video;
