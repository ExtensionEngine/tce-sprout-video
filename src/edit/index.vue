<template>
  <div class="tce-sprout-video">
    <v-alert
      v-if="globalErrorMessage"
      type="error"
      close-text="Close Alert"
      dismissible
      class="text-left">
      {{ globalErrorMessage }}
      <template #close="{ toggle }">
        <v-icon @click="clearGlobalError(toggle)">mdi-close-circle</v-icon>
      </template>
    </v-alert>
    <element-placeholder
      v-if="isEmpty"
      :is-focused="isFocused"
      :is-disabled="isDisabled"
      name="Sprout Video component"
      icon="mdi-video-image"
      active-placeholder="Use toolbar to upload the video"
      active-icon="mdi-arrow-up" />
    <div v-else>
      <error-message v-if="errorMessage" :message="errorMessage" />
      <progress-message v-if="!errorMessage && infoMessage" :message="infoMessage" />
      <div ref="player" class="player d-flex align-center justify-center"></div>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep';
import createUpload from '../upload';
import { ELEMENT_STATE } from '../shared';
import ElementPlaceholder from '../tce-core/ElementPlaceholder.vue';
import ErrorMessage from './ErrorMessage.vue';
import get from 'lodash/get';
import ProgressMessage from './ProgressMessage.vue';

const DEFAULT_ERROR_MSG = 'Something went wrong.';
const UPLOAD_FAILED_ERROR_MSG = 'Video upload failed. Please try again.';
const UPLOADING_MSG = 'Video is uploading... Do not leave the page.';
const PROCESSING_MSG = 'Video is processing...';

export default {
  name: 'tce-sprout-video',
  inject: ['$elementBus'],
  props: {
    element: { type: Object, required: true },
    isFocused: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false }
  },
  data: () => ({ file: null, error: null }),
  computed: {
    isEmpty() {
      const { error, fileName } = this.element.data.video;
      return !error && !fileName;
    },
    didUploadFail() {
      const { status } = this.element.data.video;
      return status === ELEMENT_STATE.UPLOADING && !this.file;
    },
    errorMessage() {
      const { error } = this.element.data.video;
      return this.didUploadFail ? UPLOAD_FAILED_ERROR_MSG : error;
    },
    infoMessage() {
      const { status, playable } = this.element.data.video;
      if (status === ELEMENT_STATE.UPLOADING) return UPLOADING_MSG;
      return playable ? '' : PROCESSING_MSG;
    },
    isPreparedToUpload() {
      const { token, uploadUrl } = this.element.data.video;
      return token && this.file && uploadUrl;
    },
    globalErrorMessage() {
      const { error } = this.element.data.caption;
      return this.error || error;
    }
  },
  methods: {
    appendVideo() {
      const { player } = this.$refs;
      if (!player) return;
      player.innerHTML = this.element.data.video?.embedCode;
    },
    upload() {
      const { uploadUrl: url, token } = this.element.data.video;
      createUpload({ url, file: this.file, token })
        .then(({ id }) => {
          this.file = null;
          this.$emit('save', {
            ...this.element.data,
            video: {
              ...this.element.data.video,
              id,
              status: ELEMENT_STATE.UPLOADED
            }
          });
        })
        .catch(err => {
          this.$emit('save', {
            ...this.element.data,
            video: {
              ...this.element.data.video,
              status: ELEMENT_STATE.UPLOADED,
              error: get(err, 'response.data.error', DEFAULT_ERROR_MSG),
              fileName: null
            }
          });
        });
    },
    clearGlobalError(toggle) {
      this.error = null;
      this.$emit('save', {
        ...this.element.data,
        caption: {
          ...this.element.data.caption,
          error: null,
          status: null
        }
      });
      toggle();
    }
  },
  watch: {
    'element.data.video.embedCode': 'appendVideo',
    'element.data.video.uploadUrl'() {
      if (this.isPreparedToUpload) this.upload();
    }
  },
  mounted() {
    this.appendVideo();

    this.$elementBus.on('save', ({ video, caption }) => {
      if (video) {
        this.file = video.file;
        delete video.file;
      }
      const data = cloneDeep(this.element.data);
      Object.assign(data.video, video);
      Object.assign(data.caption, caption);
      this.$emit('save', data);
    });

    this.$elementBus.on('error', ({ data }) => {
      this.error = get(data, 'error.message', DEFAULT_ERROR_MSG);
    });
  },
  components: { ElementPlaceholder, ErrorMessage, ProgressMessage }
};
</script>

<style lang="scss" scoped>
.tce-sprout-video {
  position: relative;
}

.player {
  min-height: 22.5rem;
  background: #000;
}
</style>
