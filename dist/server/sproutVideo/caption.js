'use strict';

class Captions {
  constructor(request) {
    this._request = request;
  }

  create(videoId, payload) {
    return this._request.post(`videos/${videoId}/subtitles`, payload);
  }

  delete(videoId, captionId) {
    return this._request.delete(`videos/${videoId}/subtitles/${captionId}`);
  }
}

module.exports = Captions;
