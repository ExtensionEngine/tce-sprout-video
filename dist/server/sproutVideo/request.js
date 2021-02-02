'use strict';

const axios = require('axios');
const httpError = require('http-errors');

class Request {
  constructor({ apiKey, baseUrl }) {
    this._client = axios.create({
      baseURL: baseUrl,
      headers: {
        'SproutVideo-Api-Key': apiKey
      }
    });
  }

  get(url, options = {}) {
    return this._client.get(url, options)
      .then(getResponseData)
      .catch(toHttpError);
  }

  post(url, data, options = {}) {
    return this._client.post(url, data, options)
      .then(getResponseData)
      .catch(toHttpError);
  }

  delete(url, options = {}) {
    return this._client.delete(url, options);
  }

  get prefixUrl() {
    return this._client.defaults.baseURL;
  }
}

const getResponseData = res => res.data;

function toHttpError(error) {
  const { response } = error;
  if (!response) return Promise.reject(error);
  const { status, data: { error: message } } = response;
  return Promise.reject(httpError(status, message));
}

module.exports = Request;
