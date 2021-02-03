'use strict';

const axios = require('axios');
const { DEFAULT_ERROR_MSG } = require('../../server');
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
  console.log('Stringified error: ', stringifyError(message));
  return Promise.reject(httpError(status, stringifyError(message)));
}

function stringifyError(error) {
  if (!error) return DEFAULT_ERROR_MSG;
  if (typeof error === 'string') return error;
  const errors = error.errors || {};
  return Object.keys(errors)
    .reduce((message, prop) => `${message}${prop}: ${errors[prop]}. `, '');
}

module.exports = Request;
