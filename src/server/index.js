'use strict';

const { createClient } = require('./sproutVideo');
const { ELEMENT_STATE } = require('../shared');
const omit = require('lodash/omit');

async function afterSave(asset, { config: { tce } }, options = {}) {
  const { playable, fileName, error, status } = asset.data;
  if (!fileName || playable || error) return asset;
  const { sproutVideoApiKey: apiKey } = tce;
  const client = createClient({ apiKey });
  if (status === ELEMENT_STATE.UPLOADED) {
    startPollingPlayableStatus(asset, client, options.context);
  }
  const { token } = await client.videos.getDelegatedToken();
  asset.data.token = token;
  asset.data.uploadUrl = client.videos.getUploadUrl();
  return asset;
}

async function startPollingPlayableStatus(asset, client, context) {
  const { videoId } = asset.data;
  const video = await client.videos.get(videoId);
  const isPlayable = video.state === 'deployed';
  if (!isPlayable) {
    return setTimeout(() => startPollingPlayableStatus(asset, client, context), 5000);
  }
  asset.update({
    data: { ...omit(asset.data, ['token', 'uploadUrl']), playable: true }
  }, { context });
}

function afterLoaded(asset, { config: { tce } }) {
  const { videoId, playable, error } = asset.data;
  const isUnavailableOrError = error || !videoId || !playable;
  if (isUnavailableOrError) return asset;
  const { sproutVideoApiKey: apiKey } = tce;
  const client = createClient({ apiKey });
  return client.videos.get(videoId)
    .then(({ embed_code: embedCode }) => {
      asset.data.embedCode = embedCode.replace(/'/g, '"');
      return asset;
    })
    .catch(error => setAssetError(asset, error));
}

function setAssetError(asset, error) {
  asset.data.error = error.message;
  return asset;
}

module.exports = { afterSave, afterLoaded };
