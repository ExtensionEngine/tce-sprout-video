'use strict';

const { createClient } = require('./sproutVideo');
const { ELEMENT_STATE } = require('../shared');
const omit = require('lodash/omit');

async function beforeSave(asset, { config: { tce } }) {
  const { sproutVideoApiKey: apiKey } = tce;
  const client = createClient({ apiKey });
  const { id: videoId, playable } = asset.data.video;
  if (!videoId || !playable) return asset;
  await processCaption(asset, client);
  deleteNonPersistentAssetProps(asset);
  return asset;
}

function processCaption(asset, client) {
  const {
    video: { id: videoId },
    caption: { id: captionId, content, status }
  } = asset.data;
  if (status === ELEMENT_STATE.DELETING) {
    return client.captions.delete(videoId, captionId)
      .then(() => {
        asset.data.caption.id = null;
        asset.data.caption.status = null;
      });
  }
  if (!content) return;
  return client.captions.create(videoId, { language: 'en', content })
    .then(({ id }) => {
      asset.data.caption.id = id;
      asset.data.caption.status = ELEMENT_STATE.UPLOADED;
    });
}

function deleteNonPersistentAssetProps(asset) {
  delete asset.data.caption.content;
  delete asset.data.video.embedCode;
}

async function afterSave(asset, { config: { tce } }) {
  const { playable, fileName, error, status } = asset.data.video;
  if (!fileName || playable || error) return asset;
  const { sproutVideoApiKey: apiKey } = tce;
  const client = createClient({ apiKey });
  if (status === ELEMENT_STATE.UPLOADED) startPollingPlayableStatus(asset, client);
  const { token } = await client.videos.getDelegatedToken();
  asset.data.video.token = token;
  asset.data.video.uploadUrl = client.videos.getUploadUrl();
  return asset;
}

async function startPollingPlayableStatus(asset, client) {
  const { id: videoId } = asset.data.video;
  const video = await client.videos.get(videoId);
  const isPlayable = video.state === 'deployed';
  if (!isPlayable) {
    return setTimeout(() => startPollingPlayableStatus(asset, client), 5000);
  }
  asset.update({
    data: {
      ...asset.data,
      video: {
        ...omit(asset.data.video, ['token', 'uploadUrl']),
        playable: true
      }
    }
  });
}

function afterLoaded(asset, { config: { tce } }) {
  const { id: videoId, playable, error } = asset.data.video;
  const isUnavailableOrError = error || !videoId || !playable;
  if (isUnavailableOrError) return asset;
  const { sproutVideoApiKey: apiKey } = tce;
  const client = createClient({ apiKey });
  return client.videos.get(videoId)
    .then(({ embed_code: embedCode }) => {
      asset.data.video.embedCode = embedCode.replace(/'/g, '"');
      return asset;
    })
    .catch(error => setAssetError(asset, error));
}

function setAssetError(asset, error) {
  asset.data.video.error = error.message;
  return asset;
}

module.exports = { beforeSave, afterSave, afterLoaded };
