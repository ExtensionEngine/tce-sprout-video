'use strict';

const { createClient } = require('./sproutVideo');
const { ELEMENT_STATE } = require('../shared');

async function beforeSave(asset, { config: { tce } }) {
  const { sproutVideoApiKey: apiKey } = tce;
  const client = createClient({ apiKey });
  const { id: videoId, playable } = asset.data.video;
  if (!videoId || !playable) return deleteTemporaryAssetProps(asset);
  await processCaption(asset, client);
  return deleteTemporaryAssetProps(asset);
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

function deleteTemporaryAssetProps(asset) {
  delete asset.data.caption.content;
  delete asset.data.video.embedCode;
  delete asset.data.video.token;
  delete asset.data.video.uploadUrl;
  return asset;
}

async function afterSave(asset, { config: { tce } }, options = {}) {
  const { playable, fileName, error, status } = asset.data.video;
  if (!fileName || playable || error) return asset;
  const { sproutVideoApiKey: apiKey } = tce;
  const client = createClient({ apiKey });
  if (status === ELEMENT_STATE.UPLOADED) {
    startPollingPlayableStatus(asset, client, options.context);
  }
  const { token } = await client.videos.getDelegatedToken();
  asset.data.video.token = token;
  asset.data.video.uploadUrl = client.videos.getUploadUrl();
  return asset;
}

async function startPollingPlayableStatus(asset, client, context) {
  const { id: videoId } = asset.data.video;
  const video = await client.videos.get(videoId);
  const isPlayable = video.state === 'deployed';
  if (!isPlayable) {
    return setTimeout(() => startPollingPlayableStatus(asset, client, context), 5000);
  }
  asset.update({
    data: {
      ...asset.data,
      video: { ...asset.data.video, playable: true }
    }
  // });
  // }, { context: { userId: context.userId } });
  }, { context });
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
