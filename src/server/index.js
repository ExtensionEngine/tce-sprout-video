'use strict';

const { createClient } = require('./sproutVideo');
const { ELEMENT_STATE } = require('../shared');

async function beforeSave(asset, { config: { tce } }) {
  const { sproutVideoApiKey: apiKey } = tce;
  const client = createClient({ apiKey });
  const { id: videoId, playable } = asset.data.video;
  const isVideoPlayable = videoId && playable;
  if (!isVideoPlayable) return asset;
  await processCaption(asset, client);
  await processPosterFrame(asset, client);
  return asset;
}

function processCaption(asset, client) {
  const {
    video: { id: videoId },
    caption: { id: captionId, content, status }
  } = asset.data;
  delete asset.data.caption.content;
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

function processPosterFrame(asset, client) {
  const { id: videoId, customPosterFrame, posterFrameNumber } = asset.data.video;
  delete asset.data.video.customPosterFrame;
  delete asset.data.video.posterFrameNumber;
  if (!customPosterFrame || !posterFrameNumber) return;
  return client.videos.edit(videoId, { posterFrameNumber });
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
    .then(video => {
      const {
        embed_code: embedCode,
        selected_poster_frame_number: selectedPosterFrameIndex,
        assets: { poster_frames: posterFrames }
      } = video;
      asset.data.video.embedCode = embedCode.replace(/'/g, '"');
      asset.data.video.selectedPosterFrameIndex = selectedPosterFrameIndex;
      asset.data.video.posterFrames = posterFrames;
      return asset;
    })
    .catch(error => setAssetError(asset, error));
}

function setAssetError(asset, error) {
  asset.data.video.error = error.message;
  return asset;
}

module.exports = { beforeSave, afterSave, afterLoaded };
