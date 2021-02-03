'use strict';

const { createClient } = require('./sproutVideo');
const { ELEMENT_STATE } = require('../shared');

function beforeSave(asset, { config: { tce } }) {
  const { sproutVideoApiKey: apiKey } = tce;
  const client = createClient({ apiKey });
  const {
    video: { id: videoId, playable },
    caption: { id: captionId, content, status }
  } = asset.data;
  delete asset.data.caption.content;
  if (status === ELEMENT_STATE.DELETING) {
    return client.captions.delete(videoId, captionId)
      .then(() => {
        asset.data.caption.id = null;
        asset.data.caption.status = null;
        return asset;
      })
      .catch(err => setAssetError(asset, err, 'caption'));
  }
  const isVideoPlayable = videoId && playable;
  if (!isVideoPlayable || !content) return asset;
  return client.captions.create(videoId, { language: 'en', content })
    .then(({ id }) => {
      asset.data.caption.id = id;
      asset.data.caption.status = ELEMENT_STATE.UPLOADED;
      return asset;
    })
    .catch(err => setAssetError(asset, err, 'caption'));
}

async function afterSave(asset, { config: { tce } }) {
  const { id: videoId, playable, fileName, error, status } = asset.data.video;
  if (!fileName || playable) return asset;
  const { sproutVideoApiKey: apiKey } = tce;
  const client = createClient({ apiKey });
  const isEmptyOrError = error || !videoId || status !== ELEMENT_STATE.UPLOADED;
  if (!isEmptyOrError) startPollingPlayableStatus(asset, client);
  const { token } = await client.videos.getDelegatedToken();
  asset.data.video.token = token;
  asset.data.video.uploadUrl = client.videos.getUploadUrl();
  return asset;
}

async function startPollingPlayableStatus(asset, client) {
  const { id: videoId } = asset.data.video;
  const video = await client.videos.get(videoId);
  const isPlayable = video.state === 'deployed';
  if (!isPlayable) return setTimeout(() => startPollingPlayableStatus(asset, client), 5000);
  delete asset.data.video.token;
  delete asset.data.video.uploadUrl;
  asset.update({
    data: {
      ...asset.data,
      video: { ...asset.data.video, playable: true }
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

function setAssetError(asset, error, prop = 'video') {
  asset.data[prop].error = error.message;
  return asset;
}

module.exports = { beforeSave, afterSave, afterLoaded };
