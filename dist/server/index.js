'use strict';

const { createClient } = require('./sproutVideo');
const { ELEMENT_STATE } = require('../shared');

function beforeSave(asset) {
  return asset;
}

async function afterSave(asset, { config: { tce } }) {
  const { videoId, playable, fileName, error, status } = asset.data;
  if (!fileName || playable) return asset;
  const { sproutVideoApiKey: apiKey } = tce;
  const client = createClient({ apiKey });
  const isEmptyOrError = error || !videoId || status !== ELEMENT_STATE.UPLOADED;
  if (!isEmptyOrError) startPollingPlayableStatus(asset, client);
  const { token } = await client.videos.getDelegatedToken();
  asset.data.token = token;
  asset.data.uploadUrl = client.videos.getUploadUrl();
  return asset;
}

async function startPollingPlayableStatus(asset, client) {
  const { videoId } = asset.data;
  const video = await client.videos.get(videoId);
  const isPlayable = video.state === 'deployed';
  if (!isPlayable) return setTimeout(() => startPollingPlayableStatus(asset, client), 5000);
  delete asset.data.token;
  delete asset.data.uploadUrl;
  asset.update({ data: { ...asset.data, playable: true } });
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

module.exports = { beforeSave, afterSave, afterLoaded };
