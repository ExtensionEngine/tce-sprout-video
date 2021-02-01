<template>
  <div class="tce-sprout-video">
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
  data: () => ({ file: null }),
  computed: {
    isEmpty() {
      const { error, fileName } = this.element.data;
      return !error && !fileName;
    },
    didUploadFail() {
      const { status } = this.element.data;
      return status === ELEMENT_STATE.UPLOADING && !this.file;
    },
    errorMessage() {
      const { error } = this.element.data;
      return this.didUploadFail ? UPLOAD_FAILED_ERROR_MSG : error;
    },
    infoMessage() {
      const { status, playable } = this.element.data;
      if (status === ELEMENT_STATE.UPLOADING) return UPLOADING_MSG;
      return playable ? '' : PROCESSING_MSG;
    },
    isPreparedToUpload() {
      const { token, uploadUrl } = this.element.data;
      return token && this.file && uploadUrl;
    }
  },
  methods: {
    appendVideo() {
      const { player } = this.$refs;
      if (!player) return;
      player.innerHTML = this.element.data?.embedCode;
    },
    upload() {
      const { uploadUrl: url, token } = this.element.data;
      createUpload({ url, file: this.file, token })
        .then(({ id }) => {
          this.file = null;
          this.$emit('save', {
            ...this.element.data,
            videoId: id,
            status: ELEMENT_STATE.UPLOADED
          });
        })
        .catch(err => this.$elementBus.emit('error', err.response));
    }
  },
  watch: {
    'element.data.embedCode': 'appendVideo',
    'element.data.uploadUrl'() {
      if (this.isPreparedToUpload) this.upload();
    }
  },
  mounted() {
    this.appendVideo();

    this.$elementBus.on('save', ({ file }) => {
      this.file = file;
      this.$emit('save', {
        ...this.element.data,
        fileName: file.name,
        status: ELEMENT_STATE.UPLOADING
      });
    });

    this.$elementBus.on('error', ({ data }) => {
      this.$emit('save', {
        ...this.element.data,
        error: get(data, 'error.message', DEFAULT_ERROR_MSG)
      });
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
  height: 25.625rem;
  background: #000;
}
</style>
