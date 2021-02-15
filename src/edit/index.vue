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
      <preview-overlay :show="showPreviewOverlay">
        Double click to preview
      </preview-overlay>
      <error-message v-if="errorMessage" :message="errorMessage" />
      <progress-message v-else-if="infoMessage" :message="infoMessage" />
      <sprout-player v-bind="element.data" />
    </div>
  </div>
</template>

<script>
import createUpload from '../upload';
import { ELEMENT_STATE } from '../shared';
import ElementPlaceholder from '../tce-core/ElementPlaceholder.vue';
import ErrorMessage from './ErrorMessage.vue';
import get from 'lodash/get';
import PreviewOverlay from '../tce-core/PreviewOverlay.vue';
import ProgressMessage from './ProgressMessage.vue';
import SproutPlayer from './SproutPlayer.vue';

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
      return !playable && PROCESSING_MSG;
    },
    isReadyToUpload() {
      const { token, uploadUrl } = this.element.data;
      return token && this.file && uploadUrl;
    },
    isUnfocus() {
      const { isDisabled, isFocused } = this;
      return !isDisabled && !isFocused;
    },
    showPreviewOverlay() {
      const { isUnfocus, errorMessage, infoMessage } = this;
      return !errorMessage && !infoMessage && isUnfocus;
    }
  },
  methods: {
    upload() {
      const { uploadUrl: url, token } = this.element.data;
      return createUpload({ url, file: this.file, token })
        .then(({ id }) => {
          this.file = null;
          this.$emit('save', {
            ...this.element.data,
            videoId: id,
            status: ELEMENT_STATE.UPLOADED
          });
        })
        .catch(err => {
          this.$emit('save', {
            ...this.element.data,
            error: get(err, 'response.data.error', DEFAULT_ERROR_MSG),
            status: null,
            fileName: null
          });
        });
    },
    reload() {
      const { playable } = this.element.data;
      if (playable) this.$emit('save', this.element.data);
    }
  },
  watch: {
    'element.data.uploadUrl'() {
      if (this.isReadyToUpload) this.upload();
    },
    'isUnfocus'(newValue, oldValue) {
      if (newValue && !oldValue) this.reload();
    }
  },
  mounted() {
    this.$elementBus.on('save', ({ file }) => {
      this.file = file;
      this.$emit('save', {
        ...this.element.data,
        fileName: file.name,
        error: null,
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
  components: {
    ElementPlaceholder,
    ErrorMessage,
    ProgressMessage,
    SproutPlayer,
    PreviewOverlay
  }
};
</script>

<style lang="scss" scoped>
.tce-sprout-video {
  position: relative;
}
</style>
