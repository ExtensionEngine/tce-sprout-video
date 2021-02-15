<template>
  <div class="tce-sprout-video">
    <v-alert
      v-if="error"
      type="error"
      dismissible
      class="text-left">
      {{ error }}
    </v-alert>
    <element-placeholder
      v-if="isEmpty"
      :is-focused="isFocused"
      :is-disabled="isDisabled"
      name="Sprout Video component"
      icon="mdi-video-image"
      active-placeholder="Use toolbar to upload the video"
      active-icon="mdi-arrow-up" />
    <div v-else class="player-container">
      <error-message v-if="errorMessage" :message="errorMessage" />
      <progress-message v-else-if="infoMessage" :message="infoMessage" />
      <sprout-player v-bind="element.data.video" />
    </div>
  </div>
</template>

<script>
import { DEFAULT_ERROR_MSG, ELEMENT_STATE } from '../shared';
import cloneDeep from 'lodash/cloneDeep';
import createUpload from '../upload';
import ElementPlaceholder from '../tce-core/ElementPlaceholder.vue';
import ErrorMessage from './ErrorMessage.vue';
import get from 'lodash/get';
import omit from 'lodash/omit';
import ProgressMessage from './ProgressMessage.vue';
import SproutPlayer from './SproutPlayer.vue';

const UPLOAD_FAILED_ERROR_MSG = 'Video upload failed. Please try again.';
const UPLOADING_MSG = 'Video is uploading. Please do not leave the page.';
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
      return !playable && PROCESSING_MSG;
    },
    isReadyToUpload() {
      const { token, uploadUrl } = this.element.data.video;
      return token && this.file && uploadUrl;
    }
  },
  methods: {
    upload() {
      const { uploadUrl: url, token } = this.element.data.video;
      return createUpload({ url, file: this.file, token })
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
              error: get(err, 'response.data.error', DEFAULT_ERROR_MSG),
              status: null,
              fileName: null
            }
          });
        });
    }
  },
  watch: {
    'element.data.video.uploadUrl'() {
      if (this.isReadyToUpload) this.upload();
    }
  },
  mounted() {
    this.$elementBus.on('save', ({ video, caption }) => {
      this.file = get(video, 'file', null);
      const data = cloneDeep(this.element.data);
      Object.assign(data.video, omit(video, ['file']));
      Object.assign(data.caption, caption);
      this.$emit('save', data);
    });

    this.$elementBus.on('error', error => {
      this.error = get(error, 'response.data.error.message', DEFAULT_ERROR_MSG);
    });
  },
  components: {
    ElementPlaceholder,
    ErrorMessage,
    ProgressMessage,
    SproutPlayer
  }
};
</script>

<style lang="scss" scoped>
.player-container {
  position: relative;
}
</style>
