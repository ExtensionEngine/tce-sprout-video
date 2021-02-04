<template>
  <v-toolbar height="72" color="transparent" class="elevation-0">
    <v-toolbar-title class="pl-1 text-left">Sprout Video</v-toolbar-title>
    <v-toolbar-items class="mx-auto">
      <upload-btn
        v-if="!videoFileName"
        @change="uploadVideo"
        label="Upload Sprout video"
        accept="video/*"
        class="upload-btn" />
      <v-text-field
        v-else
        :value="videoFileName"
        readonly hide-details filled>
        <template #prepend-inner>
          <v-icon>mdi-video</v-icon>
        </template>
      </v-text-field>
      <upload-btn
        v-if="!captionFileName"
        @change="uploadCaption"
        :disabled="isCaptionUploadDisabled"
        label="Upload caption"
        accept="text/vtt"
        class="upload-btn" />
      <v-text-field
        v-if="captionFileName"
        :value="captionFileName"
        readonly hide-details filled>
        <template #prepend-inner>
          <v-icon>mdi-closed-caption</v-icon>
        </template>
        <template #append>
          <confirmation-dialog v-slot="{ on, attrs }" @confirm="deleteCaption">
            <v-icon
              v-on="on"
              v-bind="attrs"
              class="delete-caption"
              color="error">
              mdi-delete
            </v-icon>
          </confirmation-dialog>
        </template>
      </v-text-field>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
import ConfirmationDialog from './ConfirmationDialog.vue';
import { ELEMENT_STATE } from '../shared';
import UploadBtn from './UploadBtn.vue';

export default {
  name: 'tce-sprout-video-toolbar',
  inject: ['$elementBus'],
  props: {
    element: { type: Object, required: true }
  },
  computed: {
    videoFileName: ({ element }) => element.data.video?.fileName,
    captionFileName: ({ element }) => element.data.caption?.fileName,
    isCaptionUploadDisabled() {
      const { id: videoId, playable } = this.element.data.video;
      return !videoId || !playable || this.captionFileName;
    }
  },
  methods: {
    uploadVideo(e) {
      const [file] = e.target.files;
      this.$elementBus.emit('save', {
        video: {
          file,
          fileName: file.name,
          status: ELEMENT_STATE.UPLOADING,
          error: null
        }
      });
    },
    uploadCaption(e) {
      const [file] = e.target.files;
      const fileReader = new window.FileReader();
      fileReader.readAsText(file);
      fileReader.addEventListener('load', e => {
        this.$elementBus.emit('save', {
          caption: {
            fileName: file.name,
            content: e.target.result,
            status: ELEMENT_STATE.UPLOADING
          }
        });
      });
    },
    deleteCaption() {
      this.$elementBus.emit('save', {
        caption: {
          fileName: null,
          status: ELEMENT_STATE.DELETING
        }
      });
    }
  },
  components: { ConfirmationDialog, UploadBtn }
};
</script>

<style lang="scss" scoped>
.v-toolbar__title {
  min-width: 23.875rem;
}

.upload-btn ::v-deep .v-btn {
  height: 100%;

  &__content {
    padding: 1.5rem 0;
  }
}

.v-text-field {
  min-width: 21.875rem;
  margin: 0.5rem 0.75rem 0 1.75rem;
}
</style>
